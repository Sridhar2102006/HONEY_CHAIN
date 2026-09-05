/**
 * hiveService.js — MOCK. Later: real IoT ingestion + backend REST/GraphQL API.
 * "Simulated Live Data" label applies to anything sourced from here.
 */
import { HIVES, SENSOR_SERIES, ALERTS } from "../data/mockData.js";

export function listHives(producerId) {
  return producerId ? HIVES.filter((h) => h.producerId === producerId) : HIVES;
}

export function getHive(hiveId) {
  return HIVES.find((h) => h.hiveId === hiveId) || null;
}

export function getSensorSeries(_hiveId) {
  // In production this would stream from IoT devices via MQTT -> backend -> API.
  return SENSOR_SERIES;
}

export function listAlerts(hiveId) {
  return hiveId ? ALERTS.filter((a) => a.hiveId === hiveId) : ALERTS;
}

export function runAiHealthAnalysis(_hiveId, _imageFile) {
  // "AI-assisted analysis — Demo". No real model runs here.
  return new Promise((resolve) => {
    setTimeout(() => {
      const risk = Math.random() > 0.65;
      resolve(
        risk
          ? { status: "RISK", label: "Varroa Mite Risk", confidence: 89.4, recommendation: "Inspect the colony." }
          : { status: "HEALTHY", label: "No disease detected", confidence: 94.7, recommendation: "No action needed." }
      );
    }, 1800);
  });
}
