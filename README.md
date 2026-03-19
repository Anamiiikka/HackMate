# HackMate Backend 🚀

> Smart hackathon teammate matching platform — find teammates by tech stack, availability, and experience level with real-time chat.

---

## Tech Stack

* **Runtime:** Node.js + Express
* **Database:** PostgreSQL 18
* **Real-time:** Socket.IO (WebSockets)
* **Auth:** JWT (access + refresh tokens) + bcrypt
* **Docs:** Swagger UI (OpenAPI 3.0)

---

## Features

* 🔐 JWT authentication with refresh token rotation
* 👤 User profiles with tech stack and availability
* 🧠 Smart matching algorithm (skill overlap, availability, experience)
* 🤝 Match requests with auto team formation
* 💬 Real-time chat with typing indicators and read receipts
* 🛡️ ACID-safe transactions, rate limiting, input validation

---

## Project Structure

```
hackmate-backend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── hackathonController.js
│   │   ├── matchingController.js
│   │   ├── requestController.js
│   │   └── chatController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── hackathons.js
│   │   ├── matching.js
│   │   ├── requests.js
│   │   └── conversations.js
│   ├── seeds/
│   │   └── seed.sql
│   ├── services/
│   │   └── matchingService.js
│   ├── socket/
│   │   └── chatSocket.js
│   ├── docs/
│   │   └── openapi.yaml
│   └── app.js
├── .env
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL 18 (running on port 5433)
* pgAdmin (optional)

---

### 1. Clone and install

```bash
git clone <your-repo-url>
cd hackmate-backend
npm install
```

---

### 2. Configure environment

Create `.env` file:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=hackmate
JWT_SECRET=generate_with_crypto_randomBytes_64
JWT_REFRESH_SECRET=generate_with_crypto_randomBytes_64_different
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 3. Setup database

```bash
psql -U postgres -p 5433 -c "CREATE DATABASE hackmate;"

psql -U postgres -p 5433 -d hackmate -f src/migrations/001_initial_schema.sql

psql -U postgres -p 5433 -d hackmate -f src/seeds/seed.sql
```

---

### 4. Start server

```bash
npm run dev
npm start
```

Server: http://localhost:5000

---

## API Documentation

http://localhost:5000/api-docs

---

## Endpoints Overview

### Auth

| Method | Endpoint              | Description   |
| ------ | --------------------- | ------------- |
| POST   | /api/v1/auth/register | Register      |
| POST   | /api/v1/auth/login    | Login         |
| POST   | /api/v1/auth/refresh  | Refresh token |
| POST   | /api/v1/auth/logout   | Logout        |

---

### Profile

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| GET    | /api/v1/users/me                  | Get profile         |
| PUT    | /api/v1/users/me                  | Update profile      |
| PUT    | /api/v1/users/me/skills           | Set skills          |
| POST   | /api/v1/users/me/availability     | Add availability    |
| DELETE | /api/v1/users/me/availability/:id | Remove availability |
| GET    | /api/v1/users/:id                 | Public profile      |

---

### Hackathons

| Method | Endpoint                    | Description |
| ------ | --------------------------- | ----------- |
| GET    | /api/v1/hackathons          | List        |
| GET    | /api/v1/hackathons/skills   | Skills      |
| POST   | /api/v1/hackathons/:id/join | Join        |

---

### Matching

| Method | Endpoint                               |
| ------ | -------------------------------------- |
| GET    | /api/v1/hackathons/:id/recommendations |

---

### Requests

| Method | Endpoint                  |
| ------ | ------------------------- |
| POST   | /api/v1/requests          |
| GET    | /api/v1/requests/incoming |
| GET    | /api/v1/requests/outgoing |
| PATCH  | /api/v1/requests/:id      |
| DELETE | /api/v1/requests/:id      |

---

### Chat (HTTP)

| Method | Endpoint                           |
| ------ | ---------------------------------- |
| GET    | /api/v1/conversations              |
| POST   | /api/v1/conversations              |
| GET    | /api/v1/conversations/:id/messages |

---

## WebSocket Usage

```js
const socket = io('http://localhost:5000', {
  auth: { token: '<access_token>' }
});
```

---

## Database Schema

* users
* refresh_tokens
* skills
* user_skills
* hackathons
* user_hackathon_prefs
* availability_slots
* teams
* team_members
* match_requests
* conversations
* conversation_participants
* messages

---

## Matching Algorithm

```
Score (0-100) =
  skill_overlap  × 0.45
  availability   × 0.30
  experience     × 0.15
  seriousness    × 0.10
```

---

## Security

* bcrypt hashing
* JWT auth
* Helmet.js
* Rate limiting (200 req / 15 min)
* Input validation
* Row-level locking

---

## Health Check

```
GET /health
→ { "status": "ok" }
```

---

## Seeded Data

### Skills (28)

React, Vue, Next.js, Angular, Node.js, Express, Django, FastAPI, Spring Boot, PostgreSQL, MongoDB, Redis, MySQL, Docker, Kubernetes, AWS, GCP, TensorFlow, PyTorch, LangChain, Figma, Flutter, React Native, Solidity, Rust, Go, GraphQL, TypeScript

### Hackathons

* HackIndia 2026
* Smart India Hackathon 2026
* ETHIndia 2026

---

## Roadmap

* Phase 1 — Schema + API
* Phase 2 — Auth
* Phase 3 — Profile
* Phase 4 — Matching
* Phase 5 — Requests
* Phase 6 — Chat
* Phase 7 — Redis
* Phase 8 — Load Testing
* Phase 9 — Frontend

---

## Author

Built with ❤️ for hackers who deserve better teammates.
