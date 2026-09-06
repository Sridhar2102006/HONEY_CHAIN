import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, FileText, CheckCircle2, ExternalLink, Download } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";

export default function CertificateCard({ cert }) {
  const isPass = cert.result === "PASS";

  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-bc-light-green text-bc-success flex items-center justify-center shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-bc-deep-green tracking-tight">
              {cert.certificateId}
            </h4>
            <div className="text-[11px] text-[#8A9086] mt-0.5 font-mono">
              Batch {cert.batchId}
            </div>
          </div>
        </div>

        <StatusBadge status={cert.result} tone={isPass ? "success" : "critical"} />
      </div>

      <div className="grid grid-cols-2 gap-2 py-2 bg-[#FBF9F2] rounded-xl px-3 text-xs">
        <div>
          <span className="text-[10.5px] text-[#8A9086] block">Laboratory ID</span>
          <span className="font-semibold text-bc-dark">{cert.labId}</span>
        </div>
        <div>
          <span className="text-[10.5px] text-[#8A9086] block">Issue Date</span>
          <span className="font-semibold text-bc-dark">{cert.issueDate || cert.testDate}</span>
        </div>
      </div>

      {cert.fileName && (
        <div className="flex items-center justify-between p-2.5 bg-[#F8F6EC] rounded-xl text-xs">
          <span className="flex items-center gap-1.5 font-semibold text-bc-dark truncate">
            <FileText size={14} className="text-bc-amber shrink-0" />
            <span className="truncate">{cert.fileName}</span>
          </span>
          <span className="text-[11px] font-bold text-bc-success flex items-center gap-1 shrink-0">
            <CheckCircle2 size={12} /> Stored Off-chain
          </span>
        </div>
      )}

      <div className="pt-1 flex items-center justify-between text-xs">
        <span className="text-[10.5px] text-[#8A9086]">Verifier: {cert.verifierId || "NABL-V1"}</span>
        <Link
          to={`/app/traceability?batchId=${cert.batchId}`}
          className="text-xs font-bold text-bc-deep-green flex items-center gap-1 hover:underline"
        >
          <span>View Provenance</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
