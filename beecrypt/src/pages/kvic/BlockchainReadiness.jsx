import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";
import { blockchainReadiness } from "../../services/blockchainService.js";

const ROW_DEFS = [
  { key: "batchesWithIds", label: "Batches with Permanent IDs" },
  { key: "actorIds", label: "Stakeholders with Actor IDs" },
  { key: "events", label: "Complete Provenance Events" },
  { key: "relationships", label: "Batches with Parent/Child Links" },
  { key: "quality", label: "Quality Records Complete" },
  { key: "certs", label: "Certificates Available" },
  { key: "hashReady", label: "Events Ready for Hashing" },
  { key: "signReady", label: "Events Ready for Signing" },
  { key: "chainReady", label: "Events Ready for Blockchain" },
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
    <div>
      <PageHeader title="Blockchain Readiness" sub="A frontend-only illustrative calculation — not a real on-chain metric." />
      <div className="bg-bc-deep-green text-white rounded-2xl p-6 mb-6 max-w-sm">
        <div className="text-sm opacity-80">Blockchain Readiness</div>
        <div className="font-display text-5xl font-semibold mt-1">{score}%</div>
      </div>
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm divide-y divide-[#ECE6D6] max-w-lg">
        {ROW_DEFS.map((r) => (
          <div key={r.key} className="flex justify-between px-5 py-3 text-sm">
            <span className="text-[#6B7267]">{r.label}</span>
            <span className="font-bold">{counts[r.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
