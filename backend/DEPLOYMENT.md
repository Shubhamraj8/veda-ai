# Production deployment checklist (Render + Vercel)

## Why generation works on localhost but not in production

Creating an assignment **only enqueues a BullMQ job** in Redis. The **HTTP API does not run Gemini**.  
**AI + PDF generation run in a separate Node process** (`dist/worker.js` → `start:worker:prod`).

Locally you usually run **two** terminals:

- API: `npm run dev` (or `npm start`)
- Worker: `npm run worker` (or `npm run start:worker:prod` after build)

### Fix in this repo (single Render service)

The **`backend/Dockerfile`** starts **both** the API and BullMQ workers via:

```bash
npm run start:all
```

(`concurrently` runs `node dist/server.js` and `node dist/worker.js` in one container.)

**Redeploy** after pulling — one Web service is enough for generation.

### Optional: two services (scale workers separately)

1. **Web** – API only: `npm start` (custom Dockerfile or override `CMD`).
2. **Worker** – `Dockerfile.worker` or `npm run start:worker:prod`.

Use the **same** env vars on both: `MONGODB_URI`, `REDIS_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `NODE_ENV=production`, etc.

### Vercel (frontend)

Set:

- `NEXT_PUBLIC_API_URL` = `https://<your-render-api>.onrender.com/api/v1`
- `NEXT_PUBLIC_WS_URL` = `https://<your-render-api>.onrender.com` (same host, no `/api/v1`)

Redeploy after changing env vars.

### Quick verification

- **API**: `GET https://<host>/api/v1/health` (or `/health`) returns OK.
- **After creating an assignment**, check **Render worker logs** – you should see `[Worker] Calling AI service for assignment ...`.  
  If API logs show `Assignment job enqueued` but **worker logs are empty**, the worker is not running.

### Other common issues

| Symptom | Check |
|--------|--------|
| Stuck on “processing” | Worker not deployed / not running |
| 429 / rate limit | Trust proxy + limits (see `security.middleware.ts`) |
| Redis errors in logs | `REDIS_URL` correct; TLS (`rediss://`) if provider requires it |
| Mongo errors | Atlas IP allowlist includes Render (often `0.0.0.0/0` for serverless) |
| Gemini errors | `GEMINI_API_KEY` set on the service (covers API + worker when using `start:all`) |
