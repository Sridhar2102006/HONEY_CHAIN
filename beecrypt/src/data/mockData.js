/**
 * mockData.js
 * ---------------------------------------------------------------------
 * Single source of shared mock data for the whole app. In a production
 * system every one of these arrays would instead be fetched from a
 * backend (see src/services/*.js) — the shapes here are deliberately
 * designed to be what that backend would return, so swapping the mock
 * services for real API calls later shouldn't require touching any
 * page or component.
 * ---------------------------------------------------------------------
 */

// ---- Demo accounts (Section 9) -----------------------------------------
// "Demo Authentication" — no real auth server is involved.
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
  "multi@beecrypt.demo": {
    actorId: "ORG-501",
    orgId: "ORG-501",
    name: "Arun Kumar",
    roles: ["beekeeper", "processor", "laboratory"],
    org: "Arun Honey Collective",
    region: "Salem",
    location: "Salem, Tamil Nadu",
    multiActorIds: { beekeeper: "BK-045", processor: "PR-045", laboratory: "LAB-045" },
  },
};

// ---- Organizations (Section 6) -----------------------------------------
export const ORGANIZATIONS = [
  { orgId: "ORG-101", name: "Kumar Apiaries", type: "beekeeper", region: "Erode" },
  { orgId: "ORG-202", name: "Green Valley Honey", type: "processor", region: "Coimbatore" },
  { orgId: "ORG-303", name: "ABC Food Testing Laboratory", type: "laboratory", region: "Chennai" },
  { orgId: "ORG-001", name: "Khadi & Village Industries Commission", type: "kvic", region: "New Delhi" },
  { orgId: "ORG-501", name: "Arun Honey Collective", type: "multi", region: "Salem" },
];

// ---- Hives (Section 10) -------------------------------------------------
export const HIVES = [
  { hiveId: "H-1024", producerId: "BK-001", region: "Erode", block: "Apiary A — Block 03", status: "healthy", temp: 34.8, humidity: 61, vibration: 0.32, sensor: "online", battery: 87 },
  { hiveId: "H-1025", producerId: "BK-001", region: "Erode", block: "Apiary A — Block 04", status: "healthy", temp: 35.1, humidity: 58, vibration: 0.29, sensor: "online", battery: 92 },
  { hiveId: "H-1026", producerId: "BK-001", region: "Erode", block: "Apiary B — Block 01", status: "warning", temp: 37.6, humidity: 68, vibration: 0.41, sensor: "online", battery: 74 },
  { hiveId: "H-1030", producerId: "BK-001", region: "Erode", block: "Apiary B — Block 02", status: "critical", temp: 39.2, humidity: 82, vibration: 0.58, sensor: "online", battery: 21 },
  { hiveId: "H-1032", producerId: "BK-001", region: "Erode", block: "Apiary A — Block 05", status: "healthy", temp: 34.5, humidity: 60, vibration: 0.31, sensor: "online", battery: 95 },
  { hiveId: "H-2011", producerId: "BK-045", region: "Salem", block: "Apiary C — Block 01", status: "healthy", temp: 34.2, humidity: 57, vibration: 0.27, sensor: "online", battery: 88 },
];

// ---- Simulated live sensor series (Section 10 — "Simulated Live Data") --
export const SENSOR_SERIES = Array.from({ length: 12 }, (_, i) => ({
  t: `${8 + i}:00`,
  temp: +(33.5 + Math.sin(i / 2) * 1.8 + 1).toFixed(1),
  humidity: Math.round(58 + Math.cos(i / 2) * 6),
  vibration: +(0.28 + Math.sin(i / 3) * 0.08).toFixed(2),
}));

