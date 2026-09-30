# Vecta CRM

A lead and sales-pipeline tracker built with the **MERN stack** (MongoDB, Express, React, Node.js).
Log in, add leads, move them through pipeline stages, keep notes, and watch a live dashboard.

<!-- Add screenshots here: ![Dashboard](docs/dashboard.png) -->

## Features

- Register and log in (JWT authentication, passwords hashed with bcrypt)
- Leads: add, edit, delete, search and filter by stage
- Pipeline board with five stages: New, Contacted, Qualified, Won, Lost
- Notes on every lead
- Dashboard with animated counters, a bar chart (leads by stage) and a pie chart (value by stage)
- Animated interface (Framer Motion) and a 3D login scene (React Three Fiber)
- Each user only sees their own leads

## Tech stack

| Part | Tools |
|---|---|
| Database | MongoDB Atlas, Mongoose |
| Backend | Node.js, Express, JWT, bcryptjs |
| Frontend | React 18, Vite, React Router |
| UI | Recharts, Framer Motion, React Three Fiber (three.js) |

## Run it locally

You need Node.js 18 or newer and a free MongoDB Atlas cluster.

**1. Backend**

```bash
cd server
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```

Open `server/.env` and fill in `MONGO_URI` and `JWT_SECRET`. Then:

```bash
npm run seed              # optional: adds a demo user and sample leads
npm run dev               # API on http://localhost:5000
```

**2. Frontend** (in a second terminal)

```bash
cd client
npm install
npm run dev               # app on http://localhost:5173
```

Demo login after seeding: `demo@minicrm.dev` / `Demo@1234`

## API

All `/api/leads` routes need the header `Authorization: Bearer <token>`.

| Method | Route | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, returns a token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/leads?search=&stage=` | List leads |
| GET | `/api/leads/stats` | Count and value per stage |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| PATCH | `/api/leads/:id/stage` | Change the stage |
| POST | `/api/leads/:id/notes` | Add a note |
| DELETE | `/api/leads/:id` | Delete a lead |

## Project structure

```
server/src
  index.js            app setup and routes
  config/db.js        MongoDB connection
  models/             User and Lead schemas
  routes/             auth and leads endpoints
  middleware/         JWT check and error handling
  seed.js             demo data
client/src
  pages/              Login, Dashboard, Leads, Pipeline
  components/         Layout, LeadModal, Hero3D, CountUp ...
  context/            login state
  api.js              axios setup
```

## Deploy

1. **Database:** MongoDB Atlas free cluster. Allow network access from anywhere (0.0.0.0/0) for the hosted API.
2. **API:** deploy the `server` folder to a Node host such as Render. Set `MONGO_URI`, `JWT_SECRET` and `CLIENT_URL` (your frontend address).
3. **Frontend:** deploy the `client` folder to Vercel. Set `VITE_API_URL` to your API address followed by `/api`.

## Ideas for next steps

- Drag and drop on the pipeline board
- CSV export
- Activity timeline for each lead
- Tests for the API
