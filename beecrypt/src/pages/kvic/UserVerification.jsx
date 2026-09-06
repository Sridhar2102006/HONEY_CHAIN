import React, { useState } from "react";
import { Check, Eye, X, ShieldCheck, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

const TABS = ["Pending", "Approved", "Rejected", "All"];

export default function UserVerification() {
  const { pendingApplications, approveApplication, rejectApplication } = useApp();
  const [tab, setTab] = useState("Pending");
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const list = pendingApplications.filter((a) => tab === "All" || a.status === tab);

  const confirmReject = (e) => {
    e.preventDefault();
    rejectApplication(rejecting.name, rejectReason);
    setRejecting(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-3.5">
      <PageHeader
        title="User Verification Queue"
        sub="Review and approve beekeeper, processor, and laboratory registration credentials."
      />

      <FilterBar options={TABS} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {list.length === 0 ? (
          <EmptyState
            title="No applications in this view"
            subtitle="Switch tabs to see approved or pending registrations."
          />
        ) : (
          list.map((a) => (
            <div
              key={a.name}
              className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-display font-bold text-base text-bc-deep-green">
                    {a.name}
                  </h4>
                  <div className="text-xs text-[#8A9086] mt-0.5">
                    {a.region} · {a.email}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    a.status === "Approved"
                      ? "bg-bc-light-green text-bc-success"
                      : a.status === "Rejected"
                      ? "bg-red-100 text-bc-critical"
                      : "bg-bc-light-honey text-bc-amber"
                  }`}
                >
                  {a.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-2 bg-[#FBF9F2] rounded-xl px-3 text-xs">
                <div>
                  <span className="text-[10.5px] text-[#8A9086] block">Requested Roles</span>
                  <span className="font-semibold text-bc-dark">{a.roles.join(", ")}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#8A9086] block">Uploaded Documents</span>
                  <span className="font-semibold text-bc-forest">{a.docs} Verified Docs</span>
                </div>
              </div>

              {/* Actions for Pending Applications */}
              {a.status === "Pending" && (
                <div className="flex gap-2 pt-1 border-t border-[#F2EDE2]">
                  <button
                    onClick={() => setViewing(a)}
                    className="flex-1 py-2 rounded-xl border border-[#E5E0CE] text-bc-dark font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Eye size={13} />
                    <span>View Docs</span>
                  </button>

                  <button
                    onClick={() => approveApplication(a.name)}
                    className="flex-1 py-2 rounded-xl bg-bc-deep-green text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-xs"
                  >
                    <Check size={13} />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => setRejecting(a)}
                    className="px-3 py-2 rounded-xl bg-red-50 text-bc-critical font-bold text-xs active:scale-95 transition-transform"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Document View Modal / Bottom Sheet */}
      {viewing && (
        <Modal
          title={`Verification Credentials — ${viewing.name}`}
          onClose={() => setViewing(null)}
        >
          <div className="space-y-3 text-xs">
            <div className="bg-[#F8F6EC] p-3 rounded-xl space-y-1">
              <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
                Application Profile
              </div>
              <div>Applicant: <b>{viewing.name}</b> ({viewing.email})</div>
              <div>Region: <b>{viewing.region}</b></div>
              <div>Roles: <b>{viewing.roles.join(", ")}</b></div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-2">
                Off-Chain Submitted Documents ({viewing.docs})
              </div>
              <div className="space-y-1.5">
                {Array.from({ length: viewing.docs }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white border border-[#ECE6D6] rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-bc-forest" />
                      <span className="font-semibold text-bc-dark">
                        {i === 0 ? "Government ID (Aadhaar/PAN)" : "Apiary License Certificate"}
                      </span>
                    </div>
                    <span className="text-[10.5px] font-bold text-bc-success">✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                approveApplication(viewing.name);
                setViewing(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <Check size={15} />
              <span>Approve &amp; Assign Actor ID</span>
            </button>
          </div>
        </Modal>
      )}

      {/* Reject Application Modal */}
      {rejecting && (
        <Modal
          title={`Reject Application — ${rejecting.name}`}
          onClose={() => setRejecting(null)}
        >
          <form onSubmit={confirmReject} className="space-y-3 text-xs">
            <p className="text-[#8A9086]">
              Please provide the official rejection rationale for regulatory audit records:
            </p>
            <div>
              <label className="font-bold text-bc-dark block mb-1">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Incomplete government document or address mismatch..."
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0CE] text-xs min-h-[70px] outline-none focus:border-bc-critical"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#E5E0CE] font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-bc-critical text-white font-bold shadow-xs active:scale-95 transition-transform"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
