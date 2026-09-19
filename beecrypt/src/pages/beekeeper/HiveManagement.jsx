import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Hexagon, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import HiveCard from "../../components/HiveCard.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import Modal from "../../components/Modal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import * as hiveService from "../../services/hiveService.js";

const FILTERS = ["All", "Healthy", "Warning", "Critical"];

export default function HiveManagement() {
  const { currentActorId, currentUser } = useAuth();
  const { hives: allHives, addHive, showToast } = useApp();
  const hives = (allHives || []).filter((h) => h.producerId === currentActorId);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [addModal, setAddModal] = useState(false);
  const [newHiveId, setNewHiveId] = useState("");
  const [newHiveBlock, setNewHiveBlock] = useState("Apiary A - Block 06");
  const [submitting, setSubmitting] = useState(false);

  const healthy = hives.filter((hive) => hive.status === "healthy").length;
  const attention = hives.filter((hive) => hive.status !== "healthy").length;
  const online = hives.filter((hive) => hive.sensor === "online").length;

  const filtered = hives.filter((hive) => {
    const matchesFilter = filter === "All" || hive.status.toLowerCase() === filter.toLowerCase();
    const searchTerm = search.toLowerCase();
    const matchesSearch = hive.hiveId.toLowerCase().includes(searchTerm) || hive.block?.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleAddHive = async (event) => {
    event.preventDefault();
    if (!newHiveId.trim() || submitting) return;
    const hiveId = newHiveId.trim().toUpperCase();
    if (hives.some((hive) => hive.hiveId === hiveId)) {
      showToast(`Hive ${hiveId} already exists.`, "critical");
      return;
    }
    setSubmitting(true);
    try {
      await addHive({
        hiveId,
        block: newHiveBlock,
        region: currentUser?.region || "Tamil Nadu",
      });
      setAddModal(false);
      setNewHiveId("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hive Management"
        sub="Manage apiary assets, telemetry, health status, and inspections."
        action={(
          <button
            type="button"
            onClick={() => setAddModal(true)}
            className="flex items-center gap-1 bg-bc-deep-green text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus size={15} /> Add Hive
          </button>
        )}
      />

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <Hexagon size={16} className="text-bc-amber" />
          <div className="font-display font-bold text-xl text-bc-deep-green mt-1">{hives.length}</div>
          <div className="text-[11px] text-[#8A9086]">Total hives</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <CheckCircle2 size={16} className="text-bc-success" />
          <div className="font-display font-bold text-xl text-bc-deep-green mt-1">{healthy}</div>
          <div className="text-[11px] text-[#8A9086]">Healthy</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3 shadow-xs">
          <Activity size={16} className="text-sky-500" />
          <div className="font-display font-bold text-xl text-bc-deep-green mt-1">{online}/{hives.length}</div>
          <div className="text-[11px] text-[#8A9086]">Online</div>
        </div>
      </div>

      {attention > 0 && (
        <Link to="/app/beekeeper/alerts" className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-bold text-bc-critical"><AlertTriangle size={16} /> {attention} hive{attention === 1 ? "" : "s"} need attention</span>
          <span className="text-xs font-bold text-bc-critical">View alerts</span>
        </Link>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9086]" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by hive ID or apiary block..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#ECE6D6] text-xs outline-none focus:border-bc-deep-green shadow-xs"
        />
      </div>

      <FilterBar options={FILTERS} active={filter} onChange={setFilter} />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <EmptyState title="No hives found" subtitle="Try another search or management filter." />
        ) : (
          filtered.map((hive) => <HiveCard key={hive.hiveId} hive={hive} />)
        )}
      </div>

      {addModal && (
        <Modal title="Add Hive to Management" onClose={() => setAddModal(false)}>
          <form onSubmit={handleAddHive} className="space-y-3">
            <p className="text-xs text-[#8A9086]">Register an apiary hive for telemetry and health management.</p>
            <div>
              <label className="text-xs font-bold text-bc-dark">Hive ID</label>
              <input
                value={newHiveId}
                onChange={(event) => setNewHiveId(event.target.value)}
                placeholder="e.g. H-1035"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-bc-dark">Apiary Block</label>
              <input
                value={newHiveBlock}
                onChange={(event) => setNewHiveBlock(event.target.value)}
                placeholder="Apiary A - Block 06"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] mt-1 text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-sm shadow-md active:scale-95 transition-transform">
              Save Hive
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
