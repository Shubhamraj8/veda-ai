<div align="center">

<h1>VedaAI</h1>

<p>
  AI-powered assessment creation for teachers: generate question papers, track real-time progress, and deliver structured outputs instantly.
</p>

<p>
  <a href="https://github.com/Shubhamraj8/veda-ai" target="_blank" rel="noreferrer">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-VedaAI-181717?style=for-the-badge&logo=github" />
  </a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/WebSockets-Socket.IO-010101?style=for-the-badge&logo=socketdotio" />
  <img alt="Zustand" src="https://img.shields.io/badge/State-Zustand-5B5BD6?style=for-the-badge&logo=react" />
</p>

<div>
  <b>Built for daily classroom use</b> — designed to feel like a production SaaS workflow.
</div>

</div>

---

## Screenshots

_Mobile-first UX with bottom navigation, and a teacher-friendly generation flow._

## Features

- **Question paper generation** (structured sections + questions + answer keys)
- **Real-time progress updates** via WebSockets
- **Job reliability** with retryable failed flows
- **Optimistic UX** with progress bars + toast notifications
- **Assignments dashboard** with reusable workflow UI
- **Caching** for fast browsing of assignments
- **PDF-ready output** (generated artifacts stored by assignment)
- **Responsive UI** for desktop + mobile layouts (including bottom nav)

## Architecture

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + Zustand + Socket.IO client
- **Backend API**: Express + REST endpoints for assignments
- **Background workers**: BullMQ workers for AI generation + PDF generation
- **Realtime bridge**: BullMQ QueueEvents -> Socket.IO events
- **Persistence**: MongoDB for assignments + generated papers
- **Caching**: Redis for hot reads and short TTL caching

## Quick Start (Local)

### 1) Backend (API)

```bash
cd backend
npm install
npm run dev
```

API runs on:
- `http://localhost:5000/api/v1`

### 2) Worker (AI + PDF)

In another terminal:

```bash
cd backend
npm run worker
```

### 3) Frontend (Web app)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:3000`

## Environment Variables

### Backend

Create `backend/.env`:

```bash
PORT=5000
MONGODB_URI=...
REDIS_URL=...
GEMINI_API_KEY=...

# Model must exist for your API key/account.
# Example default: gemini-flash-latest
GEMINI_MODEL=gemini-flash-latest

CORS_ORIGIN=http://localhost:3000
```

> `CORS_ORIGIN` also supports comma-separated domains for deployment, e.g.  
> `CORS_ORIGIN=https://app.example.com,https://admin.example.com`

### Frontend

Create `frontend/.env`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## API Endpoints

- `POST /api/v1/assignments`  
  Create an assignment and enqueue generation.
- `GET /api/v1/assignments/:id`  
  Fetch assignment, live job status, and generated paper sections when ready.
- `GET /api/v1/assignments`  
  Paginated list of assignments.
- `GET /health`  
  Basic process health.
- `GET /api/v1/health`  
  API health alias for platform probes.

## WebSocket Events

Room:
- `assignment:{assignmentId}`

Events:
- `generation_started`
- `generation_progress`
- `generation_completed`
- `generation_failed`

## Deployment Notes

For production, run **at least two backend processes**:

1. API server (REST + Socket.IO)
2. BullMQ workers (AI generation + PDF generation)

### Production scripts

```bash
# Backend API
cd backend
npm run build
npm run start:api:prod

# Worker process (separate process/container)
cd backend
npm run start:worker:prod
```

### Docker

The repo includes:

- `backend/Dockerfile` for API server
- `backend/Dockerfile.worker` for BullMQ workers

Deploy API and worker as separate services sharing the same MongoDB + Redis.

### Logging and health checks

- Structured logs in production (JSON logger format)
- Request-ID-aware request/error logging
- Health endpoints for uptime checks:
  - `/health`
  - `/api/v1/health`

## License

MIT

