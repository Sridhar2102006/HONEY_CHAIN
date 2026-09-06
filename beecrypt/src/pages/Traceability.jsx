import React, { useMemo, useState } from "react";
import { useSearchParams, Link, useOutletContext } from "react-router-dom";
import { 
  Search, Hexagon, Droplets, Factory, FlaskConical, 
  ShieldCheck, QrCode, ExternalLink, GitBranch, Sparkles 
} from "lucide-react";
import { useApp } from "../hooks/useApp.js";
import PageHeader from "../components/PageHeader.jsx";
import ProvenanceEventCard from "../components/ProvenanceEventCard.jsx";
import BlockchainProofCard from "../components/BlockchainProofCard.jsx";
import QRCodeCard from "../components/QRCodeCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { getBatchTimeline } from "../services/provenanceService.js";
import { childrenOf } from "../services/batchService.js";

export default function Traceability() {
  const { batches, batchRelationships, provenanceEvents, certificates } = useApp();
  const [params] = useSearchParams();
  const outletContext = useOutletContext();

  const [query, setQuery] = useState(
    params.get("batchId") || batches[0]?.batchId || ""
  );

  const batch = useMemo(
    () => batches.find((b) => b.batchId.toLowerCase() === query.trim().toLowerCase()),
    [batches, query]
  );
  const timeline = useMemo(
    () => getBatchTimeline(provenanceEvents, batch?.batchId || query),
    [provenanceEvents, batch, query]
  );
  const children = useMemo(
    () => childrenOf(batchRelationships, batch?.batchId || query),
    [batchRelationships, batch, query]
  );
  const cert = certificates.find((c) => c.batchId === batch?.batchId);
  const lastEvent = timeline[timeline.length - 1];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Honey Traceability"
        sub="Search or scan any batch for its complete hive-to-shelf provenance trail."
      />

      {/* Search Input with Scanner Button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A9086]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Batch ID (e.g. BEE-2026-001024)..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-[#ECE6D6] text-xs font-mono font-bold outline-none focus:border-bc-deep-green shadow-xs"
          />
        </div>
        <button
          type="button"
          onClick={() => outletContext?.openScanner?.()}
          className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-bc-gold to-bc-amber text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          title="Scan QR Code"
        >
          <QrCode size={16} />
          <span className="hidden xs:inline">Scan</span>
        </button>
      </div>

      {/* Quick Select Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-[11px] text-[#8A9086] shrink-0 font-medium">Quick Batch:</span>
        {batches.map((b) => (
          <button
            key={b.batchId}
            type="button"
            onClick={() => setQuery(b.batchId)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold transition-all shrink-0 ${
              batch?.batchId === b.batchId
                ? "bg-bc-deep-green text-white shadow-xs"
                : "bg-white border border-[#ECE6D6] text-[#4B5548]"
            }`}
          >
            {b.batchId}
          </button>
        ))}
      </div>

      {!batch ? (
        <EmptyState
          title="No batch found"
          subtitle="Check the Batch ID or select one of the registered batches above."
        />
      ) : (
        <div className="space-y-4">
          {/* Batch Primary Identity Card */}
          <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-[#8A9086] uppercase tracking-wider">
                  Verified Batch Target
                </span>
                <h3 className="font-display font-bold text-xl text-bc-deep-green font-mono">
                  {batch.batchId}
                </h3>
                <div className="text-xs text-[#6B7267] mt-0.5 font-semibold">
                  {batch.honeyType} Honey · {batch.quantity} Litres
                </div>
              </div>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  batch.certStatus === "CERTIFIED"
                    ? "bg-bc-light-green text-bc-success"
                    : "bg-bc-light-honey text-bc-amber"
                }`}
              >
                {batch.certStatus === "CERTIFIED" ? "✓ CERTIFIED" : "PENDING LAB"}
              </span>
            </div>

            {/* Key Data Grid */}
            <div className="grid grid-cols-2 gap-2.5 py-2.5 border-t border-b border-[#F2EDE2] text-xs">
              <div>
                <span className="text-[#8A9086] text-[11px] block">Producer Apiary</span>
                <span className="font-semibold text-bc-dark">{batch.producerName} (Hive {batch.hiveId})</span>
              </div>
              <div>
                <span className="text-[#8A9086] text-[11px] block">Harvest Region</span>
                <span className="font-semibold text-bc-dark">{batch.region}</span>
              </div>
              <div>
                <span className="text-[#8A9086] text-[11px] block">Harvest Date</span>
                <span className="font-semibold text-bc-dark">{batch.harvestDate}</span>
              </div>
              <div>
                <span className="text-[#8A9086] text-[11px] block">Processing Method</span>
                <span className="font-semibold text-bc-dark">{batch.processingMethod || "Cold Extraction"}</span>
              </div>
              <div>
                <span className="text-[#8A9086] text-[11px] block">Testing Laboratory</span>
                <span className="font-semibold text-bc-dark">{batch.labId || "Assigned"}</span>
              </div>
              <div>
                <span className="text-[#8A9086] text-[11px] block">Purity Result</span>
                <span className="font-bold text-bc-success">{batch.testStatus}</span>
              </div>
            </div>

            {/* Consumer Verification Link */}
            <div className="flex justify-end">
              <Link
                to={`/verify/${batch.batchId}`}
                className="text-xs font-bold text-bc-deep-green flex items-center gap-1 hover:underline"
              >
                <span>View Public Consumer Verification</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* Batch Relationships / Splitting Tree (if split) */}
          {(batch.parentBatchId || children.length > 0) && (
            <div className="bg-white rounded-3xl border border-[#ECE6D6] p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A9086] uppercase tracking-wider mb-2">
                <GitBranch size={14} className="text-bc-amber" />
                <span>Batch Lineage &amp; Portioning</span>
              </div>
              <div className="bg-[#F8F6EC] p-3 rounded-2xl font-mono text-xs text-bc-deep-green space-y-1">
                <div className="font-bold">
                  {batch.parentBatchId || batch.batchId} (Parent Batch)
                </div>
                {(children.length > 0 ? children : [{ childBatchId: batch.batchId }]).map(
                  (c, i, arr) => (
                    <div key={c.childBatchId} className="pl-3.5 text-[#4B5548]">
                      {i === arr.length - 1 ? "└── " : "├── "}
                      <span className="font-bold text-bc-dark">{c.childBatchId}</span>
                      {c.quantity && <span className="text-[#8A9086]"> ({c.quantity} L)</span>}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Provenance Journey Timeline */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="font-display font-bold text-base text-bc-deep-green">
                Provenance Timeline ({timeline.length})
              </h4>
              <span className="text-[11px] text-[#8A9086]">Tap any event for details</span>
            </div>

            <div className="space-y-2.5">
              {timeline.length === 0 ? (
                <EmptyState title="No events recorded for this batch" />
              ) : (
                timeline.map((e) => (
                  <ProvenanceEventCard key={e.eventId} event={e} />
                ))
              )}
            </div>
          </div>

          {/* Provenance verification layer */}
          <div>
            <h4 className="font-display font-bold text-base text-bc-deep-green mb-2 px-1">
              Provenance verification
            </h4>
            <BlockchainProofCard event={lastEvent} />
          </div>

          {/* Consumer QR Code Card */}
          <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs text-center space-y-3">
            <h4 className="font-display font-bold text-base text-bc-deep-green">
              Product Consumer QR Seal
            </h4>
            <p className="text-xs text-[#8A9086] max-w-xs mx-auto">
              Scanning this code in the retail aisle immediately confirms origin and test reports for consumers.
            </p>

            <div className="py-2 flex justify-center">
              <QRCodeCard batchId={batch.batchId} size={150} />
            </div>

            <Link
              to={`/verify/${batch.batchId}`}
              className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-xs active:scale-95 transition-transform"
            >
              <span>Test Consumer Verification Screen</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
