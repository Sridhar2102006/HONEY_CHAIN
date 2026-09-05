import React from "react";
import { useParams, Link } from "react-router-dom";
import { Hexagon, ShieldCheck, Hexagon as HexIcon, Droplets, Factory, FlaskConical, ChevronRight } from "lucide-react";
import { useApp } from "../hooks/useApp.js";
import QRCodeCard from "../components/QRCodeCard.jsx";
import { formatDateTime } from "../utils/format.js";

/**
 * Consumer-facing verification page (Sections 29-30). Deliberately shows
 * only a simplified result — no actor IDs, no raw provenance events, no
 * internal workspace data.
 */
export default function Verify() {
  const { batchId } = useParams();
  const { batches, certificates } = useApp();
  const batch = batches.find((b) => b.batchId === batchId);
  const cert = certificates.find((c) => c.batchId === batchId);
  const verified = !!batch && batch.certStatus === "CERTIFIED";

  const steps = [
    { icon: HexIcon, label: "Beekeeper" },
    { icon: Factory, label: "Processor" },
    { icon: FlaskConical, label: "Quality" },
    { icon: ShieldCheck, label: "Retailer" },
  ];

  return (
    <div className="min-h-screen px-5 py-12 bc-honeycomb-bg">
      <div className="max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-white mb-6">
          <Hexagon size={22} fill="#F59E0B" className="text-bc-deep-green" /> BeeCrypt
        </Link>

        <div className="bg-white rounded-2xl p-8 text-center">
          {!batch ? (
            <>
              <div className="font-display text-xl text-bc-critical">Not Verified</div>
              <p className="text-sm text-[#6B7267] mt-2">No record found for batch <b>{batchId}</b>.</p>
            </>
          ) : (
            <>
              <div className={`w-13 h-13 rounded-full flex items-center justify-center mx-auto mb-3.5 ${verified ? "bg-bc-light-green" : "bg-bc-light-honey"}`} style={{ width: 52, height: 52 }}>
                <ShieldCheck size={26} className={verified ? "text-bc-success" : "text-bc-amber"} />
              </div>
              <div className="font-display text-xl text-bc-deep-green">{verified ? "Verified Honey" : "Verification Pending"}</div>
              <div className="text-[13.5px] text-[#6B7267] mt-1">
                {verified ? "✓ Authenticity record found" : "This batch has not completed certification yet."}
              </div>

              <div className="flex justify-center my-6"><QRCodeCard batchId={batch.batchId} /></div>

              <div className="text-left bg-[#F8F6EC] rounded-xl p-4 text-[13.5px] space-y-0">
                {[
                  ["Batch ID", batch.batchId],
                  ["Product", `Premium ${batch.honeyType} Honey`],
                  ["Origin", `${batch.producerName} · ${batch.region}`],
                  ["Harvest Date", batch.harvestDate],
                  ["Quality Result", batch.testStatus],
                  ["Certificate ID", batch.certificateId || "Not yet issued"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-[#ECE6D6] last:border-none">
                    <span className="text-[#8A9086]">{k}</span><span className="font-bold text-right">{v}</span>
                  </div>
                ))}
              </div>

              <div className="text-left mt-5">
                <div className="text-xs font-bold text-[#8A9086] mb-2">JOURNEY</div>
                <div className="flex items-center flex-wrap gap-1">
                  {steps.map((s, i) => (
                    <React.Fragment key={s.label}>
                      <span className="flex items-center gap-1 text-xs font-semibold bg-white border border-[#ECE6D6] rounded-full px-2.5 py-1">
                        <s.icon size={12} className="text-bc-amber" /> {s.label}
                      </span>
                      {i < steps.length - 1 && <ChevronRight size={13} className="text-[#C9C2AC]" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="text-left bg-bc-deep-green text-white rounded-xl p-4 mt-5">
                <div className="font-bold text-sm mb-1.5">Blockchain Verification</div>
                <div className="text-xs opacity-80">Record Verified (off-chain)</div>
                <div className="text-xs opacity-80">Transaction Reference: Pending / Demo</div>
                <div className="text-xs opacity-80">Verification Time: {formatDateTime(new Date())}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
