import React, { useState } from "react";
import { Check, Eye } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import FilterBar from "../../components/FilterBar.jsx";
import Modal from "../../components/Modal.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { useApp } from "../../hooks/useApp.js";

const TABS = ["All", "Pending", "Approved", "Rejected"];

export default function UserVerification() {
  const { pendingApplications, approveApplication, rejectApplication } = useApp();
  const [tab, setTab] = useState("Pending");
  const [viewing, setViewing] = useState(null);
  const [rejecting, setRejecting] = useState(null);

  const list = pendingApplications.filter((a) => tab === "All" || a.status === tab);

  const confirmReject = (e) => {
    e.preventDefault();
    rejectApplication(rejecting.name, e.target.reason.value);
    setRejecting(null);
  };

  return (
    <div>
      <PageHeader title="User Verification" />
      <FilterBar options={TABS} active={tab} onChange={setTab} />
      <div className="flex flex-col gap-2.5">
        {list.length === 0 ? <EmptyState title="Nothing here" /> : list.map((a) => (
          <div key={a.name} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4.5 p-4">
            <div className="flex justify-between flex-wrap gap-2.5">
              <div>
                <div className="font-bold text-[15px]">{a.name}</div>
                <div className="text-xs text-[#8A9086] mt-0.5">{a.region} · Requested: {a.roles.join(", ")} · {a.docs} documents</div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full h-fit ${
                a.status === "Approved" ? "bg-bc-light-green text-bc-success" : a.status === "Rejected" ? "bg-red-100 text-bc-critical" : "bg-bc-light-honey text-bc-amber"
              }`}>{a.status}</span>
            </div>
            {a.status === "Pending" && (
              <div className="flex gap-2 mt-3.5 flex-wrap">
                <button onClick={() => setViewing(a)} className="flex items-center gap-1.5 text-sm font-bold border border-[#E5E0CE] rounded-xl px-3.5 py-2">
                  <Eye size={14} /> View Documents
                </button>
                <button onClick={() => approveApplication(a.name)} className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green rounded-xl px-3.5 py-2">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => setRejecting(a)} className="text-sm font-bold text-bc-critical bg-red-50 rounded-xl px-3.5 py-2">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {viewing && (
        <Modal title={`Documents — ${viewing.name}`} onClose={() => setViewing(null)}>
          <div className="text-xs font-bold text-[#8A9086] mb-2">REQUESTED ROLES</div>
          <div className="text-sm mb-3">{viewing.roles.join(", ")}</div>
          <div className="text-xs font-bold text-[#8A9086] mb-2">SUBMITTED DOCUMENTS</div>
          {Array.from({ length: viewing.docs }).map((_, i) => (
            <div key={i} className="text-sm text-bc-success font-semibold flex items-center gap-1.5 py-1"><Check size={14} /> Document {i + 1} (preview not shown to other users)</div>
          ))}
        </Modal>
      )}

      {rejecting && (
        <Modal title="Reject Application" onClose={() => setRejecting(null)}>
          <form onSubmit={confirmReject}>
            <label className="text-xs font-bold">Reason</label>
            <textarea name="reason" className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-4 text-sm min-h-[70px]" placeholder="Explain why this application is being rejected" />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setRejecting(null)} className="rounded-xl px-4 py-2 font-bold text-sm">Cancel</button>
              <button type="submit" className="rounded-xl px-4 py-2 font-bold text-sm text-white bg-bc-critical">Confirm Rejection</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
