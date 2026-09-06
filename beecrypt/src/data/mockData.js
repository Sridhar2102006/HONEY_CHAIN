/**
 * mockData.js
 * ---------------------------------------------------------------------
 * Single source of shared mock data and initial schema shapes.
 * All operational data arrays (hives, batches, inspections, lab tests,
 * certificates, events, alerts) start EMPTY to allow fresh manual
 * data entry through the BeeCrypt application.
 * ---------------------------------------------------------------------
 */

// ---- Demo accounts (Section 9) -----------------------------------------
export const DEMO_USERS = {
  "beekeeper@beecrypt.demo": {
    actorId: "BK-001",
    orgId: "ORG-101",
    name: "Rajesh Kumar",
    roles: ["beekeeper"],
    org: "Kumar Apiaries",
    region: "Erode",
    location: "Erode, Tamil Nadu",
  },
  "processor@beecrypt.demo": {
    actorId: "PR-001",
    orgId: "ORG-202",
    name: "Meena Iyer",
    roles: ["processor"],
    org: "Green Valley Honey",
    region: "Coimbatore",
    location: "Coimbatore, Tamil Nadu",
  },
  "lab@beecrypt.demo": {
    actorId: "LAB-001",
    orgId: "ORG-303",
    name: "Dr. Ashok Rao",
    roles: ["laboratory"],
    org: "ABC Food Testing Laboratory",
    region: "Chennai",
    location: "Chennai, Tamil Nadu",
  },
  "admin@beecrypt.demo": {
    actorId: "KVIC-001",
    orgId: "ORG-001",
    name: "KVIC Regional Office",
    roles: ["kvic"],
    org: "Khadi & Village Industries Commission",
    region: "New Delhi",
    location: "New Delhi",
  },
  "retailer@beecrypt.demo": {
    actorId: "RET-001",
    orgId: "ORG-401",
    name: "Priya Sharma",
    roles: ["retailer"],
    org: "Nilgiris Fresh Mart",
    region: "Coimbatore",
    location: "Coimbatore, Tamil Nadu",
  },
  "verifier@beecrypt.demo": {
    actorId: "LAB-001",
    orgId: "ORG-303",
    name: "Dr. Ashok Rao",
    roles: ["laboratory"],
    org: "ABC Food Testing & Verifier Lab",
    region: "Chennai",
    location: "Chennai, Tamil Nadu",
  },
  "multi@beecrypt.demo": {
    actorId: "ORG-501",
    orgId: "ORG-501",
    name: "Arun Kumar",
    roles: ["beekeeper", "processor", "laboratory", "retailer", "kvic"],
    org: "Arun Honey Collective",
    region: "Salem",
    location: "Salem, Tamil Nadu",
    multiActorIds: { beekeeper: "BK-045", processor: "PR-045", laboratory: "LAB-045", retailer: "RET-001", kvic: "KVIC-001" },
  },
};

// ---- Organizations (Section 6) -----------------------------------------
export const ORGANIZATIONS = [
  { orgId: "ORG-101", name: "Kumar Apiaries", type: "beekeeper", region: "Erode" },
  { orgId: "ORG-202", name: "Green Valley Honey", type: "processor", region: "Coimbatore" },
  { orgId: "ORG-303", name: "ABC Food Testing Laboratory", type: "laboratory", region: "Chennai" },
  { orgId: "ORG-401", name: "Nilgiris Fresh Mart", type: "retailer", region: "Coimbatore" },
  { orgId: "ORG-001", name: "Khadi & Village Industries Commission", type: "kvic", region: "New Delhi" },
  { orgId: "ORG-501", name: "Arun Honey Collective", type: "multi", region: "Salem" },
];

// ---- Hives (Freshly empty for manual feeding) ---------------------------
export const HIVES = [];

// ---- Simulated live sensor series (Section 10 — "Simulated Live Data") --
export const SENSOR_SERIES = Array.from({ length: 12 }, (_, i) => ({
  t: `${8 + i}:00`,
  temp: +(33.5 + Math.sin(i / 2) * 1.8 + 1).toFixed(1),
  humidity: Math.round(58 + Math.cos(i / 2) * 6),
  vibration: +(0.28 + Math.sin(i / 3) * 0.08).toFixed(2),
}));

// ---- Alerts (Freshly empty) ----------------------------------------------
export const ALERTS = [];

// ---- Hive inspections (Freshly empty) ------------------------------------
export const INITIAL_INSPECTIONS = [];

// ---- Processors / Laboratories / Retailers (directory data) ------------
export const PROCESSORS = [
  { processorId: "PR-001", facilityId: "FAC-01", name: "Green Valley Honey", location: "Coimbatore" },
  { processorId: "PR-045", facilityId: "FAC-02", name: "Arun Honey Collective", location: "Salem" },
];

export const LABORATORIES = [
  { labId: "LAB-001", name: "ABC Food Testing Laboratory", location: "Chennai", distance: "4.2 km", accreditation: "NABL Accredited", services: ["Purity", "Moisture", "Adulteration"], available: true },
  { labId: "LAB-002", name: "GreenLab Food Analytics", location: "Coimbatore", distance: "9.8 km", accreditation: "AGMARK Empanelled", services: ["Purity", "Sugar Profile"], available: true },
  { labId: "LAB-003", name: "National Honey Quality Lab", location: "Madurai", distance: "15.6 km", accreditation: "NABL Accredited", services: ["Purity", "Moisture", "Sugar Profile", "Adulteration"], available: true },
  { labId: "LAB-004", name: "Southern Honey Institute", location: "Dindigul", distance: "18.3 km", accreditation: "NABL Accredited", services: ["Moisture", "Adulteration"], available: false },
  { labId: "LAB-005", name: "Kongu Quality Testing", location: "Namakkal", distance: "21.1 km", accreditation: "AGMARK Empanelled", services: ["Purity"], available: true },
];

export const RETAILERS = [
  { retailerId: "RET-001", outletId: "OUT-01", name: "Nilgiris Fresh Mart", location: "Coimbatore" },
];

// ---- Batches (Freshly empty for manual feeding) -------------------------
export const INITIAL_BATCHES = [];

// ---- Batch relationships / splitting (Freshly empty) -------------------
export const INITIAL_BATCH_RELATIONSHIPS = [];

// ---- Provenance events ---------------------------------------------------
export function makeCanonicalEvent({ eventId, batchId, eventType, actorId, occurredAt, recordedAt, payload }) {
  return {
    eventId,
    batchId,
    eventType,
    actorId,
    occurredAt,
    recordedAt,
    payload,
    payloadHash: null,
    previousEventHash: null,
    signature: null,
    blockchainTx: null,
  };
}

export const INITIAL_PROVENANCE_EVENTS = [];

// ---- Lab test requests (Freshly empty) -----------------------------------
export const INITIAL_TEST_REQUESTS = [];

// ---- Quality results / certificates (Freshly empty) ---------------------
export const INITIAL_QUALITY_RESULTS = [];
export const INITIAL_CERTIFICATES = [];

// ---- KVIC user verification queue (Freshly empty) -----------------------
export const INITIAL_PENDING_APPLICATIONS = [];

// ---- Notifications (Freshly empty) ---------------------------------------
export const INITIAL_NOTIFICATIONS = [];

// ---- Monthly honey production (for charts) --------------------------------
export const PRODUCTION_SERIES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"].map((m, i) => ({
  m,
  litres: 0,
}));

export const HEALTH_SPLIT = [
  { name: "Healthy", value: 0, tone: "success" },
  { name: "Warning", value: 0, tone: "warning" },
  { name: "Critical", value: 0, tone: "critical" },
];
