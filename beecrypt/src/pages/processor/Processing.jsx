import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, Factory, GitBranch, FlaskConical, 
  CheckCircle2, AlertCircle, ShieldCheck, ChevronRight 
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import Timeline from "../../components/Timeline.jsx";
import Modal from "../../components/Modal.jsx";
import { useApp } from "../../hooks/useApp.js";

const STAGE_LABELS = [
  "Honey Received",
  "Processing Started",
  "Processing Completed",
  "Laboratory Testing",
  "Certification",
];

export default function Processing() {
  const { batches, startProcessing, completeProcessing, splitBatchAction } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [splitOpen, setSplitOpen] = useState(false);
  const [method, setMethod] = useState("Cold Extraction");

  const inProgress = batches.filter((b) => b.stage <= 3);
  const batchId = params.get("batchId") || inProgress[0]?.batchId || batches[0]?.batchId;
  const batch = batches.find((b) => b.batchId === batchId);

  const [qtyA, setQtyA] = useState(batch ? (batch.quantity / 2).toFixed(1) : "10");
  const [qtyB, setQtyB] = useState(batch ? (batch.quantity / 2).toFixed(1) : "10");

  const steps = useMemo(() => {
    if (!batch) return [];
    return STAGE_LABELS.map((label, i) => {
      const idx = i + 1;
      return {
        label,
        state: idx < batch.stage ? "done" : idx === batch.stage ? "current" : "future",
      };
    });
  }, [batch]);

  if (!batch) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#8A9086]">No batch selected.</p>
        <Link to="/app/processor/batches" className="text-bc-deep-green font-bold text-xs mt-2 inline-block">
          ← Return to Honey Batches
        </Link>
      </div>
    );
  }

  const doSplit = (e) => {
    e.preventDefault();
    const qa = parseFloat(qtyA);
    const qb = parseFloat(qtyB);
    splitBatchAction(batch.batchId, [
      { suffix: "A", quantity: qa, reason: "Retail portioning" },
      { suffix: "B", quantity: qb, reason: "Retail portioning" },
    ]);
    setSplitOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/processor/batches"
          className="text-bc-deep-green font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Batches
        </Link>
        <span className="text-xs font-mono font-bold text-bc-deep-green bg-bc-light-honey px-2.5 py-0.5 rounded-full">
          {batch.batchId}
        </span>
      </div>

      {/* Batch Overview Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-xl text-bc-deep-green">
              {batch.honeyType} Honey
            </h3>
            <div className="text-xs text-[#8A9086] mt-0.5">
              Hive {batch.hiveId} · Beekeeper {batch.producerName}
            </div>
          </div>
          <span className="font-display font-bold text-lg text-bc-amber">
            {batch.quantity} kg
          </span>
        </div>

        {/* Processing Vertical Stepper */}
        <div className="my-3 py-2 border-t border-b border-[#F2EDE2]">
          <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-2">
            Facility Processing Pipeline
          </div>
          <Timeline steps={steps} />
        </div>

        {/* Action Controls for Current Stage */}
        <div className="pt-2">
          {batch.stage === 1 && (
            <button
              onClick={() => startProcessing(batch.batchId)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <Factory size={16} />
              <span>Mark Processing Started</span>
            </button>
          )}

          {batch.stage === 2 && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-bc-dark block mb-1">
                  Select Processing Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold text-bc-deep-green bg-white outline-none"
                >
                  <option>Cold Extraction</option>
                  <option>Heat Extraction</option>
                  <option>Filtration Only</option>
                </select>
              </div>
              <button
                onClick={() => completeProcessing(batch.batchId, method)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Mark Processing Completed</span>
              </button>
            </div>
          )}

          {batch.stage === 3 && (
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/app/processor/laboratories?batchId=${batch.batchId}`)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-gold to-bc-amber text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <FlaskConical size={16} />
                <span>Find Laboratory &amp; Send Sample</span>
              </button>
              <button
                onClick={() => {
                  setQtyA((batch.quantity / 2).toFixed(1));
                  setQtyB((batch.quantity / 2).toFixed(1));
                  setSplitOpen(true);
                }}
                className="w-full py-3 rounded-2xl border-2 border-bc-deep-green text-bc-deep-green font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <GitBranch size={15} />
                <span>Split Batch (Portioning)</span>
              </button>
            </div>
          )}

          {batch.stage >= 4 && (
            <div className="bg-bc-light-honey border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <FlaskConical size={15} className="text-bc-amber" />
                <span>Sample Sent to Laboratory</span>
              </span>
              <span className="font-semibold text-[11px]">Testing in progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Batch Split Modal / Sheet */}
      {splitOpen && (
        <Modal title={`Split Batch ${batch.batchId}`} onClose={() => setSplitOpen(false)}>
          <form onSubmit={doSplit} className="space-y-3 text-xs">
            <p className="text-[#8A9086]">
              Portioning creates linked child batches: <b>{batch.batchId}-A</b> and <b>{batch.batchId}-B</b>, preserving the parent-child provenance trail.
            </p>

            <div className="bg-[#F8F6EC] p-3 rounded-xl">
              <span className="text-[#8A9086]">Total Available to Split: </span>
              <span className="font-bold text-bc-deep-green">{batch.quantity} kg</span>
            </div>

            <div>
              <label className="font-bold text-bc-dark block mb-1">Quantity for -A (kg)</label>
              <input
                type="number"
                step="0.1"
                value={qtyA}
                onChange={(e) => setQtyA(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-bc-dark block mb-1">Quantity for -B (kg)</label>
              <input
                type="number"
                step="0.1"
                value={qtyB}
                onChange={(e) => setQtyB(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              Confirm Batch Split
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
