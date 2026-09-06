import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Hexagon } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import SensorCard from "../../components/SensorCard.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import * as hiveService from "../../services/hiveService.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import sensorApi from "../../api/sensorApi.js";

const SENSOR_METRICS = [
  { id: "temp", label: "Temperature", unit: "°C", color: "#D97706" },
  { id: "humidity", label: "Humidity", unit: "%", color: "#166534" },
  { id: "vibration", label: "Vibration", unit: "g", color: "#14532D" },
];

const OFFLINE_THRESHOLD_MS = 15000; // Sensor considered offline if no telemetry in 15 seconds

function formatTimeAgo(date, currentTimestamp) {
  if (!date) return "awaiting signal";
  const diffSec = Math.max(0, Math.floor((currentTimestamp - new Date(date).getTime()) / 1000));
  if (diffSec < 3) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  return `${diffHours}h ago`;
}

export default function LiveMonitoring() {
  const { currentActorId } = useAuth();
  const { hives: allHives } = useApp();
  const hives = (allHives || []).filter((h) => !currentActorId || h.producerId === currentActorId);

  const [selectedHiveId, setSelectedHiveId] = useState(hives[0]?.hiveId || "");
  const [activeMetric, setActiveMetric] = useState("temp");

  // Real-time sensor state
  const [latestReading, setLatestReading] = useState(null);
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [now, setNow] = useState(Date.now());

  const selectedHive = hives.find((h) => h.hiveId === selectedHiveId) || hives[0];

  // 1. Ticker for real-time "Updated X seconds ago" indicator and offline detection
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch initial MongoDB latest reading, historical readings, and subscribe to SSE channel
  useEffect(() => {
    if (!selectedHive?.hiveId) return;

    let isMounted = true;
    const targetHiveId = selectedHive.hiveId;

    // Reset local state on hive switch
    setLatestReading(null);
    setLastReceivedAt(null);
    setHistoryData([]);

    // Step A: Load latest reading from MongoDB Atlas for immediate UI population
    sensorApi
      .getLatest({ hiveId: targetHiveId })
      .then((res) => {
        if (!isMounted || !res?.reading) return;
        setLatestReading(res.reading);
        setLastReceivedAt(new Date(res.reading.receivedAt || res.reading.recordedAt));
      })
      .catch(() => {
        // No prior readings in DB yet for this hive; will rely on live arrivals
      });

    // Step B: Load recent history for chart
    sensorApi
      .getHistory({ hiveId: targetHiveId, limit: 20 })
      .then((res) => {
        if (!isMounted || !res?.readings || res.readings.length === 0) return;
        const formatted = res.readings.map((r) => ({
          t: new Date(r.receivedAt || r.recordedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          temp: r.temperature,
          humidity: r.humidity,
          vibration: r.vibration ? 1 : r.vibrationValue || 0,
        }));
        setHistoryData(formatted);
      })
      .catch(() => {
        // Fall back to synthetic initial series if DB is empty
      });

    // Step C: Connect to native SSE real-time stream
    const unsubscribe = sensorApi.subscribeToStream({
      hiveId: targetHiveId,
      onReading: (reading) => {
        if (!isMounted) return;
        setLatestReading(reading);
        const timestamp = new Date(reading.receivedAt || Date.now());
        setLastReceivedAt(timestamp);

        // Append live reading to rolling chart series
        setHistoryData((prev) => {
          const newPoint = {
            t: timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temp: reading.temperature,
            humidity: reading.humidity,
            vibration: reading.vibration ? 1 : reading.vibrationValue || 0,
          };
          return [...prev, newPoint].slice(-25);
        });
      },
      onError: (err) => {
        console.warn("[SSE] Sensor stream disconnected or reconnecting...", err);
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [selectedHive?.hiveId]);

  // Derived connection status
  const isSensorOnline = Boolean(
    lastReceivedAt && now - new Date(lastReceivedAt).getTime() < OFFLINE_THRESHOLD_MS
  );
  const timeAgo = formatTimeAgo(lastReceivedAt, now);

  // Dynamic values bound to live ESP32 DevKit sensor telemetry
  const displayTemp =
    latestReading?.temperature !== undefined
      ? `${latestReading.temperature.toFixed(1)}°C`
      : `${selectedHive?.temp || 34.8}°C`;

  const displayTempStatus = latestReading
    ? latestReading.temperature > 38 || latestReading.temperature < 15
      ? "Alert"
      : "Normal"
    : selectedHive?.status === "critical"
    ? "Alert"
    : "Normal";

  const displayHumid =
    latestReading?.humidity !== undefined
      ? `${latestReading.humidity.toFixed(1)}%`
      : `${selectedHive?.humidity || 60}%`;

  const displayHumidStatus = latestReading
    ? latestReading.humidity < 40 || latestReading.humidity > 80
      ? "Alert"
      : "Normal"
    : "Normal";

  const displayVibe =
    latestReading !== null
      ? latestReading.vibration
        ? "Detected"
        : "Normal"
      : `${selectedHive?.vibration || 0.32}g`;

  const displayVibeStatus = latestReading
    ? latestReading.vibration
      ? "Alert"
      : "Normal"
    : "Normal";

  // Chart data: prefer live/MongoDB history, fall back to baseline series
  const fallbackSeries = selectedHive
    ? hiveService.getSensorSeries(
        selectedHive.hiveId,
        selectedHive.temp || 34.8,
        selectedHive.humidity || 60,
        selectedHive.vibration || 0.32
      )
    : [];

  const chartSeries = historyData.length > 0 ? historyData : fallbackSeries;
  const currentMetricObj = SENSOR_METRICS.find((m) => m.id === activeMetric) || SENSOR_METRICS[0];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Live Sensor Stream"
        sub="Real-time IoT telemetry from connected apiary sensor nodes."
      />

      {hives.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#ECE6D6] p-8 text-center shadow-xs">
          <Hexagon size={36} className="text-[#C9C2AC] mx-auto mb-2" />
          <h3 className="font-bold text-base text-bc-dark">No IoT Apiary Hives Connected</h3>
          <p className="text-xs text-[#8A9086] mt-1 max-w-sm mx-auto">
            You need to register a hive box to stream environmental telemetry, temperature, humidity, and colony vibration data.
          </p>
          <Link
            to="/app/beekeeper"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bc-forest text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            + Register First Hive
          </Link>
        </div>
      ) : (
        <>
          {/* Target Hive Selector */}
          <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-bc-dark">Target Hive:</span>
            <select
              value={selectedHive?.hiveId || ""}
              onChange={(e) => setSelectedHiveId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#E5E0CE] text-xs font-bold text-bc-deep-green bg-[#FAF8F2] outline-none"
            >
              {hives.map((h) => (
                <option key={h.hiveId} value={h.hiveId}>
                  Hive {h.hiveId} ({h.block || h.region})
                </option>
              ))}
            </select>
          </div>

          {/* Live Status Pulse Banner */}
          <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isSensorOnline ? "bg-bc-success bc-pulse" : "bg-[#8A9086]"
                }`}
              />
              <span
                className={`font-bold text-xs uppercase tracking-wider ${
                  isSensorOnline ? "text-bc-success" : "text-[#8A9086]"
                }`}
              >
                Live Telemetry: Hive {selectedHive?.hiveId}
              </span>
            </div>
            <span className="text-[11px] text-[#8A9086]">
              {isSensorOnline
                ? `Sensor Online · Updated ${timeAgo}`
                : lastReceivedAt
                ? `Sensor Offline · Last seen ${timeAgo}`
                : `Status: ${selectedHive?.sensor || "Offline"}`}
            </span>
          </div>

          {/* Sensor Metric Gauges */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            <SensorCard label="Temperature" value={displayTemp} status={displayTempStatus} />
            <SensorCard label="Humidity" value={displayHumid} status={displayHumidStatus} />
            <SensorCard label="Vibration" value={displayVibe} status={displayVibeStatus} />
          </div>

          {/* Metric Selector Tabs for Mobile */}
          <div className="flex bg-[#EFECE0] p-1 rounded-2xl gap-1">
            {SENSOR_METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveMetric(m.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeMetric === m.id
                    ? "bg-white text-bc-deep-green shadow-xs"
                    : "text-[#6B7267] hover:text-bc-dark"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Mobile-Optimized Telemetry Chart */}
          <ChartCard title={`${currentMetricObj.label} Telemetry (${currentMetricObj.unit})`}>
            <div className="py-2">
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={chartSeries}>
                  <CartesianGrid stroke="#ECE6D6" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={currentMetricObj.color}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-[#8A9086] text-center pt-2 border-t border-[#F2EDE2]">
              Transmitting live metrics from connected Hive {selectedHive?.hiveId}.
            </div>
          </ChartCard>
        </>
      )}
    </div>
  );
}
