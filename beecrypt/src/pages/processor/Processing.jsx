import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Timeline from "../../components/Timeline.jsx";
import Modal from "../../components/Modal.jsx";
import { useApp } from "../../hooks/useApp.js";

const STAGE_LABELS = ["Honey Received", "Processing Started", "Processing Completed", "Laboratory Testing", "Certification"];

export default function Processing() {
  const { batches, startProcessing, completeProcessing, splitBatchAction } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [splitOpen, setSplitOpen] = useState(false);
  const [method, setMethod] = useState("Cold Extraction");

  const inProgress = batches.filter((b) => b.stage <= 3);
  const batchId = params.get("batchId") || inProgress[0]?.batchId;
  const batch = batches.find((b) => b.batchId === batchId);

  const steps = useMemo(() => {
    if (!batch) return [];
    return STAGE_LABELS.map((label, i) => {
      const idx = i + 1;
      return { label, state: idx < batch.stage ? "done" : idx === batch.stage ? "current" : "future" };
    });
  }, [batch]);

  if (!batch) return <div className="text-sm text-[#8A9086]">No batch selected — open one from Honey Batches.</div>;

  const doSplit = (e) => {
    e.preventDefault();
    const form = e.target;
    const qa = Number(form.qtyA.value);
    const qb = Number(form.qtyB.value);
    splitBatchAction(batch.batchId, [
      { suffix: "A", quantity: qa, reason: "Retail portioning" },
      { suffix: "B", quantity: qb, reason: "Retail portioning" },
    ]);
    setSplitOpen(false);
  };

  return (
    <div>
      <PageHeader title={batch.batchId} sub={`Hive ${batch.hiveId} · ${batch.producerName} · ${batch.quantity} L`} />
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-md">
        <Timeline steps={steps} />
        <div className="flex gap-2.5 flex-wrap mt-2">
          {batch.stage === 1 && (
            <button onClick={() => startProcessing(batch.batchId)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">
              Mark Processing Started
            </button>
          )}
          {batch.stage === 2 && (
            <div className="w-full">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full mb-2.5 px-3 py-2 rounded-lg border border-[#E5E0CE] text-sm">
                <option>Cold Extraction</option>
                <option>Heat Extraction</option>
                <option>Filtration Only</option>
              </select>
              <button onClick={() => completeProcessing(batch.batchId, method)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">
                Mark Processing Completed
              </button>
            </div>
          )}
          {batch.stage === 3 && (
            <div className="flex gap-2.5 flex-wrap">
              <button onClick={() => navigate(`/app/processor/laboratories?batchId=${batch.batchId}`)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-bc-gold to-bc-amber">
                Find Laboratory &amp; Send Sample
              </button>
              <button onClick={() => setSplitOpen(true)} className="rounded-xl px-4 py-2.5 text-sm font-bold border-2 border-bc-deep-green text-bc-deep-green">
                Split Batch
              </button>
            </div>
          )}
          {batch.stage >= 4 && (
            <span className="inline-flex items-center gap-1.5 bg-bc-light-honey text-bc-amber text-xs font-bold px-3 py-1.5 rounded-full">
              Awaiting laboratory result
            </span>
          )}
        </div>
      </div>

      {splitOpen && (
        <Modal title={`Split ${batch.batchId}`} onClose={() => setSplitOpen(false)}>
          <form onSubmit={doSplit}>
            <p className="text-xs text-[#8A9086] mb-3">
              Creates {batch.batchId}-A and {batch.batchId}-B as linked child batches (Section 14).
            </p>
            <label className="text-xs font-bold">Quantity for -A (L)</label>
            <input name="qtyA" type="number" step="0.1" defaultValue={(batch.quantity / 2).toFixed(1)} className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-3 text-sm" />
            <label className="text-xs font-bold">Quantity for -B (L)</label>
            <input name="qtyB" type="number" step="0.1" defaultValue={(batch.quantity / 2).toFixed(1)} className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-4 text-sm" />
            <button type="submit" className="w-full rounded-xl py-2.5 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">Confirm Split</button>
          </form>
        </Modal>
      )}
    </div>
  );
}
