import React, { useState } from "react";
import { ShieldCheck, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { formatDateTime } from "../utils/format.js";
import ProvenanceStatus, { provenanceStatusFor } from "./ProvenanceStatus.jsx";

/**
 * Mobile Trust Layer Card (Section 10).
 * Presents provenance state without exposing infrastructure language by default.
 */
export default function BlockchainProofCard({ event }) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  if (!event) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 text-center text-xs text-[#8A9086]">
        No provenance event selected yet.
      </div>
    );
  }

  const row = (label, value, mono = false) => (
    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EBE0] last:border-none text-xs">
      <span className="text-[#8A9086]">{label}</span>
      <span className={`font-semibold text-right ${mono ? "font-mono text-[11px] text-bc-deep-green" : "text-bc-dark"}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-xs overflow-hidden">
      {/* Trust Layer Header (User Facing) */}
      <div className="bg-gradient-to-r from-bc-deep-green to-bc-forest p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-base">
            <ShieldCheck size={20} className="text-bc-gold" />
            <span>Provenance status</span>
          </div>
        </div>

        <div className="mt-3"><ProvenanceStatus status={provenanceStatusFor(event)} compact /></div>
        <div className="mt-2 text-[11px] text-white/70">Event {event.eventId} is recorded in HoneyChain.</div>
      </div>

      {/* Basic Summary */}
      <div className="p-4 bg-white space-y-1">
        {row("Batch ID", event.batchId, true)}
        {row("Event Type", event.eventType?.replaceAll("_", " "))}
        {row("Actor ID", event.actorId, true)}
        {row("Occurred", formatDateTime(event.occurredAt))}
      </div>

      {/* Expandable advanced verification details */}
      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => setDetailsExpanded((prev) => !prev)}
          className="w-full py-2.5 px-3 rounded-xl bg-[#F8F6EC] hover:bg-[#F0ECE0] text-bc-dark text-xs font-bold flex items-center justify-between active:scale-[0.99] transition-all"
        >
          <span className="flex items-center gap-1.5 text-bc-deep-green">
            <Lock size={13} />
            <span>{detailsExpanded ? "Hide verification details" : "View verification details"}</span>
          </span>
          {detailsExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Technical Details Accordion */}
        {detailsExpanded && (
          <div className="mt-3 p-3.5 bg-[#FBF9F4] rounded-xl border border-[#ECE6D6] space-y-1 text-xs animate-in fade-in duration-200">
            <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-2">
              Advanced verification details
            </div>
            {row("Payload hash", event.payloadHash || "Not available")}
            {row("Previous hash", event.previousEventHash || "Not available")}
            {row("Digital signature", event.signature || "Not available")}
            {row("Verification reference", event.blockchainTx || "Not available")}
            <p className="text-[10.5px] text-[#8A9086] mt-2 pt-2 border-t border-[#ECE6D6] italic">
              Technical verification details will appear here when the provenance service is available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
