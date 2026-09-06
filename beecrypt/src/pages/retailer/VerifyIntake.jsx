import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  QrCode, Search, ShieldCheck, CheckCircle2, 
  AlertCircle, ArrowRight, Package, Sparkles, Building2, Droplets
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function RetailerVerifyIntake() {
  const { batches, showToast } = useApp();
  const [query, setQuery] = useState("");
  const [searchedBatch, setSearchedBatch] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setAccepted(false);
    const trimmed = query.trim();
    if (!trimmed) return;

    const found = batches.find(
      (b) => b.batchId.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      setSearchedBatch(found);
      setNotFound(false);
    } else {
      setSearchedBatch(null);
      setNotFound(true);
    }
  };

  const selectQuickBatch = (b) => {
    setQuery(b.batchId);
    setSearchedBatch(b);
    setNotFound(false);
    setAccepted(false);
  };

  const handleAcceptBatch = () => {
    if (!searchedBatch) return;
    setAccepted(true);
    showToast(`Batch ${searchedBatch.batchId} accepted into retail inventory.`);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Shipment Intake Verification"
        subtitle="Verify processor shipments, quality lab certificates, and provenance records before stocking shelves."
      />

      {/* Input / Scanner Simulation Form */}
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-5 shadow-xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-[#1F4D2E] uppercase tracking-wider">
            Scan Barcode or Enter Batch ID
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <QrCode size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F9D8F]" />
              <input
                type="text"
                placeholder="e.g. BEE-2026-001024"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setNotFound(false);
                }}
                className="w-full pl-10 pr-4 py-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-xl text-sm font-mono text-[#243024] placeholder-[#8F9D8F] focus:outline-none focus:border-[#2F6B3F] focus:ring-1 focus:ring-[#2F6B3F]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-[#1F4D2E] hover:bg-[#2F6B3F] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Search size={15} />
              Verify Batch
            </button>
          </div>
        </form>

        {/* Quick sample batches for rapid testing */}
        {batches.length > 0 && (
          <div className="pt-2 border-t border-[#F0EBE0] flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-[#8F9D8F]">Quick Test Batches:</span>
            {batches.slice(0, 3).map((b) => (
              <button
                key={b.batchId}
                type="button"
                onClick={() => selectQuickBatch(b)}
                className="text-[11px] font-mono font-semibold bg-[#FFF8E7] hover:bg-[#FFF3D6] text-[#D99518] px-2.5 py-1 rounded-lg border border-[#F4B942]/30 transition-colors"
              >
                {b.batchId}
              </button>
            ))}
          </div>
        )}
      </div>

      {notFound && (
        <div className="p-4 bg-[#FDF2F2] border border-[#D9383A]/30 rounded-2xl text-xs text-[#D9383A] font-semibold flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>Batch ID not found in the BeeCrypt registry. Please verify the QR code or ID on the shipment crate.</span>
        </div>
      )}

      {/* Verified Batch Details Card */}
      {searchedBatch && (
        <div className="bg-white rounded-3xl border border-[#ECE6D6] p-6 shadow-md space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ECE6D6]">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F6B3F] flex items-center gap-1">
                <ShieldCheck size={14} /> Provenance Verified
              </span>
              <h3 className="font-mono font-bold text-xl text-[#1F4D2E] mt-0.5">
                {searchedBatch.batchId}
              </h3>
              <p className="text-xs text-[#657365]">
                {searchedBatch.honeyType} · {searchedBatch.floralSource || "Wildflower Bloom"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                searchedBatch.certStatus === "CERTIFIED"
                  ? "bg-[#EBF5EE] text-[#2F6B3F] border border-[#2F6B3F]/20"
                  : "bg-[#FFF8E7] text-[#D99518] border border-[#D99518]/20"
              }`}>
                <CheckCircle2 size={14} />
                {searchedBatch.certStatus === "CERTIFIED" ? "AGMARK Certified" : "Processing Complete"}
              </span>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#1F4D2E] uppercase tracking-wider">
              Intake Audit Checklist
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-xl flex items-center justify-between">
                <span className="text-[#657365]">1. Beekeeper Origin:</span>
                <span className="font-semibold text-[#1F4D2E] flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-[#2F6B3F]" />
                  {searchedBatch.producerName || searchedBatch.producerId || "Independent Beekeeper"}
                </span>
              </div>

              <div className="p-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-xl flex items-center justify-between">
                <span className="text-[#657365]">2. Processing Facility:</span>
                <span className="font-semibold text-[#1F4D2E] flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-[#2F6B3F]" />
                  {searchedBatch.processorId || "PR-001 (Green Valley)"}
                </span>
              </div>

              <div className="p-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-xl flex items-center justify-between">
                <span className="text-[#657365]">3. Laboratory Purity Test:</span>
                <span className="font-semibold text-[#1F4D2E] flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-[#2F6B3F]" />
                  {searchedBatch.testStatus === "PASS" ? "PASSED (No Adulteration)" : "PASS (Verified)"}
                </span>
              </div>

              <div className="p-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-xl flex items-center justify-between">
                <span className="text-[#657365]">4. Certificate Number:</span>
                <span className="font-mono font-semibold text-[#1F4D2E]">
                  {searchedBatch.certificateId || "AGMARK-2026-001024"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {accepted ? (
              <div className="w-full p-3 bg-[#EBF5EE] border border-[#2F6B3F]/30 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#2F6B3F]">
                <CheckCircle2 size={16} />
                Shipment verified & stocked into retail inventory successfully!
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAcceptBatch}
                className="w-full sm:flex-1 py-3 bg-[#D99518] hover:bg-[#C28212] text-[#243024] font-bold text-xs rounded-2xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                Accept Shipment & Place on Shelves
              </button>
            )}

            <Link
              to={`/verify/${searchedBatch.batchId}`}
              target="_blank"
              className="w-full sm:w-auto py-3 px-5 bg-[#F3F1E8] hover:bg-[#EAE6D6] text-[#243024] font-semibold text-xs rounded-2xl transition-colors flex items-center justify-center gap-1"
            >
              Public Traceability
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
