import React, { useState } from "react";
import { 
  Hexagon, Droplets, Factory, FlaskConical, ShieldCheck, 
  ChevronDown, ChevronUp, Clock, User, AlertCircle, Lock 
} from "lucide-react";
import { formatDateTime } from "../utils/format.js";
import ProvenanceStatus, { provenanceStatusFor } from "./ProvenanceStatus.jsx";

const EVENT_ICONS = {
  HARVESTED: Hexagon,
  EXTRACTED: Droplets,
  PROCESSED: Factory,
  QUALITY_TEST_REQUESTED: FlaskConical,
  QUALITY_VERIFY: FlaskConical,
  BATCH_SPLIT: Factory,
  CERTIFICATE_ISSUED: ShieldCheck,
  RETAIL_RECEIVE: ShieldCheck,
};

export default function ProvenanceEventCard({ event }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = EVENT_ICONS[event.eventType] || Hexagon;

  return (
    <div
      onClick={() => setExpanded((p) => !p)}
      className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs hover:border-bc-gold/60 cursor-pointer active:bg-[#FBF9F4] transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center shrink-0 shadow-xs">
            <Icon size={20} />
          </div>
          <div>
            <h5 className="font-display font-bold text-sm text-bc-deep-green tracking-tight">
              {event.eventType.replaceAll("_", " ")}
            </h5>
            <div className="text-[11px] text-[#8A9086] flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-bc-forest">{event.eventId}</span>
              <span>·</span>
              <span>{formatDateTime(event.occurredAt)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="w-7 h-7 rounded-full bg-[#F3F1E8] flex items-center justify-center text-[#8A9086] shrink-0"
          aria-label="Expand event details"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Quick summary strip */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F3F0E6] text-xs text-[#6B7267]">
        <div className="flex items-center gap-1">
          <User size={12} className="text-[#8A9086]" />
          <span>Actor: <b className="font-mono text-bc-dark">{event.actorId}</b></span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-bc-amber bg-bc-light-honey px-2 py-0.5 rounded-full">
          <ShieldCheck size={11} /> Recorded in HoneyChain
        </span>
      </div>

      {/* Expandable full payload and blockchain data */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#ECE6D6] text-xs space-y-2 animate-in fade-in duration-200">
          <div className="bg-[#F8F6EC] rounded-xl p-3 space-y-1.5">
            <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-1">
              Event Payload &amp; Metadata
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A9086]">Batch Target:</span>
              <span className="font-mono font-bold">{event.batchId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8A9086]">Recorded At:</span>
              <span className="font-semibold">{formatDateTime(event.recordedAt)}</span>
            </div>
            {event.payload && Object.entries(event.payload).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-[#8A9086] capitalize">{k}:</span>
                <span className="font-semibold">{String(v)}</span>
              </div>
            ))}
          </div>

          <ProvenanceStatus status={provenanceStatusFor(event)} />
        </div>
      )}
    </div>
  );
}
