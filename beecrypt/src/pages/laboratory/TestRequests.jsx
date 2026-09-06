import React from "react";
import { Link } from "react-router-dom";
import { FlaskConical, ArrowRight, Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function TestRequests() {
  const { testRequests } = useApp();

  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Sample Test Queue"
        sub="Inbound honey samples sent by processors for accredited chemical verification."
      />

      <div className="space-y-3">
        {testRequests.length === 0 ? (
          <EmptyState
            title="No test requests"
            subtitle="When processors submit honey samples, they will appear here."
          />
        ) : (
          testRequests.map((r) => (
            <div
              key={r.requestId}
              className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display font-bold text-base text-bc-deep-green font-mono">
                    {r.batchId}
                  </div>
                  <div className="text-xs text-[#8A9086] mt-0.5">
                    Sample Volume: <b>{r.sampleQuantityMl} ml</b> · Requested {r.requestedDate}
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-bc-light-honey text-bc-amber px-2.5 py-0.5 rounded-full">
                  Pending Lab Analysis
                </span>
              </div>

              {/* Requested tests pills */}
              <div className="flex flex-wrap gap-1.5 py-1">
                {r.tests.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] bg-[#F8F6EC] text-[#4B5548] px-2.5 py-0.5 rounded-full font-semibold"
                  >
                    🧪 {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#F2EDE2]">
                <span className="text-[11px] text-[#8A9086]">Request #{r.requestId}</span>
                <Link
                  to={`/app/laboratory/purity?batchId=${r.batchId}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs active:scale-95 transition-transform flex items-center gap-1 shadow-xs"
                >
                  <span>Start Analysis</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
