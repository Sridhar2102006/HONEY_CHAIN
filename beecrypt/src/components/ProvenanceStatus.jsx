import React from "react";
import { CheckCircle2, Clock3, LoaderCircle, ShieldAlert, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  verified: {
    label: "Verified provenance",
    description: "This record has been externally verified.",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  pending: {
    label: "Verification pending",
    description: "The record is saved and awaiting provenance synchronization.",
    icon: Clock3,
    classes: "bg-amber-50 text-amber-900 border-amber-200",
  },
  syncing: {
    label: "Synchronizing provenance",
    description: "The record is being prepared for external verification.",
    icon: LoaderCircle,
    classes: "bg-sky-50 text-sky-900 border-sky-200",
  },
  unavailable: {
    label: "Provenance record saved",
    description: "The record is saved in HoneyChain. External verification is temporarily unavailable.",
    icon: ShieldAlert,
    classes: "bg-slate-50 text-slate-700 border-slate-200",
  },
  failed: {
    label: "Verification needs attention",
    description: "The record is saved, but its verification attempt needs review.",
    icon: XCircle,
    classes: "bg-red-50 text-red-800 border-red-200",
  },
};

export function provenanceStatusFor(record = {}) {
  const status = String(record.blockchainStatus || record.provenanceStatus || "").toUpperCase();
  if (record.blockchainTx && ["CONFIRMED", "VERIFIED", "COMPLETE"].includes(status)) return "verified";
  if (["SYNCING", "PROCESSING"].includes(status)) return "syncing";
  if (["PENDING", "QUEUED"].includes(status)) return "pending";
  if (["FAILED", "ERROR"].includes(status)) return "failed";
  return "unavailable";
}

export default function ProvenanceStatus({ status = "unavailable", timestamp, verificationId, compact = false }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unavailable;
  const Icon = config.icon;

  return (
    <div className={`border rounded-xl ${compact ? "px-2.5 py-1.5" : "p-3"} ${config.classes}`} role="status">
      <div className="flex items-start gap-2">
        <Icon size={compact ? 14 : 16} className={`shrink-0 mt-0.5 ${status === "syncing" ? "animate-spin" : ""}`} aria-hidden="true" />
        <div className="min-w-0">
          <div className={`${compact ? "text-[11px]" : "text-xs"} font-bold`}>{config.label}</div>
          {!compact && <p className="text-[11px] leading-relaxed mt-0.5 opacity-85">{config.description}</p>}
          {(timestamp || verificationId) && (
            <div className="text-[10px] mt-1 opacity-75 truncate">
              {verificationId ? `Reference: ${verificationId}` : null}
              {verificationId && timestamp ? " · " : null}
              {timestamp || null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}