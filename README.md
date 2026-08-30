# FlyRank Backend Track - W3·A3: Containerize Your Stack (Docker + Postgres)

## Overview
This project completes the third storage evolution of our Task API:
`In-Memory (A1)` ➡️ `SQLite File (A2)` ➡️ `Containerized PostgreSQL (A3)`.

The API endpoints, HTTP status codes, validation rules, and JSON shapes remain completely identical, proving that storage is an implementation detail.

---

## One-Command Startup 🚀
To run the full stack (Node.js API + PostgreSQL Database), run:
bash
cp .env.example .env
docker compose up
This single command builds the application, pulls the official PostgreSQL image, sets up the network, attaches a persistent volume, and starts the service.

---

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| GET | `/` | API Info | 200 |
| GET | `/health` | DB Health Check (`SELECT 1`) | 200 / 500 |
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get single task | 200, 404 |
| POST | `/tasks` | Create task | 201, 400 |
| PUT | `/tasks/:id` | Update task | 200, 404 |
| DELETE | `/tasks/:id` | Delete task | 204, 404 |

---

## Sample Response (`curl -i http://localhost:3000/tasks`)
http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[
{ "id": 1, "title": "Buy groceries", "done": false },
{ "id": 2, "title": "Finish Backend Assignment W3-A3", "done": false },
{ "id": 3, "title": "Learn Docker & Postgres", "done": true }
]
---

## Data Persistence & Volumes
Data persistence is handled by a Docker named volume (`taskdata`) mounted at `/var/lib/postgresql/data`.
Running `docker compose down` and `docker compose up` preserves all rows safely.

---

## AI vs Me (Stage 6)

### Prompt Used:
> "Containerize a Node.js Express task CRUD API with PostgreSQL database using Docker and Docker Compose. Use parameterized queries with pg driver, read secrets from .env, ensure idempotent table creation and initial seeding, configure named volume persistence, and allow one-command startup with docker compose up."

### Comparisons & Findings:
1. **Health Check:** AI generated a basic `/health` returning `{ status: "ok" }`, whereas my implementation runs an actual SQL query (`SELECT 1`) against Postgres to verify database connectivity before returning `200 OK`.
2. **Database Host Name:** AI mistakenly used `localhost` in `DATABASE_URL` inside `compose.yaml`, which caused connection errors. Corrected it to the Compose service name `db`.
3. **Volume Persistence:** AI correctly included `volumes:` mapping, confirming data survival across container restarts.
