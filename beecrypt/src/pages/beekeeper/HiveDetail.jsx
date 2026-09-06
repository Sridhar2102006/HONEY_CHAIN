import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Thermometer, Droplets, Activity, Battery, 
  MapPin, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck, Plus, Sparkles,
  ClipboardCheck, Clock, User
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import ChartCard from "../../components/ChartCard.jsx";
import AlertsList from "./Alerts.jsx";
import Modal from "../../components/Modal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import ProvenanceStatus from "../../components/ProvenanceStatus.jsx";
import * as hiveService from "../../services/hiveService.js";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import sensorApi from "../../api/sensorApi.js";

const TABS = ["Overview", "Live Sensors", "Alerts", "Extractions"];

export default function HiveDetail() {
  const { hiveId } = useParams();
  const navigate = useNavigate();
  const { currentActorId } = useAuth();
  const { hives, batches, inspections, recordInspection } = useApp();
  const [tab, setTab] = useState("Overview");
  const [inspectModal, setInspectModal] = useState(false);
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [queenStatus, setQueenStatus] = useState("Active & Laying");
  const [colonyStrength, setColonyStrength] = useState("Strong (9 frames)");

  // Locate the hive from unified reactive AppContext state
  const hive = (hives || []).find((h) => h.hiveId === hiveId);

  // 1. Critical Ownership Verification
  if (!hive) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-[#ECE6D6] p-8 shadow-xs">
        <AlertTriangle size={32} className="mx-auto text-bc-amber mb-2" />
        <h3 className="font-display font-bold text-lg text-bc-dark">Hive Not Found</h3>
        <p className="text-xs text-[#8A9086] mt-1">
          No hive record exists with identifier &ldquo;{hiveId}&rdquo;.
        </p>
        <Link
          to="/app/beekeeper/hive-management"
          className="text-bc-deep-green font-bold text-xs mt-3 inline-flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Return to Hive Management
        </Link>
      </div>
    );
  }

  // Cross-user access check: verify hive belongs to the active beekeeper
  if (hive.producerId !== currentActorId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-red-100 text-bc-critical flex items-center justify-center mx-auto">
          <ShieldAlert size={28} />
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-200 text-bc-critical inline-block">
          Access Denied (403)
        </span>
        <h2 className="font-display font-bold text-2xl text-bc-critical">
          Unauthorized Apiary Access
        </h2>
        <p className="text-xs text-[#6B7267] max-w-md mx-auto leading-relaxed">
          Hive <b>{hive.hiveId}</b> is registered to another beekeeper actor (<b>{hive.producerId}</b>).
          You are authenticated as <b>{currentActorId}</b> and cannot view this hive&apos;s telemetry, inspection logs, or extraction records.
        </p>
        <div className="pt-2">
          <Link
            to="/app/beekeeper/hive-management"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-bc-deep-green text-white text-xs font-bold rounded-xl active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={14} /> Back to My Managed Hives
          </Link>
        </div>
      </div>
    );
  }

  // Hive-specific sensor series derived deterministically from hive parameters
  const series = hiveService.getSensorSeries(hive.hiveId, hive.temp, hive.humidity, hive.vibration);
  const hiveBatches = (batches || []).filter((b) => b.hiveId === hiveId);

  // Filter persisted inspections for this hive
  const hiveInspections = (inspections || [])
    .filter((i) => i.hiveId === hiveId)
    .sort((a, b) => new Date(b.inspectedAt) - new Date(a.inspectedAt));

  const latestInspection = hiveInspections[0];
  const lastInspectionDate = latestInspection
    ? new Date(latestInspection.inspectedAt).toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No inspections recorded yet";

  // Real-time sensor telemetry state
  const [liveReading, setLiveReading] = useState(null);
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hive?.hiveId) return;
    let isMounted = true;

    sensorApi
      .getLatest({ hiveId: hive.hiveId })
      .then((res) => {
        if (isMounted && res?.reading) {
          setLiveReading(res.reading);
          setLastReceivedAt(new Date(res.reading.receivedAt || res.reading.recordedAt));
        }
      })
      .catch(() => {});

    const unsubscribe = sensorApi.subscribeToStream({
      hiveId: hive.hiveId,
      onReading: (reading) => {
        if (!isMounted) return;
        setLiveReading(reading);
        setLastReceivedAt(new Date(reading.receivedAt || Date.now()));
      },
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [hive?.hiveId]);

  const isSensorOnline = Boolean(
    (lastReceivedAt && now - new Date(lastReceivedAt).getTime() < 15000) || hive.sensor === "online"
  );

  const handleRecordInspection = async (e) => {
    e.preventDefault();
    await recordInspection({
      hiveId: hive.hiveId,
      queenStatus,
      colonyStrength,
      notes: inspectionNotes,
    });
    setInspectModal(false);
    setInspectionNotes("");
  };

  return (
    <div className="space-y-4">
      {/* Top Back Nav & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/beekeeper/hive-management"
          className="text-bc-deep-green font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Hives
        </Link>
        <StatusBadge status={hive.status} />
      </div>

      {/* Hive Identity Card */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-bold text-2xl text-bc-deep-green">
              Hive {hive.hiveId}
            </h2>
            <div className="text-xs text-[#8A9086] flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {hive.block || "Apiary Block"} · {hive.region}
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-[11px] font-bold flex items-center gap-1 justify-end ${
                isSensorOnline ? "text-bc-success" : "text-[#8A9086]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSensorOnline ? "bg-bc-success" : "bg-[#8A9086]"
                }`}
              />
              {isSensorOnline ? "Sensor Online" : "Sensor Offline"}
            </span>
            <span className="text-[11px] text-[#8A9086] flex items-center gap-1 mt-0.5 justify-end">
              <Battery size={13} /> {hive.battery}% Battery
            </span>
          </div>
        </div>

        {/* Quick Telemetry Strip */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#F2EDE2] text-center">
          <div className="bg-[#FBF9F2] rounded-xl p-2">
            <div className="text-[10px] text-[#8A9086] flex items-center justify-center gap-0.5">
              <Thermometer size={10} /> Temp
            </div>
            <div className="font-bold text-sm text-bc-dark mt-0.5">
              {liveReading?.temperature !== undefined ? `${liveReading.temperature.toFixed(1)}°C` : `${hive.temp}°C`}
            </div>
          </div>
          <div className="bg-[#FBF9F2] rounded-xl p-2">
            <div className="text-[10px] text-[#8A9086] flex items-center justify-center gap-0.5">
              <Droplets size={10} /> Humid
            </div>
            <div className="font-bold text-sm text-bc-dark mt-0.5">
              {liveReading?.humidity !== undefined ? `${liveReading.humidity.toFixed(1)}%` : `${hive.humidity}%`}
            </div>
          </div>
          <div className="bg-[#FBF9F2] rounded-xl p-2">
            <div className="text-[10px] text-[#8A9086] flex items-center justify-center gap-0.5">
              <Activity size={10} /> Vibe
            </div>
            <div className="font-bold text-sm text-bc-dark mt-0.5">
              {liveReading !== null ? (liveReading.vibration ? "Alert" : "Normal") : `${hive.vibration}g`}
            </div>
          </div>
          <div className="bg-[#FBF9F2] rounded-xl p-2">
            <div className="text-[10px] text-[#8A9086]">Batches</div>
            <div className="font-bold text-sm text-bc-forest mt-0.5">{hiveBatches.length}</div>
          </div>
        </div>
      </div>

      {/* Segmented Mobile Tabs */}
      <div className="flex bg-[#EFECE0] p-1 rounded-2xl gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === t
                ? "bg-white text-bc-deep-green shadow-xs"
                : "text-[#6B7267] hover:text-bc-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {/* TAB 1: OVERVIEW */}
        {tab === "Overview" && (
          <div className="space-y-3">
            {/* Colony Status Card */}
            <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs text-xs space-y-2.5">
              <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
                Colony Health &amp; Queen Status
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                <span className="text-[#8A9086]">Queen Status</span>
                <span className="font-bold text-bc-dark">
                  {latestInspection?.queenStatus || queenStatus}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                <span className="text-[#8A9086]">Colony Strength</span>
                <span className="font-bold text-bc-forest">
                  {latestInspection?.colonyStrength || colonyStrength}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                <span className="text-[#8A9086]">Last Inspection</span>
                <span className="font-semibold text-bc-dark">{lastInspectionDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                <span className="text-[#8A9086]">Sensor Sync Interval</span>
                <span className="font-semibold">Every 5 min (MQTT stream)</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-[#8A9086]">Provenance status</span>
                <ProvenanceStatus status="unavailable" compact />
              </div>
            </div>

            {/* Quick Actions for this Hive */}
            <div className="flex gap-2">
              <button
                onClick={() => setInspectModal(true)}
                className="flex-1 py-3 bg-white border border-[#ECE6D6] rounded-xl text-xs font-bold text-bc-deep-green shadow-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck size={14} /> Record Inspection
              </button>
              <Link
                to={`/app/beekeeper/extraction?hiveId=${hive.hiveId}`}
                className="flex-1 py-3 bg-gradient-to-r from-bc-gold to-bc-amber rounded-xl text-xs font-bold text-white text-center shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} /> Record Honey Harvest
              </Link>
            </div>

            {/* Real Persisted Inspection History */}
            <div id="inspection-history" className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-xs font-bold text-bc-dark flex items-center gap-1.5">
                  <ClipboardCheck size={14} className="text-bc-forest" />
                  <span>Inspection History ({hiveInspections.length})</span>
                </div>
                <button
                  onClick={() => setInspectModal(true)}
                  className="text-[11px] text-bc-deep-green font-bold hover:underline"
                >
                  + Add Log
                </button>
              </div>

              {hiveInspections.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#8A9086] border border-dashed border-[#ECE6D6] rounded-xl">
                  No inspections logged yet for Hive {hive.hiveId}.
                </div>
              ) : (
                <div className="space-y-2">
                  {hiveInspections.map((insp) => (
                    <div
                      key={insp.inspectionId}
                      className="bg-[#FBF9F2] rounded-xl p-3 border border-[#ECE6D6] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-bc-dark">{insp.queenStatus}</span>
                        <span className="text-[10px] text-[#8A9086] flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(insp.inspectedAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="text-[11px] text-bc-forest font-semibold">
                        Strength: {insp.colonyStrength}
                      </div>
                      {insp.notes && (
                        <p className="text-[11px] text-[#6B7267] italic pt-0.5">
                          &ldquo;{insp.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SENSORS */}
        {tab === "Live Sensors" && (
          <div className="space-y-3">
            <ChartCard title={`Temperature Telemetry — Hive ${hive.hiveId} (24h)`}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={series}>
                  <CartesianGrid stroke="#ECE6D6" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} unit="°C" />
                  <Tooltip formatter={(value) => [`${value}°C`, "Temperature"]} />
                  <Line type="monotone" dataKey="temp" stroke="#D97706" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`Humidity Telemetry — Hive ${hive.hiveId} (24h)`}>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={series}>
                  <CartesianGrid stroke="#ECE6D6" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, "Humidity"]} />
                  <Line type="monotone" dataKey="humidity" stroke="#166534" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* TAB 3: ALERTS */}
        {tab === "Alerts" && (
          <AlertsList hiveId={hive.hiveId} compact />
        )}

        {/* TAB 4: EXTRACTIONS */}
        {tab === "Extractions" && (
          <div className="space-y-2.5">
            {hiveBatches.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#ECE6D6] p-6 text-center text-xs text-[#8A9086]">
                No honey extractions recorded yet for Hive {hive.hiveId}.
              </div>
            ) : (
              hiveBatches.map((b) => (
                <div key={b.batchId} className="bg-white rounded-2xl border border-[#ECE6D6] p-3.5 shadow-xs flex justify-between items-center text-xs">
                  <div>
                    <div className="font-mono font-bold text-bc-deep-green">{b.batchId}</div>
                    <div className="text-[#8A9086] mt-0.5">{b.harvestDate} · {b.quantity} Litres</div>
                  </div>
                  <Link
                    to={`/app/traceability?batchId=${b.batchId}`}
                    className="px-3 py-1.5 rounded-lg bg-[#F3F1E8] font-bold text-bc-dark text-xs active:scale-95 transition-transform"
                  >
                    Trace
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Record Inspection Modal */}
      {inspectModal && (
        <Modal title={`Record Inspection — Hive ${hive.hiveId}`} onClose={() => setInspectModal(false)}>
          <form onSubmit={handleRecordInspection} className="space-y-3 text-xs">
            <p className="text-[#8A9086]">
              Field inspection record is persisted to hive history and colony status.
            </p>
            <div>
              <label className="font-bold text-bc-dark">Queen Status</label>
              <select
                value={queenStatus}
                onChange={(e) => setQueenStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-xs"
              >
                <option>Active &amp; Laying</option>
                <option>Virgin Queen</option>
                <option>Queen Cell Observed</option>
                <option>Queen Absent (Urgent)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-bc-dark">Colony Strength</label>
              <select
                value={colonyStrength}
                onChange={(e) => setColonyStrength(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-xs"
              >
                <option>Strong (8-10 frames)</option>
                <option>Moderate (5-7 frames)</option>
                <option>Weak (Under 4 frames)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-bc-dark">Field Notes</label>
              <textarea
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Observed good brood pattern, worker activity normal..."
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0CE] mt-1 text-xs min-h-[70px]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              Save Inspection Record
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
