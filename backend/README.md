# VedaAI Assessment Creator (Backend)

[![TypeCheck](https://img.shields.io/badge/TypeScript-Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-green.svg)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Hardened-orange.svg)](https://helmetjs.github.io/)

A world-class AI assessment generation engine. Designed for high-scale environments with a focus on **Performance**, **Reliability**, and **Clean Architecture**.

---

## 🚀 Engineering Highlights
- **Event-Driven Pipeline**: Decoupled AI and PDF generation logic using BullMQ worker pools.
- **Redis Caching Layer**: Automated caching for hot records with smart invalidation.
- **Professional PDF Engine**: Generates exam-style papers (Delhi Public School format) with institutional headers and full Answer Keys.
- **Advanced API Security**: 
  - Tiered Rate Limiting (Global + Specialized AI generation limits).
  - NoSQL Injection protection via `express-mongo-sanitize`.
  - Content Sanitization with `dompurify`.
- **Top-Tier DX**: 
  - Complete **Dependency Injection** refactor for 100% testability.
  - Granular **Request-ID tracing** across API and Workers.
  - **Vitest** suite for instantaneous unit testing.

---

## 🏗️ Architecture
VedaAI follows a **Controller-Service-Repository** pattern with an isolated **Worker Layer**.

- **API Layer**: Express + Middleware for security and request validation.
- **Logic Layer**: Dependency-injected Services handling AI prompts and PDF assembly.
- **Background Layer**: BullMQ Workers processing jobs with exponential backoff and Stall Detection.
- **Persistence Layer**: MongoDB for records, Redis for caching and communication.

*See [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed breakdown and diagrams.*

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- MongoDB & Redis instances (Local or Cloud)

### Installation
1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Setup environment variables:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` with your `GEMINI_API_KEY`, `MONGODB_URI`, and `REDIS_URL`.*

### Running the System
For local development, it is recommended to run the API and Worker in separate terminals:
```bash
# Terminal 1: API Server
npm run dev

# Terminal 2: Background Worker
npm run worker
```

### Verification
```bash
# Run unit tests
npm run test

# Run type check
npm run typecheck
```

---

## 📡 API Specifications

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/assignments` | Create a new assignment job (Rate limited) |
| `GET` | `/api/v1/assignments/:id` | Fetch assignment details + Live job status |
| `GET` | `/api/v1/assignments` | Paginated list of all created assessments |

---

## 🔗 WebSocket Interface
Connect to the server and join the assignment-specific room:
- **Room**: `assignment:{assignmentId}`
- **Events**: `generation_started`, `generation_progress`, `generation_completed`, `generation_failed`.

---

## 🐳 Deployment
The system includes a production-ready multi-stage `Dockerfile`.
```bash
docker build -t vedaai-backend .
docker run -p 5000:5000 vedaai-backend
```

---

## ⚖️ License
MIT