// ---- Alerts --------------------------------------------------------------
export const ALERTS = [
  { alertId: "AL-01", level: "critical", hiveId: "H-1024", title: "High Temperature", body: "reached 39.2°C. Inspect hive ventilation.", occurredAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { alertId: "AL-02", level: "warning", hiveId: "H-1030", title: "Abnormal Humidity", body: "humidity reached 82%.", occurredAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { alertId: "AL-03", level: "warning", hiveId: "H-1026", title: "Abnormal Vibration", body: "unusual vibration pattern detected.", occurredAt: new Date(Date.now() - 20 * 60000).toISOString() },
];

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
  // Section 23 — data-model-ready, no dedicated workspace yet.
  { retailerId: "RET-001", outletId: "OUT-01", name: "Nilgiris Fresh Mart", location: "Coimbatore" },
];

// ---- Batches (Section 5, 11) --------------------------------------------
// stage: 1 Harvested/Extracted 2 Processing Started 3 Processed 4 Sent to Lab 5 Quality Verified 6 Certified
export const INITIAL_BATCHES = [
  {
    batchId: "BEE-2026-001024",
    producerId: "BK-001",
    producerName: "Rajesh Kumar",
    hiveId: "H-1024",
    region: "Erode",
    honeyType: "Multifloral",
    floralSource: "Eucalyptus / Wildflower",
    harvestDate: "2026-09-04",
    quantity: 18.5,
    processorId: "PR-001",
    processingMethod: "Cold Extraction",
    processingStatus: "Completed",
    labId: "LAB-001",
    testStatus: "PASS",
    certificateId: "AGMARK-2026-001024",
    certStatus: "CERTIFIED",
    stage: 6,
    parentBatchId: null,
  },
  {
    batchId: "BEE-2026-000998",
    producerId: "BK-001",
    producerName: "Rajesh Kumar",
    hiveId: "H-1025",
    region: "Erode",
    honeyType: "Forest Honey",
    floralSource: "Mixed Forest Bloom",
    harvestDate: "2026-08-29",
    quantity: 22.0,
    processorId: "PR-001",
    processingMethod: null,
    processingStatus: "In Progress",
    labId: null,
    testStatus: "PENDING",
    certificateId: null,
    certStatus: "PENDING",
    stage: 2,
    parentBatchId: null,
  },
  {
    batchId: "BEE-2026-000971",
    producerId: "BK-001",
    producerName: "Rajesh Kumar",
    hiveId: "H-1032",
    region: "Erode",
    honeyType: "Multifloral",
    floralSource: "Coriander / Wildflower",
    harvestDate: "2026-08-22",
    quantity: 15.2,
    processorId: "PR-001",
    processingMethod: "Cold Extraction",
    processingStatus: "Completed",
    labId: "LAB-002",
    testStatus: "PENDING",
    certificateId: null,
    certStatus: "PENDING",
    stage: 4,
    parentBatchId: null,
  },
];

// ---- Batch relationships / splitting (Section 14) -----------------------
export const INITIAL_BATCH_RELATIONSHIPS = [
  // Example (empty by default): { parentBatchId, childBatchId, relationshipType, transformationDate, quantity, reason }
];

// ---- Provenance events (Section 3, 4, 27) --------------------------------
// Canonical shape. Hash/signature fields are always null on the frontend —
// they exist only so the object shape matches what the backend/blockchain
// gateway will eventually populate.
export function makeCanonicalEvent({ eventId, batchId, eventType, actorId, occurredAt, recordedAt, payload }) {
  return {
    eventId,
    batchId,
    eventType,
    actorId,
    occurredAt,
    recordedAt,
    payload,
    payloadHash: null, // Backend will generate deterministic SHA-256 hash
    previousEventHash: null, // Backend will link to the previous event's hash
    signature: null, // Backend/wallet layer will generate digital signature
    blockchainTx: null, // Blockchain gateway will populate once submitted
  };
}

export const INITIAL_PROVENANCE_EVENTS = [
  makeCanonicalEvent({
    eventId: "EVT-00041",
    batchId: "BEE-2026-001024",
    eventType: "HARVESTED",
    actorId: "BK-001",
    occurredAt: "2026-09-04T06:30:00",
    recordedAt: "2026-09-04T06:32:00",
    payload: { hiveId: "H-1024", honeyType: "Multifloral" },
  }),
  makeCanonicalEvent({
    eventId: "EVT-00042",
    batchId: "BEE-2026-001024",
    eventType: "EXTRACTED",
    actorId: "BK-001",
    occurredAt: "2026-09-04T09:00:00",
    recordedAt: "2026-09-04T09:05:00",
    payload: { quantity: 18.5, unit: "L" },
  }),
  makeCanonicalEvent({
    eventId: "EVT-00043",
    batchId: "BEE-2026-001024",
    eventType: "PROCESSED",
    actorId: "PR-001",
    occurredAt: "2026-09-04T14:00:00",
    recordedAt: "2026-09-04T14:10:00",
    payload: { processingMethod: "Cold Extraction" },
  }),
  makeCanonicalEvent({
    eventId: "EVT-00044",
    batchId: "BEE-2026-001024",
    eventType: "QUALITY_VERIFY",
    actorId: "LAB-001",
    occurredAt: "2026-09-05T11:30:00",
    recordedAt: "2026-09-05T11:35:00",
    payload: { testId: "TEST-00199", result: "PASS" },
  }),
  makeCanonicalEvent({
    eventId: "EVT-00045",
    batchId: "BEE-2026-001024",
    eventType: "CERTIFICATE_ISSUED",
    actorId: "LAB-001",
    occurredAt: "2026-09-05T12:00:00",
    recordedAt: "2026-09-05T12:02:00",
    payload: { certificateId: "AGMARK-2026-001024" },
  }),
];

// ---- Lab test requests (Section 17) --------------------------------------
export const INITIAL_TEST_REQUESTS = [
  {
    requestId: "REQ-001",
    batchId: "BEE-2026-000971",
    labId: "LAB-002",
    sampleQuantityMl: 250,
    tests: ["Purity", "Moisture", "Adulteration"],
    requestedDate: "2026-08-24",
    notes: "",
    status: "Pending Laboratory Acceptance",
  },
];

// ---- Quality results / certificates (Section 19, 21) ---------------------
export const INITIAL_QUALITY_RESULTS = [
  {
    testId: "TEST-00199",
    batchId: "BEE-2026-001024",
    labId: "LAB-001",
    testDate: "2026-09-05",
    moisture: 17.2,
    sucrose: 38,
    fructose: 39,
    glucose: 34,
    adulteration: "Not Detected",
    testStatus: "PASS",
    verifierId: "LAB-001-V1",
  },
];

export const INITIAL_CERTIFICATES = [
  {
    certificateId: "AGMARK-2026-001024",
    batchId: "BEE-2026-001024",
    labId: "LAB-001",
    testDate: "2026-09-05",
    issueDate: "2026-09-05",
    result: "PASS",
    verifierId: "LAB-001-V1",
    fileName: "AGMARK-2026-001024.pdf",
    uploaded: true,
  },
];

// ---- KVIC user verification queue (Section 22) ---------------------------
export const INITIAL_PENDING_APPLICATIONS = [
  { name: "Suresh Pandian", email: "suresh.p@example.com", roles: ["beekeeper", "processor"], region: "Madurai", docs: 3, status: "Pending" },
  { name: "Lakshmi Narayan", email: "lakshmi.n@example.com", roles: ["laboratory"], region: "Chennai", docs: 2, status: "Pending" },
  { name: "Karthik Raja", email: "karthik.r@example.com", roles: ["beekeeper"], region: "Theni", docs: 3, status: "Pending" },
];

// ---- Notifications ---------------------------------------------------------
export const INITIAL_NOTIFICATIONS = [
  { id: 1, text: "Hive H-1024 temperature is high.", read: false },
  { id: 2, text: "New laboratory request received for BEE-2026-000971.", read: false },
  { id: 3, text: "Certificate issued for BEE-2026-001024.", read: true },
  { id: 4, text: "KVIC approved your Processor role.", read: true },
];

// ---- Monthly honey production (for charts) --------------------------------
export const PRODUCTION_SERIES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"].map((m, i) => ({
  m,
  litres: Math.round(900 + i * 60 + Math.sin(i) * 120),
}));

export const HEALTH_SPLIT = [
  { name: "Healthy", value: 36, tone: "success" },
  { name: "Warning", value: 4, tone: "warning" },
  { name: "Critical", value: 2, tone: "critical" },
];
