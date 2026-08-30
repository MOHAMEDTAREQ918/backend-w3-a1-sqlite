const express = require('express');
const Database = require('better-sqlite3');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// 1. Database Connection & Setup
const db = new Database('tasks.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done BOOLEAN DEFAULT 0
  )
`);

// 2. Initial Seeding
const count = db.prepare('SELECT COUNT(*) as count FROM tasks').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)');
  insert.run('Buy groceries', 0);
  insert.run('Finish Backend Assignment W3-A1', 0);
  insert.run('Learn SQLite Basics', 1);
}

// 3. API Endpoints
app.get('/', (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// GET /tasks
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all();
  res.json(tasks.map(t => ({ ...t, done: Boolean(t.done) })));
});

// GET /tasks/:id
app.get('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json({ ...task, done: Boolean(task.done) });
});

// POST /tasks
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  const stmt = db.prepare('INSERT INTO tasks (title, done) VALUES (?, 0)');
  const result = stmt.run(title.trim());
  res.status(201).json({ id: result.lastInsertRowid, title: title.trim(), done: false });
});

// PUT /tasks/:id
app.put('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, done } = req.body;
  const newTitle = title !== undefined ? title : task.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : task.done;

  db.prepare('UPDATE tasks SET title = ?, done = ? WHERE id = ?').run(newTitle, newDone, req.params.id);
  res.json({ id: Number(req.params.id), title: newTitle, done: Boolean(newDone) });
});

// DELETE /tasks/:id
app.delete('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

// 4. Swagger Documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: { title: "Task API with SQLite", version: "1.0.0" },
  paths: {
    "/tasks": {
      get: { summary: "Get all tasks", responses: { "200": { description: "OK" } } },
      post: { summary: "Create a task", responses: { "201": { description: "Created" } } }
    }
  }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
