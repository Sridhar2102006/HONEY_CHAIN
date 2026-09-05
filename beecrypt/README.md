# BeeCrypt

**From Hive to Trust.** A blockchain-*ready* frontend for honey traceability and
smart beekeeping management, built for **SIH 2026, Problem Statement 26021**
("Honey Chain").

This is a frontend-only demo. No backend, database, blockchain, IoT, or ML
model is implemented — see "What's mocked" below. Everything is written so a
real backend can be dropped in later without redesigning the app.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

> Built and syntax-checked in an offline sandbox — dependencies were never
> actually installed/run here. If `npm install` surfaces a version mismatch,
> the fix is almost always bumping/pinning a range in `package.json`.

## Demo accounts (Demo Authentication — no real auth server)

| Email | Role(s) |
|---|---|
| `beekeeper@beecrypt.demo` | Beekeeper |
| `processor@beecrypt.demo` | Processor |
| `lab@beecrypt.demo` | Laboratory |
| `admin@beecrypt.demo` | KVIC Admin |
| `multi@beecrypt.demo` | Beekeeper + Processor + Laboratory — try this one to see workspace switching |

Password: anything (mock auth accepts any password for a known email).

## Suggested demo flow

1. Log in as `multi@beecrypt.demo`.
2. **Beekeeper** → Honey Extraction → save. Note the permanent Batch ID and the
   `HARVESTED`/`EXTRACTED` provenance events it creates.
3. Switch workspace (top of sidebar) → **Processor** → Honey Batches → open the
   new batch → Mark Processing Started → Mark Processing Completed → Find
   Laboratory → Send Sample.
4. Switch workspace → **Laboratory** → Test Requests → open the request →
   Purity Analysis → Save → Certificates → upload the report.
5. Traceability (any workspace) → search the Batch ID → see the full timeline,
   the Blockchain Proof panel (clearly "Integration Pending"), and the QR code.
6. Visit `/verify/<batchId>` directly (or scan-simulate via the QR) for the
   consumer view.
7. Log in as `admin@beecrypt.demo` → User Verification (approve/reject) →
   Blockchain Readiness (a frontend-only illustrative %).

## What's mocked vs. what's real

Real: React state, routing, forms/validation, charts (Recharts), a real
scannable QR (`qrcode.react`) encoding `https://beecrypt.demo/verify/<batchId>`.

Mocked, and clearly labelled in the UI:
- **Auth** — "Demo Authentication", no server.
- **IoT sensor data** — "Simulated Live Data".
- **AI hive health** — "AI-assisted analysis — Demo", random result after a
  timed delay.
- **Blockchain** — every provenance event carries `payloadHash`,
  `previousEventHash`, `signature`, `blockchainTx` fields that are always
  `null` on the frontend and rendered as "Pending Backend" / "Integration
  Pending". `src/services/blockchainService.js` is the single clearly-marked
  seam for wiring in a real gateway later.
- **Certificates** — "stored off-chain"; file upload is a local-state
  simulation (progress bar, no server).

## Project structure

```
src/
 ├── components/   Reusable UI (cards, tables, badges, modals, timeline, ...)
 ├── pages/         beekeeper/, processor/, laboratory/, kvic/, + shared pages
 ├── layouts/        PublicLayout, AppLayout (sidebar+navbar), ConsumerLayout
 ├── context/         AppContext.jsx — single source of shared app state
 ├── data/            mockData.js — every shared mock dataset
 ├── services/        authService, batchService, provenanceService,
 │                     hiveService, processorService, laboratoryService,
 │                     certificateService, blockchainService
 ├── utils/            id generators, formatting, validators, status vocab
 ├── hooks/            useApp, useAuth, useToast
 └── routes/           AppRoutes.jsx — all route wiring
```

### Route map

```
/                              Landing
/login, /signup, /registration-pending
/verify/:batchId               Consumer QR verification

/app                           → redirects to /app/<active workspace>
/app/traceability /profile /settings      (shared across all workspaces)

/app/beekeeper[/hives[/:hiveId]|/monitoring|/ai-health|/alerts|/extraction]
/app/processor[/batches|/processing|/laboratories|/certifications]
/app/laboratory[/requests|/purity|/certificates]
/app/kvic[/verification|/beekeepers|/processors|/laboratories|/hives|
           /batches|/certifications|/alerts|/analytics|/readiness]
```

## Connecting a real backend later

1. Replace the bodies of `src/services/*.js` with real API calls — their
   function signatures are the intended contract, so pages/components should
   not need to change.
2. `provenanceService.createEvent()` is the one place every meaningful action
   funnels through — point it at a real `/api/events` endpoint.
3. `blockchainService.js` is a no-op placeholder by design — this is where a
   backend/blockchain-gateway integration would compute hashes, sign events,
   and submit them on-chain.
4. Swap `AppContext`'s local `useState` calls for data fetched via those
   services (e.g. React Query) once a backend exists.
