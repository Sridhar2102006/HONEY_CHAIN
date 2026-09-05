/**
 * provenanceService.js — MOCK.
 *
 * This is the single place that constructs canonical provenance events.
 * Every meaningful supply-chain action in the app should route through
 * createEvent() so the timeline stays consistent and so a future backend
 * integration only needs to intercept this one function.
 */
import { generateEventId } from "../utils/ids.js";
import { makeCanonicalEvent } from "../data/mockData.js";

export function createEvent({ batchId, eventType, actorId, occurredAt, payload }) {
  const now = new Date().toISOString();
  return makeCanonicalEvent({
    eventId: generateEventId(),
    batchId,
    eventType,
    actorId,
    occurredAt: occurredAt || now,
    recordedAt: now,
    payload: payload || {},
  });
}

export function getBatchTimeline(events, batchId) {
  return events
    .filter((e) => e.batchId === batchId)
    .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));
}

export const EVENT_TYPES = [
  "HARVESTED",
  "EXTRACTED",
  "PROCESSED",
  "QUALITY_TEST_REQUESTED",
  "QUALITY_VERIFY",
  "BATCH_SPLIT",
  "BATCH_TRANSFORMED",
  "CERTIFICATE_ISSUED",
  "RETAIL_RECEIVE",
];
