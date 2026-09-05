import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

export default function BatchCard({ batch, actionLabel, onAction, to }) {
  const content = (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4 flex flex-wrap justify-between items-center gap-3">
      <div>
        <div className="font-bold font-display text-[15px] text-bc-deep-green">{batch.batchId}</div>
        <div className="text-xs text-[#8A9086] mt-0.5">
          Hive {batch.hiveId} · {batch.producerName} · {batch.quantity} L · {batch.harvestDate}
        </div>
        {batch.parentBatchId && (
          <div className="text-[11px] text-bc-amber mt-1">Child of {batch.parentBatchId}</div>
        )}
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <StatusBadge status={batch.processingStatus} />
        <StatusBadge status={batch.certStatus} />
        {onAction && (
          <button
            onClick={(e) => { e.preventDefault(); onAction(batch); }}
            className="rounded-xl bg-[#F3F1E8] hover:bg-[#EDE7D6] transition-colors text-sm font-bold px-4 py-2"
          >
            {actionLabel || "View"}
          </button>
        )}
      </div>
    </div>
  );
  return to ? <Link to={to}>{content}</Link> : content;
}
