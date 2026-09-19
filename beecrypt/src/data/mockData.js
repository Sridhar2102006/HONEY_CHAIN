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
    name: "Lead Beekeeper",
    roles: ["beekeeper"],
    org: "HoneyChain Apiary Network",
    region: "Tamil Nadu",
    location: "Tamil Nadu, India",
  },
  "processor@beecrypt.demo": {
    actorId: "PR-001",
    orgId: "ORG-202",
    name: "Processing Supervisor",
    roles: ["processor"],
    org: "HoneyChain Processing Facility",
    region: "Tamil Nadu",
    location: "Tamil Nadu, India",
  },
  "lab@beecrypt.demo": {
    actorId: "LAB-001",
    orgId: "ORG-303",
    name: "Quality Analyst",
    roles: ["laboratory"],
    org: "National Quality Testing Laboratory",
    region: "Chennai",
    location: "Chennai, India",
  },
  "admin@beecrypt.demo": {
    actorId: "KVIC-001",
    orgId: "ORG-001",
    name: "KVIC Regulatory Officer",
    roles: ["kvic"],
    org: "Khadi & Village Industries Commission",
    region: "New Delhi",
    location: "New Delhi, India",
  },
  "retailer@beecrypt.demo": {
    actorId: "RET-001",
    orgId: "ORG-401",
    name: "Retail Manager",
    roles: ["retailer"],
    org: "HoneyChain Retail Center",
    region: "Tamil Nadu",
    location: "Tamil Nadu, India",
  },
  "verifier@beecrypt.demo": {
    actorId: "LAB-001",
    orgId: "ORG-303",
    name: "Quality Verifier",
    roles: ["laboratory"],
    org: "National Quality Testing Laboratory",
    region: "Chennai",
    location: "Chennai, India",
  },
  "multi@beecrypt.demo": {
    actorId: "ORG-501",
    orgId: "ORG-501",
    name: "Operations Lead",
    roles: ["beekeeper", "processor", "laboratory", "retailer", "kvic"],
    org: "HoneyChain State Cooperative",
    region: "Tamil Nadu",
    location: "Tamil Nadu, India",
    multiActorIds: { beekeeper: "BK-045", processor: "PR-045", laboratory: "LAB-045", retailer: "RET-001", kvic: "KVIC-001" },
  },
};

// ---- Organizations (Section 6) -----------------------------------------
export const ORGANIZATIONS = [
  { orgId: "ORG-101", name: "HoneyChain Apiary Network", type: "beekeeper", region: "Tamil Nadu" },
  { orgId: "ORG-202", name: "HoneyChain Processing Facility", type: "processor", region: "Tamil Nadu" },
  { orgId: "ORG-303", name: "National Quality Testing Laboratory", type: "laboratory", region: "Chennai" },
  { orgId: "ORG-401", name: "HoneyChain Retail Center", type: "retailer", region: "Tamil Nadu" },
  { orgId: "ORG-001", name: "Khadi & Village Industries Commission (KVIC)", type: "kvic", region: "New Delhi" },
  { orgId: "ORG-501", name: "HoneyChain State Cooperative", type: "multi", region: "Tamil Nadu" },
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
  { processorId: "PR-001", facilityId: "FAC-01", name: "HoneyChain Processing Facility", location: "Tamil Nadu" },
  { processorId: "PR-045", facilityId: "FAC-02", name: "HoneyChain State Cooperative", location: "Tamil Nadu" },
];

export const LABORATORIES = [
  { labId: "LAB-001", name: "National Quality Testing Laboratory", location: "Chennai", distance: "4.2 km", accreditation: "NABL Accredited", services: ["Purity", "Moisture", "Adulteration"], available: true },
  { labId: "LAB-002", name: "Central AGMARK Honey Analytics", location: "Coimbatore", distance: "9.8 km", accreditation: "AGMARK Empanelled", services: ["Purity", "Sugar Profile"], available: true },
  { labId: "LAB-003", name: "National Honey Quality Directorate Lab", location: "Madurai", distance: "15.6 km", accreditation: "NABL Accredited", services: ["Purity", "Moisture", "Sugar Profile", "Adulteration"], available: true },
  { labId: "LAB-004", name: "Regional Food Safety Institute", location: "Dindigul", distance: "18.3 km", accreditation: "NABL Accredited", services: ["Moisture", "Adulteration"], available: false },
  { labId: "LAB-005", name: "State Quality Control Laboratory", location: "Namakkal", distance: "21.1 km", accreditation: "AGMARK Empanelled", services: ["Purity"], available: true },
];

export const RETAILERS = [
  { retailerId: "RET-001", outletId: "OUT-01", name: "HoneyChain Retail Center", location: "Tamil Nadu" },
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
