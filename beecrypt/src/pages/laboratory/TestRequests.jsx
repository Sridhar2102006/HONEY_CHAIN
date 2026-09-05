import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

export default function TestRequests() {
  const { testRequests } = useApp();
  return (
    <div>
      <PageHeader title="Test Requests" sub="Samples sent to you by processors." />
      <div className="flex flex-col gap-2.5">
        {testRequests.length === 0 ? <EmptyState title="No requests yet" /> : testRequests.map((r) => (
          <Link to={`/app/laboratory/purity?batchId=${r.batchId}`} key={r.requestId} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4 flex justify-between items-center flex-wrap gap-2">
            <div>
              <div className="font-bold font-display text-bc-deep-green text-sm">{r.batchId}</div>
              <div className="text-xs text-[#8A9086]">Sample {r.sampleQuantityMl} ml · Requested {r.requestedDate}</div>
            </div>
            <span className="text-xs font-bold bg-bc-light-honey text-bc-amber px-2.5 py-1 rounded-full">{r.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
