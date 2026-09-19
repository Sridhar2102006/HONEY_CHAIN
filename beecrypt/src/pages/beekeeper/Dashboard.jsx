import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, AlertTriangle,
  CheckCircle2, ArrowRight, Hexagon, MapPin
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import HiveCard from "../../components/HiveCard.jsx";
import Modal from "../../components/Modal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import * as hiveService from "../../services/hiveService.js";

export default function BeekeeperDashboard() {
  const { currentUser, currentActorId } = useAuth();
  const { batches, hives: allHives, addHive, showToast } = useApp();
  const hivesList = (allHives || []).filter((h) => h.producerId === currentActorId);
  const [filter, setFilter] = useState("all");
  const [addHiveModal, setAddHiveModal] = useState(false);
  const [newHiveId, setNewHiveId] = useState("");
  const [newHiveBlock, setNewHiveBlock] = useState("Apiary A — Block 06");
  const [submitting, setSubmitting] = useState(false);

  const healthy = hivesList.filter((h) => h.status === "healthy").length;
  const warning = hivesList.filter((h) => h.status === "warning").length;
  const critical = hivesList.filter((h) => h.status === "critical").length;
  const attentionCount = warning + critical;
  const attentionHives = hivesList.filter((h) => h.status !== "healthy");

  const filteredHives = hivesList.filter((h) => {
    if (filter === "attention") return h.status !== "healthy";
    if (filter === "healthy") return h.status === "healthy";
    return true;
  });

  const handleAddHive = async (e) => {
    e.preventDefault();
    if (!newHiveId.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addHive({
        hiveId: newHiveId.trim().toUpperCase(),
        block: newHiveBlock,
        region: currentUser?.region || "Tamil Nadu",
      });
      setAddHiveModal(false);
      setNewHiveId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Beekeeper Greeting & Farm Overview */}
      <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest rounded-3xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-bc-gold flex items-center gap-1.5">
              <Hexagon size={14} fill="#F59E0B" /> Smart Apiary Overview
            </span>
            <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
              KVIC Verified Farm
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl mt-1 tracking-tight">
            {currentUser?.name && !currentUser.name.toLowerCase().includes("rajesh")
              ? `Good day, ${currentUser.name.split(" ")[0]} 👋`
              : "Apiary Command Center"}
          </h2>
          <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
            <MapPin size={12} className="text-bc-gold" /> {currentUser?.org && !currentUser.org.toLowerCase().includes("kumar") ? currentUser.org : "HoneyChain Apiary Network"} · {currentUser?.location && !currentUser.location.toLowerCase().includes("erode") ? currentUser.location : (currentUser?.region || "Tamil Nadu, India")}
          </p>

          {/* Quick Metrics in Hero */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
            <div>
              <div className="font-display font-bold text-xl text-sky-300">{hivesList.length}</div>
              <div className="text-[10.5px] text-sky-100/80">Total Hives</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-emerald-300">{healthy}</div>
              <div className="text-[10.5px] text-emerald-100/80">Healthy Hives</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-bc-gold">{batches.length}</div>
              <div className="text-[10.5px] text-white/70">Honey Batches</div>
            </div>
          </div>
        </div>

        {/* Decorative background honeycomb circles */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-12 -top-6 w-24 h-24 rounded-full bg-bc-gold/10 pointer-events-none" />
      </div>

      {/* 2. Attention Required (Critical / Warning Hives) */}
      {attentionCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-bc-critical font-bold text-xs uppercase tracking-wider">
              <AlertTriangle size={16} />
              <span>Attention Required ({attentionCount})</span>
            </div>
            <Link
              to="/app/beekeeper/alerts"
              className="text-xs font-bold text-bc-critical flex items-center gap-0.5 hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-2 space-y-1.5">
            {attentionHives.map((h) => (
              <div
                key={h.hiveId}
                className="bg-white rounded-xl p-2.5 flex items-center justify-between border border-red-100 text-xs"
              >
                <div>
                  <span className="font-bold text-bc-dark">Hive {h.hiveId}</span>
                  <span className="text-[#8A9086] ml-2">
                    {h.status === "critical" ? `Critical Temp (${h.temp}°C)` : `Elevated Moisture/Vibration`}
                  </span>
                </div>
                <Link
                  to={`/app/beekeeper/hives/${h.hiveId}`}
                  className="px-2.5 py-1 rounded-lg bg-red-100 text-bc-critical font-bold text-[11px] active:scale-95 transition-transform"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Hives List & Status Filter */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-display font-bold text-base text-bc-deep-green">
            My Apiary Hives ({filteredHives.length})
          </h3>
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "all" ? "bg-bc-deep-green text-white" : "text-[#8A9086] hover:bg-[#ECE6D6]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("healthy")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "healthy" ? "bg-bc-deep-green text-white" : "text-[#8A9086] hover:bg-[#ECE6D6]"
              }`}
            >
              Healthy
            </button>
            <button
              onClick={() => setFilter("attention")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filter === "attention" ? "bg-bc-critical text-white" : "text-[#8A9086] hover:bg-[#ECE6D6]"
              }`}
            >
              Alerts
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredHives.length > 0 ? (
            filteredHives.map((h) => (
              <HiveCard key={h.hiveId} hive={h} />
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#ECE6D6] p-6 text-center shadow-xs">
              <Hexagon size={32} className="text-[#C9C2AC] mx-auto mb-2" />
              <div className="font-bold text-bc-dark text-sm">No Hives Registered Yet</div>
              <p className="text-xs text-[#8A9086] mt-1 max-w-xs mx-auto">
                Ready for fresh manual data entry! Tap &quot;Register First Hive&quot; below to record your smart apiary.
              </p>
              <button
                type="button"
                onClick={() => setAddHiveModal(true)}
                className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bc-forest hover:bg-bc-deep-green text-white text-xs font-bold transition-all shadow-xs active:scale-95"
              >
                + Register First Hive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Recent Activity Feed */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs">
        <div className="text-xs font-bold text-[#8A9086] uppercase tracking-wider mb-3">
          Recent Farm Activity
        </div>
        {batches.length > 0 ? (
          <div className="space-y-2.5 text-xs">
            {batches.slice(0, 4).map((b) => (
              <div key={b.batchId} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-bc-light-green text-bc-success flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <span className="font-bold text-bc-dark">Extraction recorded: </span>
                  <span className="text-[#6B7267]">{b.quantity} L from Hive {b.hiveId} (Batch {b.batchId})</span>
                  <div className="text-[10px] text-[#8A9086] mt-0.5">Status: {b.processingStatus || 'Extracted'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#8A9086] py-3 text-center">
            No honey extractions recorded yet. Harvest a batch to see farm activity here.
          </div>
        )}
      </div>

      {/* Add Hive Modal / Sheet */}
      {addHiveModal && (
        <Modal title="Register New Hive" onClose={() => setAddHiveModal(false)}>
          <form onSubmit={handleAddHive} className="space-y-3">
            <p className="text-xs text-[#8A9086]">
              Add a new hive box to your apiary with connected IoT sensor monitoring.
            </p>
            <div>
              <label className="text-xs font-bold text-bc-dark">Hive Identifier (ID)</label>
              <input
                value={newHiveId}
                onChange={(e) => setNewHiveId(e.target.value)}
                placeholder="e.g. H-1035"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-bc-dark">Apiary Block Location</label>
              <input
                value={newHiveBlock}
                onChange={(e) => setNewHiveBlock(e.target.value)}
                placeholder="Apiary A — Block 06"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
            >
              Confirm Registration
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
