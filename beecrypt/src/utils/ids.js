/**
 * ID + code generators.
 *
 * IMPORTANT: These are frontend-only mock generators for demo purposes.
 * In production, permanent Batch IDs and Actor/Organization IDs would be
 * assigned by the backend (and, for on-chain identifiers, potentially
 * anchored to the blockchain gateway) to guarantee global uniqueness.
 */

let batchCounter = 1024;
let eventCounter = 44;
let certCounter = 1024;
let testCounter = 200;

export function generateBatchId() {
  batchCounter += 1;
  return `BEE-2026-${String(batchCounter).padStart(6, "0")}`;
}

export function generateChildBatchId(parentId, suffix) {
  return `${parentId}-${suffix}`;
}

export function generateEventId() {
  eventCounter += 1;
  return `EVT-${String(eventCounter).padStart(5, "0")}`;
}

export function generateCertificateId(batchId) {
  certCounter += 1;
  return `AGMARK-2026-${String(certCounter).padStart(6, "0")}`;
}

export function generateTestId() {
  testCounter += 1;
  return `TEST-${String(testCounter).padStart(5, "0")}`;
}

export function generateActorId(role) {
  const prefixMap = {
    beekeeper: "BK",
    processor: "PR",
    laboratory: "LAB",
    kvic: "KVIC",
    retailer: "RET",
  };
  const prefix = prefixMap[role] || "ORG";
  const n = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${n}`;
}

export function generateOrgId() {
  const n = Math.floor(100 + Math.random() * 900);
  return `ORG-${n}`;
}
