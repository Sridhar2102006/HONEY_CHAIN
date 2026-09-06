import React from "react";
import { ShieldCheck, CheckCircle2, Lock, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";
import { blockchainReadiness } from "../../services/blockchainService.js";

const ROW_DEFS = [
  { key: "batchesWithIds", label: "Batches with Permanent IDs" },
  { key: "actorIds", label: "Stakeholders with Actor IDs" },
  { key: "events", label: "Complete Provenance Events" },
  { key: "relationships", label: "Parent/Child Lineage Links" },
  { key: "quality", label: "Quality Lab Records" },
  { key: "certs", label: "Certificates Stored Off-chain" },
  { key: "hashReady", label: "Canonical Hashing Ready" },
  { key: "signReady", label: "Digital Signature Seams" },
  { key: "chainReady", label: "Ledger Gateway Compliant" },
];

export default function BlockchainReadiness() {
  const { batches, provenanceEvents, certificates, batchRelationships, qualityResults } = useApp();
  const score = blockchainReadiness(batches, provenanceEvents, certificates);

  const counts = {
    batchesWithIds: batches.length,
    actorIds: new Set(batches.map((b) => b.producerId)).size,
    events: provenanceEvents.length,
    relationships: batchRelationships.length,
    quality: qualityResults.length,
    certs: certificates.length,
    hashReady: provenanceEvents.length,
    signReady: provenanceEvents.length,
    chainReady: provenanceEvents.length,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Provenance Infrastructure"
        sub="Operational readiness across supply chain records and verification services."
      />

      {/* Readiness Score Card */}
      <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest text-white rounded-3xl p-6 shadow-md text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-bc-gold mb-1">
          <ShieldCheck size={26} />
        </div>
        <div className="text-xs font-bold uppercase tracking-wider text-white/75">
          Ecosystem provenance readiness
        </div>
        <div className="font-display text-5xl font-bold text-bc-gold">
          {score}%
        </div>
        <p className="text-xs text-white/80 max-w-xs mx-auto leading-relaxed">
          Supply chain records are structured for consistent provenance verification. This score is an operational indicator, not an on-chain confirmation.
        </p>
      </div>

      {/* Audit Checklist Items */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider px-1">
          Provenance readiness checklist
        </div>

        <div className="bg-white rounded-3xl border border-[#ECE6D6] shadow-xs divide-y divide-[#F2EDE2] overflow-hidden">
          {ROW_DEFS.map((r) => (
            <div key={r.key} className="flex items-center justify-between p-3.5 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-bc-success shrink-0" />
                <span className="font-medium text-bc-dark">{r.label}</span>
              </div>
              <span className="font-bold text-bc-deep-green font-mono">
                {counts[r.key]} verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
