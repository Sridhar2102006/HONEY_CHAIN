import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { MapPin, CheckCircle2, ArrowLeft, FlaskConical, ShieldCheck } from "lucide-react";
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
  const [sampleQuantity, setSampleQuantity] = useState("250");
  const [errors, setErrors] = useState({});

  const toggleTest = (t) =>
    setTests((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const submit = (e) => {
    e.preventDefault();
    const values = { batchId, labId: sendingLab.labId, sampleQuantity, tests };
    const { valid, errors: errs } = validateSampleRequest(values);
    setErrors(errs);
    if (!valid) return;

    sendSampleRequest({
      ...values,
      requestedDate: new Date().toISOString().slice(0, 10),
    });
    setSent(true);
  };

  // SUCCESS CONFIRMATION
  if (sent) {
    return (
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-bc-light-green text-bc-success flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h3 className="font-display font-bold text-2xl text-bc-deep-green">
          Sample Dispatched
        </h3>
        <p className="text-xs text-[#6B7267] mt-1 max-w-xs mx-auto">
          Sample request sent to <b>{sendingLab?.name}</b> for Batch <b>{batchId}</b>.
        </p>

        <div className="bg-[#F8F6EC] rounded-2xl p-4 my-4 text-xs space-y-1.5 text-left">
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Requested Tests:</span>
            <span className="font-bold text-bc-deep-green">{tests.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Sample Quantity:</span>
            <span className="font-bold">{sampleQuantity} ml</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Status:</span>
            <span className="font-bold text-bc-amber">Pending Lab Acceptance</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSent(false);
            setSendingLab(null);
          }}
          className="w-full py-3.5 rounded-2xl bg-bc-deep-green text-white font-bold text-xs active:scale-95 transition-transform"
        >
          Done
        </button>
      </div>
    );
  }

  // SEND SAMPLE TOUCH FORM
  if (sendingLab) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSendingLab(null)}
          className="text-bc-deep-green font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Laboratories
        </button>

        <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-display font-bold text-xl text-bc-deep-green">
              Dispatch Honey Sample
            </h3>
            <p className="text-xs text-[#8A9086] mt-0.5">
              To: <b className="text-bc-dark">{sendingLab.name}</b> ({sendingLab.location})
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">Select Batch</label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold bg-white outline-none"
              >
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} — {b.honeyType} ({b.quantity} L)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-2">
                Quality Tests to Request
              </label>
              <div className="flex flex-wrap gap-2">
                {TEST_OPTIONS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => toggleTest(t)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      tests.includes(t)
                        ? "bg-bc-deep-green text-white shadow-xs"
                        : "bg-[#F3F1E8] text-[#4B5548]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.tests && <p className="text-bc-critical text-xs mt-1">{errors.tests}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Sample Quantity (ml)
              </label>
              <input
                type="number"
                value={sampleQuantity}
                onChange={(e) => setSampleQuantity(e.target.value)}
                placeholder="250"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
            >
              <FlaskConical size={15} />
              <span>Submit Sample Dispatch</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DIRECTORY LIST
  return (
    <div className="space-y-3.5">
      <PageHeader
        title="Find Laboratories"
        sub="Accredited food testing laboratories for purity and moisture analysis."
      />

      <div className="space-y-3">
        {LABORATORIES.map((l) => (
          <div
            key={l.labId}
            className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-display font-bold text-base text-bc-deep-green">
                  {l.name}
                </h4>
                <div className="text-xs text-[#8A9086] flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {l.location} · {l.distance}
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  l.available
                    ? "bg-bc-light-green text-bc-success"
                    : "bg-gray-100 text-[#8A9086]"
                }`}
              >
                {l.available ? "Available" : "At Capacity"}
              </span>
            </div>

            {/* Services badges */}
            <div className="flex flex-wrap gap-1.5 py-1">
              {l.services.map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-[#F8F6EC] text-[#4B5548] px-2.5 py-0.5 rounded-full font-medium"
                >
                  ✓ {s}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#F2EDE2]">
              <span className="text-[11px] text-[#8A9086]">{l.accreditation}</span>
              <button
                disabled={!l.available}
                onClick={() => setSendingLab(l)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-bc-gold to-bc-amber text-white font-bold text-xs disabled:opacity-40 active:scale-95 transition-transform"
              >
                Send Sample
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
