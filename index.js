const express = require('express');
const { Pool } = require('pg');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(express.json());

// 1. Connection using DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:dev@db:5432/tasks',
});

// 2. Initialize Database Table & Initial Seed
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        done BOOLEAN DEFAULT false
      )
    `);

    const res = await pool.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(res.rows[0].count, 10) === 0) {
      await pool.query(
        'INSERT INTO tasks (title, done) VALUES ($1, $2), ($3, $4), ($5, $6)',
        ['Buy groceries', false, 'Finish Backend Assignment W3-A3', false, 'Learn Docker & Postgres', true]
      );
    }
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initDb();

// 3. API Endpoints
app.get('/', (req, res) => {
  res.json({ name: "Task API with Postgres", version: "1.0", endpoints: ["/tasks"] });
});

// Real Health Check Endpoint (Stage Stretch)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected" });
  }
});

// GET /tasks
app.get('/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /tasks/:id
app.get('/tasks/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
      [title.trim(), false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id
app.put('/tasks/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    const task = check.rows[0];
    const { title, done } = req.body;
    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? done : task.done;

    const result = await pool.query(
      'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
      [newTitle, newDone, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
  try {
    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ error: "Task not found" });

    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Swagger Documentation
const swaggerDocument = {
  openapi: "3.0.0",
  info: { title: "Task API with Postgres & Docker", version: "1.0.0" },
  paths: {
    "/tasks": {
      get: { summary: "Get all tasks", responses: { "200": { description: "OK" } } },
      post: { summary: "Create a task", responses: { "201": { description: "Created" } } }
    }
  }
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
