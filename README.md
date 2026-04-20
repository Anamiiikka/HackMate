# HackMate 🚀

> Smart hackathon teammate matching platform — find teammates by tech stack, availability, and experience level with real-time chat.

HackMate consists of a **Next.js frontend** and an **Express.js backend** connected via a Next.js proxy.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL 18
- **Caching & Rate Limiting:** Redis
- **Real-time:** Socket.IO (WebSockets)
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Docs:** Swagger UI (OpenAPI 3.0)

---

## 🚀 Local Setup Guide

If you are cloning this repository to run it locally, follow these steps strictly in order.

### 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v18 or completely updated (verify via `node -v`)
- **PostgreSQL**: A cloud PostgreSQL database like [Neon DB](https://neon.tech/) (or a local instance).
- **Redis**: Running locally (default port `6379`)
- **Git**: For cloning the repository.

---

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd HackMate
```

---

### Step 2: Database Setup 

HackMate uses a single Postgres connection string. If you're using Neon DB, grab your `DATABASE_URL` from the Neon dashboard.

You must run the migration and seed files against your database. You can do this by passing your `DATABASE_URL` directly into `psql`:

```bash
# 1. Base Schema
psql "<YOUR_DATABASE_URL>" -f hackmate-backend/src/migrations/001_initial_schema.sql

# 2. Seed Users & Data
psql "<YOUR_DATABASE_URL>" -f hackmate-backend/src/seeds/seed.sql

# 3. Notification Tables
psql "<YOUR_DATABASE_URL>" -f hackmate-backend/src/migrations/002_create_notifications_table.sql

# 4. Chat & Messaging Tables
psql "<YOUR_DATABASE_URL>" -f hackmate-backend/src/migrations/003_create_chat_tables.sql
```

*(Note: If your URL doesn't work out of the box, make sure it ends with `?sslmode=require` or `?sslmode=verify-full`).*

Make sure **Redis** is running in the background. If you're on Mac: `brew services start redis`, or if on Windows using WSL: `sudo service redis-server start`.

---

### Step 3: Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd hackmate-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `hackmate-backend` directory (`hackmate-backend/.env`):
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=verify-full
   JWT_SECRET=super_secret_jwt_key_here
   JWT_REFRESH_SECRET=another_super_secret_refresh_key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:3000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend should output that it is connected to the DB and running on port 5000.*

---

### Step 4: Start the Frontend

Open a **new terminal tab** and navigate back to the root of the project.

1. Navigate to the frontend directory:
   ```bash
   cd hackmate-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional) The frontend uses Next.js rewrites to map `/api/v1/*` to `localhost:5000`, so a `.env` file isn't strictly required to get the app running.*
4. Start the frontend server:
   ```bash
   npm run dev
   ```

---

### 🌐 Accessing the App

- **Web App**: Navigate your browser to `http://localhost:3000`
- **Backend API Docs**: View the Swagger definitions at `http://localhost:5000/api-docs`

---

## 🧪 Testing the Application

Because you ran the seed script (`seed.sql`), you can immediately log in as one of the pre-configured mock users.

Check out the `SEED_DATA.md` file in the root directory for a full list of accounts, but here's a quick start:

**Test User:**
- Email: `arjun@hackmate.dev`
- Password: `hackmate123`

---

## 💡 Architecture Notes

- **CORS & Proxying:** To prevent typical local development CORS issues, the Next.js `next.config.ts` automatically proxies all frontend API calls going to `/api/v1/*` directly into the backend on port 5000. 
- **WebSocket Auth:** Ensure you check the browser's local storage for `access_token` since WebSockets initialize explicitly with this token.
- **Algorithms:** Matches are automatically calculated via a dynamic weighted score formula measuring skill overlap (45%), availability (30%), and experience (15%).

Built with ❤️ for hackers who deserve better teammates.
