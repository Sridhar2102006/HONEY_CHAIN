import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Hexagon, ShieldCheck, Droplets, Factory, FlaskConical, 
  CheckCircle2, AlertTriangle, ChevronRight, QrCode, Lock, ChevronDown, ChevronUp 
} from "lucide-react";
import { useApp } from "../hooks/useApp.js";
import QRCodeCard from "../components/QRCodeCard.jsx";
import QRScannerModal from "../components/mobile/QRScannerModal.jsx";
import { formatDateTime } from "../utils/format.js";
import ProvenanceStatus from "../components/ProvenanceStatus.jsx";

export default function Verify() {
  const { batchId } = useParams();
  const { batches, certificates } = useApp();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [blockchainDrawer, setBlockchainDrawer] = useState(false);

  const batch = batches.find((b) => b.batchId.toLowerCase() === batchId?.trim()?.toLowerCase());
  const cert = certificates.find((c) => c.batchId.toLowerCase() === batchId?.trim()?.toLowerCase());
  const certificateRecorded = !!batch && batch.certStatus === "CERTIFIED";

  const journeySteps = [
    { label: "Apiary Harvest", sub: batch ? `Hive ${batch.hiveId} · ${batch.producerName}` : "Recorded", icon: Hexagon },
    { label: "Cold Processing", sub: batch ? batch.processingMethod || "Cold Extraction" : "Recorded", icon: Factory },
    { label: "Laboratory Purity", sub: batch ? `${batch.testStatus} by ${batch.labId || "Accredited Lab"}` : "Quality Tested", icon: FlaskConical },
    { label: "Consumer Shelf", sub: "Authenticity Verified", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#111A14] text-white py-6 px-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <Hexagon size={22} fill="#F59E0B" className="text-bc-deep-green" />
            <span>BeeCrypt Trust Seal</span>
          </Link>
          <button
            onClick={() => setScannerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-bc-gold transition-colors"
          >
            <QrCode size={14} />
            <span>Scan Another</span>
          </button>
        </div>

        {/* Consumer Card */}
        <div className="bg-white rounded-3xl p-6 text-bc-dark shadow-2xl space-y-4">
          {!batch ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-16 h-16 rounded-full bg-red-100 text-bc-critical flex items-center justify-center mx-auto mb-2">
                <AlertTriangle size={32} />
              </div>
              <h2 className="font-display font-bold text-2xl text-bc-critical">
                Product Record Not Found
              </h2>
              <p className="text-xs text-[#6B7267] max-w-xs mx-auto">
                No authenticity certificate exists for identifier <b>{batchId}</b>. Please check with your retailer.
              </p>
            </div>
          ) : (
            <>
              {/* Authenticity Seal Header */}
              <div className="text-center space-y-1">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    certificateRecorded ? "bg-bc-light-honey text-bc-amber" : "bg-bc-light-honey text-bc-amber"
                  }`}
                >
                  <ShieldCheck size={36} />
                </div>

                <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
                  Consumer Authenticity Seal
                </div>

                <h2 className="font-display font-bold text-2xl text-bc-deep-green">
                  {certificateRecorded ? "Certificate recorded" : "Certification pending"}
                </h2>

                <p className="text-xs text-[#6B7267]">
                  {certificateRecorded
                    ? "A certificate record exists for this batch. External provenance verification is temporarily unavailable."
                    : "This honey batch is awaiting a local laboratory certificate record."}
                </p>
              </div>

              {/* QR Image */}
              <div className="flex justify-center py-1">
                <QRCodeCard batchId={batch.batchId} size={140} />
              </div>

              {/* Essential Consumer Facts */}
              <div className="bg-[#F8F6EC] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-[#ECE6D6]">
                  <span className="text-[#8A9086]">Honey Type:</span>
                  <span className="font-bold text-bc-deep-green">Premium {batch.honeyType} Honey</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE6D6]">
                  <span className="text-[#8A9086]">Permanent Batch ID:</span>
                  <span className="font-mono font-bold">{batch.batchId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE6D6]">
                  <span className="text-[#8A9086]">Harvest Origin:</span>
                  <span className="font-semibold text-right">{batch.producerName} · {batch.region}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE6D6]">
                  <span className="text-[#8A9086]">Harvest Date:</span>
                  <span className="font-semibold">{batch.harvestDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#ECE6D6]">
                  <span className="text-[#8A9086]">Purity Compliance:</span>
                  <span className="font-bold text-bc-success">{batch.testStatus} (Accredited)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8A9086]">Certificate ID:</span>
                  <span className="font-mono font-bold text-bc-amber">{batch.certificateId || "In Processing"}</span>
                </div>
              </div>

              {/* Simplified Consumer Journey Stepper */}
              <div>
                <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-2.5">
                  Supply Chain Journey
                </div>
                <div className="space-y-2">
                  {journeySteps.map((s, i) => (
                    <div key={s.label} className="flex items-center gap-3 bg-[#FCFAF5] p-2.5 rounded-xl border border-[#F0EBE0]">
                      <div className="w-8 h-8 rounded-lg bg-bc-light-honey text-bc-amber flex items-center justify-center shrink-0">
                        <s.icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-bc-dark">{s.label}</div>
                        <div className="text-[11px] text-[#8A9086] truncate">{s.sub}</div>
                      </div>
                      <CheckCircle2 size={16} className="text-bc-success shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

                {/* Provenance trust confirmation */}
                  <div className="bg-bc-deep-green text-white rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-bc-gold" />
                    <span>Provenance status</span>
                  </div>
                </div>
                <ProvenanceStatus status="unavailable" />
                <p className="text-[11px] text-white/80 leading-relaxed">
                  Batch <b>{batch.batchId}</b> is recorded in HoneyChain. External verification is temporarily unavailable and does not invalidate this record.
                </p>
                <div className="text-[10px] text-white/60 pt-1 border-t border-white/10">
                  Verification Timestamp: {formatDateTime(new Date())}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-white/40 pt-4 max-w-md mx-auto">
        BeeCrypt — Decentralized Honey Trust &amp; Traceability
      </div>

      {/* QR Scanner Modal for Consumer view */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}
