/**
 * hiveService.js — Apiary telemetry, alert filtering, and simulated health analysis.
 * "Simulated Live Data" label applies to telemetry and AI predictions sourced here.
 */
import { HIVES, ALERTS } from "../data/mockData.js";

function hashString(str = "") {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const FALLBACK_SEED_HIVES = [
  { hiveId: "H-1024", producerId: "BK-001", region: "Tamil Nadu", block: "Apiary A — Block 03", status: "healthy", temp: 34.8, humidity: 61, vibration: 0.32, sensor: "online", battery: 87 },
  { hiveId: "H-1025", producerId: "BK-001", region: "Tamil Nadu", block: "Apiary A — Block 04", status: "healthy", temp: 35.1, humidity: 58, vibration: 0.29, sensor: "online", battery: 92 },
  { hiveId: "H-1026", producerId: "BK-001", region: "Tamil Nadu", block: "Apiary B — Block 01", status: "warning", temp: 37.6, humidity: 68, vibration: 0.41, sensor: "online", battery: 74 },
  { hiveId: "H-1030", producerId: "BK-001", region: "Tamil Nadu", block: "Apiary B — Block 02", status: "critical", temp: 39.2, humidity: 82, vibration: 0.58, sensor: "online", battery: 21 },
  { hiveId: "H-1032", producerId: "BK-001", region: "Tamil Nadu", block: "Apiary A — Block 05", status: "healthy", temp: 34.5, humidity: 60, vibration: 0.31, sensor: "online", battery: 95 },
  { hiveId: "H-2011", producerId: "BK-045", region: "Tamil Nadu", block: "Apiary C — Block 01", status: "healthy", temp: 34.2, humidity: 57, vibration: 0.27, sensor: "online", battery: 88 },
];

export function listHives(producerId) {
  const source = HIVES.length > 0 ? HIVES : FALLBACK_SEED_HIVES;
  return producerId ? source.filter((h) => h.producerId === producerId) : source;
}

export function getHive(hiveId, producerId = null) {
  const source = HIVES.length > 0 ? HIVES : FALLBACK_SEED_HIVES;
  const hive = source.find((h) => h.hiveId === hiveId) || null;
  if (!hive) return null;
  if (producerId && hive.producerId !== producerId) return null;
  return hive;
}

export function getSensorSeries(hiveId = "H-DEFAULT", baseTemp = 34.8, baseHumidity = 60, baseVibration = 0.32) {
  const seed = hashString(hiveId);
  const tempOffset = ((seed % 7) - 3) * 0.4;
  const humidOffset = ((seed % 11) - 5) * 1.2;
  const vibeOffset = ((seed % 5) - 2) * 0.03;

  return Array.from({ length: 12 }, (_, i) => {
    const diurnalFactor = Math.sin((i / 11) * Math.PI); // warmer midday
    const diurnalCool = Math.cos((i / 11) * Math.PI);
    const noise = Math.sin(i * 1.7 + (seed % 10)) * 0.3;

    return {
      t: `${String(8 + i).padStart(2, "0")}:00`,
      temp: +(baseTemp + tempOffset + diurnalFactor * 1.6 + noise).toFixed(1),
      humidity: Math.round(baseHumidity + humidOffset - diurnalFactor * 8 + noise * 3),
      vibration: +(Math.max(0.12, baseVibration + vibeOffset + diurnalCool * 0.05 + noise * 0.02)).toFixed(2),
    };
  });
}

export function listAlerts(hiveId) {
  return hiveId ? ALERTS.filter((a) => a.hiveId === hiveId) : ALERTS;
}

import { SimulationProvider } from "./aiHealthProvider.js";

export function runAiHealthAnalysis(hiveId, imageFile) {
  return SimulationProvider.analyzeFrame(hiveId, imageFile);
}
