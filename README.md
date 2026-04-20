# HackMate 🚀

> **A smart hackathon teammate matching platform built for speed and precision.** HackMate helps you discover hackathons, find teammates perfectly matched by tech stack and availability, and instantly collaborate through real-time team Chat.

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-Caching-red?style=for-the-badge&logo=redis" alt="Redis" />
  <img src="https://img.shields.io/badge/Socket.io-WebSockets-white?style=for-the-badge&logo=socket.io" alt="Socket.io" />
</div>

---

## 🌟 Key Features & Functionality

HackMate is designed to take the friction out of hackathon team formation. Here is what the platform offers:

### 🧩 Smart Algorithmic Matching
- **Data-Driven Suggestions:** Users are recommended teammates based on a weighted algorithm matching tech stacks (45%), availability slots (30%), and experience levels (15%).
- **Skill Tracking:** Add programming languages, frameworks, and tools to your profile with a 1-5 proficiency rating.
- **Match Requests:** Send, accept, or reject peer-to-peer team requests.

### 🏆 Premium Hackathon Discovery
- **Rich Hub UI:** View comprehensive hackathon details with an interactive, modern user interface.
- **Dynamic Portals:** Explore tabs for Hackathon Overview, simulated Prize Pools, Event Rules, and Schedules.
- **Real-time Status:** Automatically track Mode (Online/Hybrid), Dates, Tech Focus, and Team Size Requirements.

### 💬 Real-Time Collaboration (Chat & Notifications)
- **Instant Messaging:** WebSockets powered by `Socket.io` allow matches and formed teams to communicate instantly.
- **Push Notifications:** In-app real-time notification alerts (via the notification bell) whenever you receive a match request, or when a request gets accepted.
- **Persistent Chat History:** Seamlessly connects with PostgreSQL to durably store direct and team conversation history.

### 👤 Advanced Profile Management
- **Customizable Persona:** Maintain a rich profile containing your Avatar, Bio, GitHub/LinkedIn URLs, Timezone, and Location.
- **Experience Level Matching:** Designate yourself as a *Beginner*, *Intermediate*, or *Advanced* developer to adjust your team-matching visibility.
- **Aesthetic Public Profiles:** View a beautifully crafted glassmorphic profile page of potential teammates before sending requests.

### 🛡️ Security & Performance
- **JWT Auth & Validation:** Fully secured APIs via JSON Web Tokens handling both access and refresh tokens efficiently.
- **Redis Caching:** High-performance caching layers implemented for APIs (like loading hackathon lists and matching pools) to prevent redundant database hits.

---

## 🛠️ Technology Stack

HackMate is a decoupled Full-Stack Web Application relying on the following core modern web technologies:

### 🎨 Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (React 19)
- **Routing:** App Router (`src/app`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components & Icons:** Custom Glassmorphic elements, `lucide-react` for iconography.
- **State & Notifications:** `zustand` (State Management), `sonner` (Toast Notifications).

### ⚙️ Backend
- **Framework:** [Node.js](https://nodejs.org/) & Express 5
- **Database:** [PostgreSQL](https://www.postgresql.org/) (via `pg`) — relational maps for users, skills, requests, and chats.
- **Real-Time Engine:** [Socket.io](https://socket.io/) (WebSockets)
- **Caching & Rate Limiting:** [Redis](https://redis.io/) (via `ioredis`) and `express-rate-limit`.
- **Authentication:** `jsonwebtoken` (JWT) and `bcryptjs`.
- **API Specs:** Swagger UI for visual API Documentation.

---

## 🚀 Local Setup Guide

If you are cloning this repository to run it locally, follow these steps strictly in order.

### 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v18+ (verify via `node -v`)
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

Because you ran the seed script (`seed.sql`), you can immediately log in as one of the pre-configured mock users. Check out the `SEED_DATA.md` file in the root directory for a full list of accounts, but here's a quick start:

**Test User Accounts:**
- **Arjun**: `arjun@hackmate.dev` | `hackmate123` *(Intermediate React/Node)*
- **Priya**: `priya@hackmate.dev` | `hackmate123` *(Advanced Data/AI)*
- **Sneha**: `sneha@hackmate.dev` | `hackmate123` *(Designer/Frontend)*

---

## 💡 Architecture Notes

- **CORS & Proxying:** To prevent typical local development CORS issues, the Next.js `next.config.ts` automatically proxies all frontend API calls going to `/api/v1/*` directly into the backend on port 5000. 
- **WebSocket Auth:** You must check the browser's local storage for `access_token` since WebSockets initialize explicitly with this token to join secure connection channels.

---

<p align="center"><i>Built for hackers who deserve better teammates.</i></p>
