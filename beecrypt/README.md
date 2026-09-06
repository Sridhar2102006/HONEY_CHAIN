# HoneyChain (BeeCrypt)

**From Hive to Trust.** A production-ready, blockchain-integrated web and native mobile application for honey supply chain traceability, IoT sensor monitoring (ESP32 DevKit + ESP32-CAM), and KVIC quality verification.

Powered by:
- **Web App**: React 18 + Vite + Tailwind CSS
- **Mobile App**: Capacitor 6 (Android & iOS)
- **Backend API**: Node.js / Express HTTPS API
- **IoT Layer**: ESP32 DevKit (DHT11 + Vibration telemetry) & ESP32-CAM (GridFS inspection capture)
- **Database**: MongoDB Atlas (`ESP32CAM` / `READINGS`)
- **Provenance**: Cryptographic SHA-256 batch chaining & smart contract gateway readiness

---

## Architecture

```text
                  ┌────────────────────────┐
                  │ HoneyChain React UI    │
                  └───────────┬────────────┘
                              │
                    Capacitor Mobile Layer
                              │
               ┌──────────────┴──────────────┐
               │                             │
         Android App                      iOS App
         (API 22 - 34)                (iOS 14.0 - 18.0)
               │                             │
               └──────────────┬──────────────┘
                              │
                       HTTPS API Layer
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Node/Express         MongoDB Atlas       Blockchain Gateway
    Backend API          (GridFS & Data)     (SHA-256 Signatures)
         │
    ESP32-CAM & DevKit
    (Real-Time SSE Stream)
```

---

## 1. Web Application Development

### Prerequisites
- Node.js 18+ (Tested on Node 20 / 24)
- npm 9+

### Quick Start
```bash
# Install dependencies
npm install

# Start Vite Web Development Server
npm run dev

# Start Backend API & IoT Ingestion Server
npm run dev:server
```
Web app opens at `http://localhost:5173`.

---

## 2. Mobile Application Development (Capacitor)

HoneyChain uses **Capacitor 6** to build enterprise Android and iOS applications directly from the shared React codebase.

### Available Mobile Scripts
```bash
# 1. Build production web bundle & sync to Android and iOS
npm run build:mobile

# 2. Sync web assets and plugins to native projects
npm run cap:sync

# 3. Open Android Studio
npm run cap:android

# 4. Open Xcode (macOS only)
npm run cap:ios
```

### Mobile Native Features
- **Status Bar & Splash Screen**: Honeycomb theme, smooth honeybee flight animation, edge-to-edge safe area rendering.
- **Hardware Back Button**: Android hardware back button handler closes modals, navigates history, and prevents trapped screens.
- **Dynamic API Resolution**: Automatically points to local network backend (`http://<LAN_IP>:3001/api/v1`) during development, and HTTPS (`https://api.honeychain.app/api/v1`) in production.
- **Secure Preferences**: Uses `@capacitor/preferences` for native token persistence with automatic fallback to web storage.
- **Live Network Monitor**: Continuous online/offline connectivity monitoring.

---

## 3. Environment Strategy

HoneyChain maintains strict environment separation. Never hardcode credentials in source code.

| Environment | File | Target API URL | Usage |
|---|---|---|---|
| **Development** | `.env.development` | `http://10.131.229.86:3001/api/v1` (or local IP) | Local testing on physical devices |
| **Staging** | `.env.staging` | `https://staging-api.honeychain.app/api/v1` | QA and staging builds |
| **Production** | `.env.production` | `https://api.honeychain.app/api/v1` | Play Store & App Store builds |

Template is available in `.env.example`.

---

## 4. CI/CD & Direct APK Distribution (SIH Hackathon Ready)

> **IMPORTANT**: No Google Play Console account is required for this phase.
> The CI/CD pipeline builds and publishes **installable APK files directly as GitHub Actions artifacts**.

GitHub Actions workflows are located in `.github/workflows/`:

1. **`ci.yml` (Quality Gate & Debug APK Generator)**:
   - Triggers on every push & pull request (`main` & `develop`).
   - Executes tests (`npm test`), web build (`npm run build`), Capacitor sync (`npx cap sync`), and compiles Android Debug APK (`./gradlew assembleDebug`).
   - **Uploads Artifact**: `HoneyChain-Android-debug-apk` (`HoneyChain-Android-debug.apk`), ready to install immediately on test phones or emulators.

2. **`android-release.yml` (Release Candidate APK & AAB Pipeline)**:
   - Triggers on tag release (`v*`) or manual dispatch (`workflow_dispatch`).
   - Compiles both **Debug APK**, **Release Candidate APK**, and **AAB Bundle**.
   - If keystore secrets are configured, it signs with the production key. If not configured yet, it automatically signs with a local development fallback key so the APK **remains 100% installable on physical Android phones for SIH evaluation**.
   - **Uploads Artifact**: `HoneyChain-Android-APKs` containing both `HoneyChain-Android-debug.apk` and `HoneyChain-Android-release.apk`.

### How to Download & Install the APK on Your Android Device:
1. Go to your GitHub repository → click the **Actions** tab.
2. Click on the latest workflow run (e.g. "HoneyChain CI Quality Gate").
3. Scroll down to the **Artifacts** section at the bottom of the summary page.
4. Click **`HoneyChain-Android-debug-apk`** to download the zip file.
5. Extract the `.apk` file and transfer it to your Android phone (via USB, Google Drive, or WhatsApp).
6. Tap the `.apk` on your phone to install (allow "Install Unknown Apps" from your browser/file manager when prompted).

### CI/CD Secrets (Optional for Play Store in Future)
- `ANDROID_KEYSTORE_BASE64`: Base64 string of release `.keystore` / `.jks` file
- `ANDROID_KEYSTORE_PASSWORD`: Keystore store password
- `ANDROID_KEY_ALIAS`: Key alias name
- `ANDROID_KEY_PASSWORD`: Key password
- `JWT_SECRET`: Production JWT signing secret (backend)
- `MONGODB_URI`: Production MongoDB Atlas connection URI (backend)

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
