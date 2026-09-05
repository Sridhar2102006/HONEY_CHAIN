import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Check } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";
import { LABORATORIES } from "../../data/mockData.js";
import { validateSampleRequest } from "../../utils/validators.js";

const TEST_OPTIONS = ["Purity", "Moisture", "Sugar Profile", "Adulteration"];

export default function FindLaboratories() {
  const { batches, sendSampleRequest } = useApp();
  const [params] = useSearchParams();
  const [sendingLab, setSendingLab] = useState(null);
  const [sent, setSent] = useState(false);
  const [batchId, setBatchId] = useState(params.get("batchId") || batches[0]?.batchId);
  const [tests, setTests] = useState(["Purity", "Moisture"]);
  const [errors, setErrors] = useState({});

  const toggleTest = (t) => setTests((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const submit = (e) => {
    e.preventDefault();
    const form = e.target;
    const values = { batchId, labId: sendingLab.labId, sampleQuantity: form.sampleQuantity.value, tests };
    const { valid, errors: errs } = validateSampleRequest(values);
    setErrors(errs);
    if (!valid) return;
    sendSampleRequest({ ...values, requestedDate: new Date().toISOString().slice(0, 10) });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-7 max-w-md text-center">
        <Check size={28} className="text-bc-success mx-auto mb-2.5" />
        <div className="font-bold text-base">Sample Request Submitted</div>
        <div className="text-[13.5px] text-[#8A9086] mt-1.5">Status: Pending Laboratory Acceptance</div>
      </div>
    );
  }

  if (sendingLab) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-md">
        <div className="font-bold text-base mb-3.5">Send Honey Sample</div>
        <form onSubmit={submit}>
          <label className="text-xs font-bold">Batch</label>
          <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-3.5 text-sm">
            {batches.map((b) => <option key={b.batchId} value={b.batchId}>{b.batchId}</option>)}
          </select>
          <label className="text-xs font-bold">Laboratory</label>
          <input readOnly value={sendingLab.name} className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-3.5 text-sm bg-[#F8F6EC]" />
          <label className="text-xs font-bold">Tests</label>
          <div className="flex gap-2 flex-wrap mt-1.5 mb-1">
            {TEST_OPTIONS.map((t) => (
              <button type="button" key={t} onClick={() => toggleTest(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold ${tests.includes(t) ? "bg-bc-light-honey text-bc-amber" : "bg-[#F3F1E8] text-bc-dark"}`}>
                {t}
              </button>
            ))}
          </div>
          {errors.tests && <div className="text-bc-critical text-xs mb-2">{errors.tests}</div>}
          <label className="text-xs font-bold">Sample Quantity (ml)</label>
          <input name="sampleQuantity" defaultValue="250" className="w-full px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-4 text-sm" />
          <div className="flex gap-2.5">
            <button type="button" onClick={() => setSendingLab(null)} className="flex-1 rounded-xl py-2.5 font-bold border border-[#E5E0CE]">Back</button>
            <button type="submit" className="flex-1 rounded-xl py-2.5 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">Submit Request</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Find Nearby Laboratories" />
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {LABORATORIES.map((l) => (
          <div key={l.labId} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4.5 p-4">
            <div className="font-bold text-[14.5px]">{l.name}</div>
            <div className="text-xs text-[#8A9086] flex items-center gap-1 my-2"><MapPin size={12} /> {l.distance} · {l.location}</div>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {l.services.map((s) => <span key={s} className="text-[11px] bg-[#F3F1E8] px-2 py-0.5 rounded-full font-semibold">✓ {s}</span>)}
            </div>
            <div className="text-[11px] text-[#8A9086] mb-2.5">{l.accreditation}</div>
            <div className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${l.available ? "bg-bc-light-green text-bc-success" : "bg-gray-100 text-[#8A9086]"}`}>
              {l.available ? "Available" : "Unavailable"}
            </div>
            <button
              disabled={!l.available}
              onClick={() => setSendingLab(l)}
              className="w-full rounded-xl py-2.5 font-bold text-sm text-white bg-gradient-to-br from-bc-gold to-bc-amber disabled:opacity-50"
            >
              Send Sample
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
