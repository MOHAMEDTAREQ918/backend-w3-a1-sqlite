# FlyRank Backend Track - Auth Login & Protect (Supabase Auth)

## Overview
This project builds a secure authentication system using **Supabase Auth** as the Identity Provider (IdP). It manages user accounts, issues secure JSON Web Tokens (JWTs), and enforces token verification via Middleware to protect sensitive endpoints.

---

## How to Run Locally 🚀

1. Clone the repository and install dependencies:
bash
npm install


2. Create a `.env` file based on `.env.example`:
bash
cp .env.example .env


3. Fill in your Supabase credentials in `.env`:
env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=3000


4. Start the server:
bash
npm start


5. Access Swagger UI docs at: `http://localhost:3000/docs`

---

## API Reference

| Method | Endpoint | Description | Auth Required | Status Codes |
|---|---|---|---|---|
| POST | `/auth/signup` | Register a new user | ❌ No | 201, 400 |
| POST | `/auth/login` | Authenticate & receive JWT | ❌ No | 200, 400, 401 |
| POST | `/auth/logout` | Terminate session | ✅ Bearer JWT | 204, 401 |
| GET | `/public/info` | Public open endpoint | ❌ No | 200 |
| GET | `/protected/profile` | Access private user profile | ✅ Bearer JWT | 200, 401 |

---

## AI vs Me (Stage 7)

### Prompt Used:
> "Build an Express.js API integrating Supabase Auth for signup, login, logout, and token-protected routes. Implement a reusable authentication middleware to verify Bearer JWT tokens, return correct HTTP status codes (201, 200, 204, 400, 401), and configure Swagger UI with BearerAuth security scheme."

### Comparisons & Findings:
1. **Header Parsing:** AI attempted to pass the full `Authorization` header directly to Supabase without stripping the `Bearer ` prefix. Corrected by extracting `header.split(' ')[1]`.
2. **Error Status Codes:** AI returned `400 Bad Request` on invalid token verification. Fixed to strictly return `401 Unauthorized` as per standard REST security protocols.
3. **Swagger Integration:** AI forgot to link `security: [{ BearerAuth: [] }]` to individual paths in OpenAPI specs, hiding the padlock button. Added the correct specification block.
