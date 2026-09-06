import React from "react";
import { Link } from "react-router-dom";
import { 
  FlaskConical, FileText, CheckCircle2, 
  ArrowRight, ShieldCheck, Clock 
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import StatCard from "../../components/StatCard.jsx";
import { useApp } from "../../hooks/useApp.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function LaboratoryDashboard() {
  const { batches, testRequests, certificates } = useApp();
  const { currentUser } = useAuth();

  const pendingRequests = testRequests.filter(
    (r) => r.status === "Pending Laboratory Acceptance"
  ).length;
  const testing = batches.filter((b) => b.stage === 4).length;
  const completed = batches.filter((b) => b.stage >= 5).length;

  return (
    <div className="space-y-4">
      {/* Laboratory Hero Header */}
      <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-bc-gold flex items-center gap-1.5">
            <FlaskConical size={14} /> Quality &amp; Testing Lab
          </span>
          <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-semibold">
            NABL Accredited
          </span>
        </div>

        <h2 className="font-display font-bold text-2xl mt-1 tracking-tight">
          Laboratory Operations
        </h2>
        <p className="text-xs text-white/80 mt-0.5">
          {currentUser?.org} · Verifier {currentUser?.actorId || "LAB-001"}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center">
          <div>
            <div className="font-display font-bold text-xl text-bc-gold">{pendingRequests}</div>
            <div className="text-[10.5px] text-white/70">Pending Samples</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-white">{testing}</div>
            <div className="text-[10.5px] text-white/70">In Testing</div>
          </div>
          <div>
            <div className="font-display font-bold text-xl text-bc-light-green">{certificates.length}</div>
            <div className="text-[10.5px] text-white/70">Certificates</div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-3 gap-2">
        <Link
          to="/app/laboratory/requests"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-bc-amber flex items-center justify-center mb-1.5">
            <Clock size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">Test Queue</span>
        </Link>

        <Link
          to="/app/laboratory/purity"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center mb-1.5">
            <FlaskConical size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">Purity Analysis</span>
        </Link>

        <Link
          to="/app/laboratory/certificates"
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-[#ECE6D6] shadow-xs active:scale-95 transition-transform"
        >
          <div className="w-10 h-10 rounded-xl bg-bc-light-green text-bc-forest flex items-center justify-center mb-1.5">
            <FileText size={18} />
          </div>
          <span className="text-xs font-bold text-bc-dark">Certificates</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Pending Queue"
          value={pendingRequests}
          sub="Samples Waiting"
          tone="warning"
          icon={Clock}
        />
        <StatCard
          label="Certificates Issued"
          value={certificates.length}
          sub="AGMARK / Off-chain"
          tone="success"
          icon={ShieldCheck}
        />
      </div>

      {/* Recent Test Requests */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-display font-bold text-base text-bc-deep-green">
            Recent Sample Requests
          </h3>
          <Link
            to="/app/laboratory/requests"
            className="text-xs font-bold text-bc-deep-green flex items-center gap-0.5 hover:underline"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {testRequests.length > 0 ? (
            testRequests.slice(0, 3).map((r) => (
              <div
                key={r.requestId}
                className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-display font-bold text-base text-bc-deep-green font-mono">
                      {r.batchId}
                    </div>
                    <div className="text-xs text-[#8A9086] mt-0.5">
                      Sample: {r.sampleQuantityMl} ml • Requested {r.requestedDate}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold bg-bc-light-honey text-bc-amber px-2.5 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {(r.tests || []).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] bg-[#F2EDE2] text-[#4B5548] px-2 py-0.5 rounded-md font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#F2EDE2] flex items-center justify-between">
                  <span className="text-xs text-[#8A9086]">{r.status}</span>
                  <Link
                    to={`/app/laboratory/purity?batchId=${r.batchId}`}
                    className="px-3 py-1 rounded-lg bg-bc-forest text-white font-bold text-xs active:scale-95 transition-transform"
                  >
                    Start Analysis
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#ECE6D6] p-6 text-center shadow-xs">
              <FlaskConical size={30} className="text-[#C9C2AC] mx-auto mb-2" />
              <div className="font-bold text-bc-dark text-sm">No Samples in Queue</div>
              <p className="text-xs text-[#8A9086] mt-1 max-w-xs mx-auto">
                When processors submit honey batches for purity testing, test requests will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
