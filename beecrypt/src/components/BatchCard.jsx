import React from "react";
import { Link } from "react-router-dom";
import { Package, Droplets, Calendar, ChevronRight, GitBranch } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function BatchCard({ batch, actionLabel, onAction, to }) {
  const isCertified = batch.certStatus === "CERTIFIED";

  const cardContent = (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex flex-col gap-2.5">
      {/* Top row: Batch ID + Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center font-bold shrink-0">
            <Package size={18} />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-base text-bc-deep-green tracking-tight truncate">
              {batch.batchId}
            </div>
            <div className="text-xs text-[#6B7267] truncate">
              {batch.honeyType} Honey · Hive {batch.hiveId}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge status={batch.certStatus} />
        </div>
      </div>

      {/* Parent/Child Batch Indicator if split */}
      {batch.parentBatchId && (
        <div className="flex items-center gap-1 text-[11px] text-bc-amber bg-amber-50 px-2.5 py-1 rounded-lg w-fit">
          <GitBranch size={12} />
          <span>Child batch of {batch.parentBatchId}</span>
        </div>
      )}

      {/* Key data row in compact grid */}
      <div className="grid grid-cols-3 gap-2 py-2 bg-[#FBF9F2] rounded-xl px-3 text-xs">
        <div className="flex flex-col">
          <span className="text-[10.5px] text-[#8A9086]">Volume</span>
          <span className="font-bold text-bc-dark">{batch.quantity} L</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10.5px] text-[#8A9086]">Harvested</span>
          <span className="font-bold text-bc-dark">{batch.harvestDate}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10.5px] text-[#8A9086]">Stage</span>
          <span className="font-bold text-bc-forest">{batch.processingStatus || "Recorded"}</span>
        </div>
      </div>

      {/* Footer: Producer info & Action button */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <span className="text-[#8A9086] text-[11px] truncate max-w-[160px]">
          By {batch.producerName}
        </span>
        {onAction ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAction(batch);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-[#F3F1E8] hover:bg-[#EDE7D6] font-bold text-bc-dark text-xs active:scale-95 transition-transform"
          >
            {actionLabel || "Process"}
          </button>
        ) : (
          <div className="flex items-center gap-1 text-bc-deep-green font-bold text-xs">
            <span>View Journey</span>
            <ChevronRight size={13} />
          </div>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="block no-underline">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}
