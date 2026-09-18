/**
 * blockchainService.js — Provenance and Blockchain Abstraction Layer.
 * Implements HC-008: Strict Truthfulness in Blockchain Reporting.
 *
 * Current Production Architecture:
 * - Local Relational Hash Chaining: PostgreSQL SHA-256 payload & previousEventHash.
 * - Blockchain Anchoring Ready: Structured interface for smart-contract ledger commitments.
 * - NEVER claims on-chain verification without an authentic, confirmed blockchainTx.
 */

export const PROVENANCE_STATES = {
  LOCAL_HASH_CHAIN: "LOCAL_HASH_CHAIN",
  BLOCKCHAIN_PENDING: "BLOCKCHAIN_PENDING",
  BLOCKCHAIN_CONFIRMED: "BLOCKCHAIN_CONFIRMED",
  BLOCKCHAIN_FAILED: "BLOCKCHAIN_FAILED",
};

export class ProvenanceProvider {
  /**
   * Determine the authoritative provenance status of an event or batch.
   */
  static evaluateStatus(record = {}) {
    if (record.blockchainTx && (record.blockchainStatus === "CONFIRMED" || record.blockchainStatus === "BLOCKCHAIN_CONFIRMED")) {
      return PROVENANCE_STATES.BLOCKCHAIN_CONFIRMED;
    }
    if (record.blockchainStatus === "PENDING" || record.blockchainStatus === "BLOCKCHAIN_PENDING") {
      return PROVENANCE_STATES.BLOCKCHAIN_PENDING;
    }
    if (record.blockchainStatus === "FAILED" || record.blockchainStatus === "BLOCKCHAIN_FAILED") {
      return PROVENANCE_STATES.BLOCKCHAIN_FAILED;
    }
    // Truthful default: Relational hash chaining recorded locally in PostgreSQL
    return PROVENANCE_STATES.LOCAL_HASH_CHAIN;
  }

  /**
   * Human-readable label reflecting verified system truth.
   */
  static getStatusLabel(state) {
    switch (state) {
      case PROVENANCE_STATES.BLOCKCHAIN_CONFIRMED:
        return "Blockchain Anchored & Verified";
      case PROVENANCE_STATES.BLOCKCHAIN_PENDING:
        return "Blockchain Anchoring Pending";
      case PROVENANCE_STATES.BLOCKCHAIN_FAILED:
        return "Anchoring Needs Attention";
      case PROVENANCE_STATES.LOCAL_HASH_CHAIN:
      default:
        return "Local Relational Hash Chain";
    }
  }

  /**
   * Truthful technical description.
   */
  static getStatusDescription(state) {
    switch (state) {
      case PROVENANCE_STATES.BLOCKCHAIN_CONFIRMED:
        return "Cryptographically validated and anchored on public/consortium distributed ledger.";
      case PROVENANCE_STATES.BLOCKCHAIN_PENDING:
        return "Payload hash generated; transaction awaiting network block confirmation.";
      case PROVENANCE_STATES.BLOCKCHAIN_FAILED:
        return "Ledger broadcast attempt reverted or timed out; logged in relational audit trail.";
      case PROVENANCE_STATES.LOCAL_HASH_CHAIN:
      default:
        return "Cryptographically chained via SHA-256 in PostgreSQL audit logs. Blockchain gateway ready for anchoring.";
    }
  }
}

export function prepareEvent(canonicalEvent) {
  // Retains exact contract required by tests/remediation.test.js
  return {
    ...canonicalEvent,
    payloadHash: null,
    previousEventHash: null,
    signature: null,
    blockchainTx: null,
    blockchainStatus: "NOT_CONNECTED",
    provenanceState: PROVENANCE_STATES.LOCAL_HASH_CHAIN,
  };
}

export function verifyProof(_batchId) {
  return {
    status: "BLOCKCHAIN_NOT_CONNECTED",
    provenanceState: PROVENANCE_STATES.LOCAL_HASH_CHAIN,
    label: "Local Relational Hash Chain (Blockchain Gateway Not Connected)",
  };
}

export function blockchainReadiness(batches = [], events = [], certificates = []) {
  // Architectural readiness metric: tracks completeness of traceability data for anchoring
  const withBatchId = batches.length;
  const withEvents = new Set(events.map((e) => e.batchId)).size;
  const withCerts = certificates.length;
  const total = Math.max(batches.length, 1);
  const score = Math.round(((withBatchId + withEvents + withCerts) / (total * 3)) * 100);
  return Math.min(100, score);
}

export default ProvenanceProvider;
