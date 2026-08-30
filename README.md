# FlyRank Backend Track - W3·A1: Connecting CRUD to SQLite Database

## Overview
This project upgrades the In-memory CRUD API from Assignment 1 into a fully persistent API backed by an **SQLite** database (`tasks.db`).
The core API endpoints (`GET`, `POST`, `PUT`, `DELETE`), status codes (`200`, `201`, `204`, `400`, `404`), and JSON response payloads remain 100% identical.

---

## Why SQLite?
* **Zero-Config Persistence:** SQLite requires no separate server setup; it runs completely as a local single-file database (`tasks.db`).
* **Automatic Initialization:** The application checks for `tasks.db` on launch and creates both the file and the `tasks` schema automatically if missing.

---

## Database Schema & Seeding
The application manages a single table named `tasks`:

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique Task ID |
| `title` | TEXT | NOT NULL | Task Description |
| `done` | BOOLEAN | DEFAULT 0 | Completion Status (0=False, 1=True) |

### Idempotent Initial Seeding
Upon application boot, a query checks if the database is empty (`SELECT COUNT(*) FROM tasks`). If empty, 3 sample tasks are inserted automatically. Restarting the server preserves data and avoids duplicate seeds.

---

## Manual SQL Queries Executed (Stage 4)
Executed direct SQL commands via DB Browser for SQLite:
sql
SELECT * FROM tasks WHERE done = 1;
SELECT COUNT(*) FROM tasks;
UPDATE tasks SET done = 1;
DELETE FROM tasks WHERE done = 1;
---

## How to Run

1. Install dependencies:

   bash
npm install express better-sqlite3 swagger-ui-express
2. Start the server:

bash
node index.js

3. Open Swagger UI docs at: `http://localhost:3000/docs`

4. حفظ README
حفظ الملف النهائي
