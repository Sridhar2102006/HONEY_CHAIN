import React from "react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { Link } from "react-router-dom";

export default function LaboratoryDashboard() {
  const { batches, testRequests, certificates } = useApp();
  const pendingRequests = testRequests.filter((r) => r.status === "Pending Laboratory Acceptance").length;
  const testing = batches.filter((b) => b.stage === 4).length;
  const completed = batches.filter((b) => b.stage >= 5).length;

  return (
    <div>
      <PageHeader title="Laboratory Dashboard" />
      <div className="flex gap-3.5 flex-wrap">
        <StatCard label="Pending Requests" value={pendingRequests} tone="warning" />
        <StatCard label="Testing" value={testing} />
        <StatCard label="Completed" value={completed} tone="success" />
        <StatCard label="Certificates Issued" value={certificates.length} tone="gold" />
      </div>
      <div className="font-bold text-base mt-7 mb-3.5">Recent Requests</div>
      <div className="flex flex-col gap-2.5">
        {testRequests.slice(0, 5).map((r) => (
          <Link to={`/app/laboratory/requests?batchId=${r.batchId}`} key={r.requestId} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4 flex justify-between items-center">
            <div>
              <div className="font-bold font-display text-bc-deep-green text-sm">{r.batchId}</div>
              <div className="text-xs text-[#8A9086]">{r.tests.join(", ")} · {r.sampleQuantityMl} ml</div>
            </div>
            <span className="text-xs font-bold bg-bc-light-honey text-bc-amber px-2.5 py-1 rounded-full">{r.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
