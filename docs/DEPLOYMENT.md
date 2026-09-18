# HoneyChain (BeeCrypt) Production Deployment & Containerization Guide

## 1. Container Architecture
HoneyChain supports containerized deployment using Docker and Docker Compose. This ensures identical environments across development, testing, staging, and production without cloud configuration drift.

```
                  ┌─────────────────────────────────────────┐
                  │              Docker Host                │
                  │                                         │
                  │   ┌─────────────────────────────────┐   │
  Client / Web ──────►│      Nginx / Frontend SPA       │   │
  (Port 80 / 443) │   │     (Static React 18 Assets)    │   │
                  │   └────────────────┬────────────────┘   │
                  │                    │ Reverse Proxy      │
                  │                    ▼                    │
                  │   ┌─────────────────────────────────┐   │
                  │   │     Node.js API Container       │   │
                  │   │      (Express 4, Port 3001)     │   │
                  │   └───────┬─────────────────┬───────┘   │
                  │           │                 │           │
                  │           ▼                 ▼           │
                  │   ┌───────────────┐ ┌───────────────┐   │
                  │   │ PostgreSQL 16 │ │ MongoDB 7.0   │   │
                  │   │  (Port 5432)  │ │  (Port 27017) │   │
                  │   └───────────────┘ └───────────────┘   │
                  └─────────────────────────────────────────┘
```

---

## 2. Docker Compose Local Setup
To run the entire platform locally with zero external cloud dependencies:

```bash
# 1. Build and start all services in detached mode
docker compose up --build -d

# 2. Run database migrations inside backend container
docker compose exec backend npm run migrate

# 3. View live server logs
docker compose logs -f backend
```

Services exposed:
- **Frontend Web UI:** `http://localhost:80`
- **Backend REST API:** `http://localhost:3001/api/v1`
- **PostgreSQL Database:** `localhost:5432` (user: `beecrypt`, db: `beecrypt_db`)
- **MongoDB Database:** `localhost:27017` (db: `ESP32CAM`)

---

## 3. Production Environment Variables Checklist
Before launching in production, verify all environment variables:
- `NODE_ENV="production"`
- `PORT=3001`
- `DATABASE_URL` (SSL mode enabled: `sslmode=require`)
- `MONGODB_URI` (Authentication enabled)
- `JWT_SECRET` (Minimum 48 bytes random hex; must NOT equal placeholder)
- `JWT_EXPIRES_IN="7d"`
- `FRONTEND_URL="https://honeychain.app"`
- `VITE_PUBLIC_VERIFY_URL="https://honeychain.app/verify"`
- `SENSOR_DEVICE_KEY` (High-entropy secret key matching ESP32 firmware)
- `CAMERA_DEVICE_KEY` (High-entropy secret key matching ESP32-CAM firmware)
