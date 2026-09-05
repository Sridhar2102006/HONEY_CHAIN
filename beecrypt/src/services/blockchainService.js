/**
 * blockchainService.js — PLACEHOLDER ONLY.
 *
 * This file intentionally does NOT talk to a blockchain, does NOT compute
 * hashes, and does NOT sign anything. It exists so the rest of the app has
 * one clearly-labelled seam to swap in real blockchain-gateway calls later.
 *
 * A real implementation would likely:
 *   1. Accept a canonical event object (see provenanceService.createEvent).
 *   2. Compute a deterministic SHA-256 payloadHash server-side.
 *   3. Look up the previous event's hash for that batch.
 *   4. Have an authorized backend/wallet sign the event.
 *   5. Submit the signed event to the blockchain gateway / smart contract.
 *   6. Return a transaction reference for display.
 */

export function prepareEvent(canonicalEvent) {
  // Frontend just returns the event unchanged, clearly marked as pending.
  return {
    ...canonicalEvent,
    payloadHash: null,
    previousEventHash: null,
    signature: null,
    blockchainTx: null,
    status: "Integration Pending",
  };
}

export function verifyProof(_batchId) {
  // No real verification is possible without a backend + chain. Always
  // reports "pending" from the frontend.
  return { status: "Integration Pending" };
}

export function blockchainReadiness(batches, events, certificates) {
  // A purely frontend, illustrative percentage (Section 41) — NOT a real
  // on-chain readiness metric.
  const withBatchId = batches.length;
  const withEvents = new Set(events.map((e) => e.batchId)).size;
  const withCerts = certificates.length;
  const total = Math.max(batches.length, 1);
  const score = Math.round(((withBatchId + withEvents + withCerts) / (total * 3)) * 100);
  return Math.min(100, score);
}
