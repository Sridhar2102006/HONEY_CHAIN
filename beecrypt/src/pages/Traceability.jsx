import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Hexagon, Droplets, Factory, FlaskConical, ShieldCheck, QrCode, ChevronRight } from "lucide-react";
import { useApp } from "../hooks/useApp.js";
import PageHeader from "../components/PageHeader.jsx";
import ProvenanceEventCard from "../components/ProvenanceEventCard.jsx";
import BlockchainProofCard from "../components/BlockchainProofCard.jsx";
import QRCodeCard from "../components/QRCodeCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { getBatchTimeline } from "../services/provenanceService.js";
import { childrenOf } from "../services/batchService.js";
import { blockchainReadiness } from "../services/blockchainService.js";

const JOURNEY_ICONS = {
  HARVESTED: Hexagon,
  EXTRACTED: Droplets,
  PROCESSED: Factory,
  QUALITY_TEST_REQUESTED: FlaskConical,
  QUALITY_VERIFY: FlaskConical,
  BATCH_SPLIT: Factory,
  CERTIFICATE_ISSUED: ShieldCheck,
  RETAIL_RECEIVE: QrCode,
};

export default function Traceability() {
  const { batches, batchRelationships, provenanceEvents, certificates } = useApp();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("batchId") || batches[0]?.batchId || "");

  const batch = useMemo(() => batches.find((b) => b.batchId === query), [batches, query]);
  const timeline = useMemo(() => getBatchTimeline(provenanceEvents, query), [provenanceEvents, query]);
  const children = useMemo(() => childrenOf(batchRelationships, query), [batchRelationships, query]);
  const cert = certificates.find((c) => c.batchId === query);
  const lastEvent = timeline[timeline.length - 1];

  return (
    <div>
      <PageHeader title="Honey Traceability" sub="Search any batch to see its full hive-to-consumer journey." />

      <div className="flex gap-2.5 mb-6 max-w-md">
        <div className="flex items-center bg-white border border-[#ECE6D6] rounded-xl px-3 py-2.5 flex-1">
          <Search size={15} className="text-[#8A9086]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="border-none outline-none bg-transparent ml-2 text-sm w-full" placeholder="BEE-2026-001024" />
        </div>
      </div>

      {!batch ? (
        <EmptyState title="No batch found" subtitle="Check the Batch ID and try again." />
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 text-sm space-y-1.5">
              {[
                ["Producer", batch.producerName], ["Actor ID", batch.producerId], ["Hive", batch.hiveId],
                ["Region", batch.region], ["Honey Type", batch.honeyType], ["Floral Source", batch.floralSource],
                ["Harvest Date", batch.harvestDate], ["Quantity", `${batch.quantity} L`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[#ECE6D6] last:border-none py-1.5">
                  <span className="text-[#8A9086]">{k}</span><span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 text-sm space-y-1.5">
              {[
                ["Processor", batch.processorId || "—"], ["Processing Method", batch.processingMethod || "—"],
                ["Laboratory", batch.labId || "—"], ["Test Result", batch.testStatus],
                ["Certificate", batch.certificateId || "Not yet issued"], ["Verification Status", batch.certStatus],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-[#ECE6D6] last:border-none py-1.5">
                  <span className="text-[#8A9086]">{k}</span><span className="font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Batch relationship graph (Section 39) */}
          {(batch.parentBatchId || children.length > 0) && (
            <div className="mb-6">
              <div className="font-bold text-sm mb-2.5">Batch Relationships</div>
              <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 font-mono text-[13px]">
                <div className="font-bold text-bc-deep-green">{batch.parentBatchId || batch.batchId}</div>
                {(children.length > 0 ? children : [{ childBatchId: batch.batchId }]).map((c, i, arr) => (
                  <div key={c.childBatchId} className="pl-4 mt-1">
                    {i === arr.length - 1 ? "└──" : "├──"} {c.childBatchId}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="font-bold text-sm mb-2.5 mt-2">Provenance Timeline</div>
          <div className="flex flex-col gap-2.5 mb-6">
            {timeline.length === 0 ? (
              <EmptyState title="No events recorded yet" />
            ) : (
              timeline.map((e) => <ProvenanceEventCard key={e.eventId} event={e} />)
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-bold text-sm mb-2.5">Blockchain Proof (Latest Event)</div>
              <BlockchainProofCard event={lastEvent} />
            </div>
            <div>
              <div className="font-bold text-sm mb-2.5">Consumer QR</div>
              <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 flex flex-col items-center gap-3">
                <QRCodeCard batchId={batch.batchId} />
                {cert ? (
                  <span className="text-xs font-bold text-bc-success">Certificate {cert.certificateId} — resolves to VERIFIED</span>
                ) : (
                  <span className="text-xs font-bold text-bc-amber">No certificate yet — resolves to NOT VERIFIED</span>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
