import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, FlaskConical, ShieldCheck, FileText } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";
import ProvenanceStatus from "../../components/ProvenanceStatus.jsx";
import { validatePurityAnalysis } from "../../utils/validators.js";

export default function PurityAnalysis() {
  const { batches, testRequests, saveAnalysis } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const pendingBatchIds = testRequests.map((r) => r.batchId);
  const [batchId, setBatchId] = useState(params.get("batchId") || pendingBatchIds[0] || batches[0]?.batchId);
  const batch = batches.find((b) => b.batchId === batchId);

  const [values, setValues] = useState({
    moisture: "",
    sucrose: "",
    fructose: "",
    glucose: "",
    adulteration: "Not Detected",
    testStatus: "PASS",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validatePurityAnalysis(values);
    setErrors(errs);
    if (!valid) return;

    saveAnalysis({ batchId, ...values });
    setSaved(true);
  };

  if (!batch) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-[#8A9086]">No honey sample selected for analysis.</p>
        <Link to="/app/laboratory/requests" className="text-bc-deep-green font-bold text-xs mt-2 inline-block">
          ← View Sample Test Queue
        </Link>
      </div>
    );
  }

  // SUCCESS CONFIRMATION
  if (saved) {
    return (
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-bc-light-green text-bc-success flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>
        <h3 className="font-display font-bold text-2xl text-bc-deep-green">
          Analysis Verified &amp; Saved
        </h3>
        <p className="text-xs text-[#6B7267] mt-1 max-w-xs mx-auto">
          Laboratory purity results recorded for Batch <b>{batchId}</b>. External provenance verification is temporarily unavailable.
        </p>
        <ProvenanceStatus status="unavailable" />

        <div className="bg-[#F8F6EC] rounded-2xl p-4 my-4 text-xs space-y-1.5 text-left">
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Overall Status:</span>
            <span className="font-bold text-bc-success">✓ PASS</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Moisture Content:</span>
            <span className="font-bold">{values.moisture}% (Standard &lt; 20%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A9086]">Adulteration:</span>
            <span className="font-bold text-bc-success">{values.adulteration}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigate(`/app/laboratory/certificates?batchId=${batchId}`)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <FileText size={16} />
            <span>Proceed to Issue Certificate</span>
          </button>
          <button
            onClick={() => setSaved(false)}
            className="w-full py-3 rounded-2xl bg-[#F3F1E8] text-bc-dark font-bold text-xs active:scale-95 transition-transform"
          >
            Edit Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          to="/app/laboratory/requests"
          className="text-bc-deep-green font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Queue
        </Link>
        <span className="text-xs font-mono font-bold text-bc-deep-green bg-bc-light-honey px-2.5 py-0.5 rounded-full">
          {batch.batchId}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs space-y-4">
        <div>
          <h3 className="font-display font-bold text-xl text-bc-deep-green">
            Purity &amp; Quality Analysis
          </h3>
          <p className="text-xs text-[#8A9086] mt-0.5">
            Beekeeper: <b className="text-bc-dark">{batch.producerName}</b> · Facility: <b className="text-bc-dark">{batch.processorId || "Coimbatore Facility"}</b>
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {/* Chemical Parameters Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Moisture (%) <span className="text-[10px] text-[#8A9086] font-normal">&lt; 20%</span>
              </label>
              <input
                value={values.moisture}
                onChange={(e) => set("moisture", e.target.value)}
                placeholder="e.g. 17.2"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-sm font-bold text-bc-deep-green outline-none"
              />
              {errors.moisture && <p className="text-bc-critical text-[11px] mt-0.5">{errors.moisture}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Sucrose (%) <span className="text-[10px] text-[#8A9086] font-normal">&lt; 5%</span>
              </label>
              <input
                value={values.sucrose}
                onChange={(e) => set("sucrose", e.target.value)}
                placeholder="e.g. 3.8"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-sm font-bold text-bc-deep-green outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Fructose (%) <span className="text-[10px] text-[#8A9086] font-normal">&gt; 35%</span>
              </label>
              <input
                value={values.fructose}
                onChange={(e) => set("fructose", e.target.value)}
                placeholder="e.g. 38.5"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-sm font-bold text-bc-deep-green outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Glucose (%) <span className="text-[10px] text-[#8A9086] font-normal">&gt; 30%</span>
              </label>
              <input
                value={values.glucose}
                onChange={(e) => set("glucose", e.target.value)}
                placeholder="e.g. 34.2"
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-sm font-bold text-bc-deep-green outline-none"
              />
            </div>
          </div>

          {/* Adulteration detection */}
          <div>
            <label className="text-xs font-bold text-bc-dark block mb-1.5">
              C3/C4 Sugar Adulteration (SMR/TMR)
            </label>
            <div className="flex gap-2">
              {["Not Detected", "Traces Detected", "Detected (Failed)"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("adulteration", opt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    values.adulteration === opt
                      ? opt.includes("Not")
                        ? "bg-bc-light-green text-bc-success border border-emerald-300"
                        : "bg-red-100 text-bc-critical border border-red-300"
                      : "bg-[#F3F1E8] text-[#4B5548]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Overall Pass/Fail Result */}
          <div>
            <label className="text-xs font-bold text-bc-dark block mb-1.5">
              Accreditation Compliance Result
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => set("testStatus", "PASS")}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  values.testStatus === "PASS"
                    ? "bg-bc-success text-white shadow-sm"
                    : "bg-[#F3F1E8] text-[#8A9086]"
                }`}
              >
                ✓ PASS (Grade A Honey)
              </button>
              <button
                type="button"
                onClick={() => set("testStatus", "FAIL")}
                className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  values.testStatus === "FAIL"
                    ? "bg-bc-critical text-white shadow-sm"
                    : "bg-[#F3F1E8] text-[#8A9086]"
                }`}
              >
                ✕ FAIL (Non-Compliant)
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5"
          >
            <FlaskConical size={16} />
            <span>Save &amp; Sign Analysis</span>
          </button>
        </form>
      </div>
    </div>
  );
}
