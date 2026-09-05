import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useApp } from "../../hooks/useApp.js";
import { validatePurityAnalysis } from "../../utils/validators.js";

const inputCls = "w-full box-border px-3 py-2 rounded-lg border border-[#E5E0CE] mt-1 mb-3.5 text-sm outline-none focus:border-bc-forest";
const labelCls = "text-xs font-bold";

export default function PurityAnalysis() {
  const { batches, testRequests, saveAnalysis } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const pendingBatchIds = testRequests.map((r) => r.batchId);
  const [batchId, setBatchId] = useState(params.get("batchId") || pendingBatchIds[0]);
  const batch = batches.find((b) => b.batchId === batchId);

  const [values, setValues] = useState({ moisture: "17.2", sucrose: "38", fructose: "39", glucose: "34", adulteration: "Not Detected", testStatus: "PASS" });
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

  if (!batch) return <div className="text-sm text-[#8A9086]">No pending sample selected — open one from Test Requests.</div>;

  if (saved) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-7 max-w-md text-center">
        <Check size={28} className="text-bc-success mx-auto mb-2.5" />
        <div className="font-bold text-base">Analysis Completed</div>
        <div className="text-[13.5px] text-[#8A9086] mt-1.5">Recorded for {batchId}. Head to Certificates to issue the certificate.</div>
        <button onClick={() => navigate(`/app/laboratory/certificates?batchId=${batchId}`)} className="mt-4 w-full rounded-xl py-2.5 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">
          Go to Certificates
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Purity Analysis" />
      <form onSubmit={submit} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-md">
        <div className="font-bold font-display text-bc-deep-green mb-1">{batch.batchId}</div>
        <div className="text-xs text-[#8A9086] mb-4">Beekeeper {batch.producerName} · Sample from processor {batch.processorId}</div>
        <div className="grid grid-cols-2 gap-x-3.5">
          <div><label className={labelCls}>Moisture (%)</label><input className={inputCls} value={values.moisture} onChange={(e) => set("moisture", e.target.value)} /></div>
          <div><label className={labelCls}>Sucrose (%)</label><input className={inputCls} value={values.sucrose} onChange={(e) => set("sucrose", e.target.value)} /></div>
          <div><label className={labelCls}>Fructose (%)</label><input className={inputCls} value={values.fructose} onChange={(e) => set("fructose", e.target.value)} /></div>
          <div><label className={labelCls}>Glucose (%)</label><input className={inputCls} value={values.glucose} onChange={(e) => set("glucose", e.target.value)} /></div>
        </div>
        {errors.moisture && <div className="text-bc-critical text-xs -mt-2 mb-2">{errors.moisture}</div>}
        <label className={labelCls}>Adulteration</label>
        <input className={inputCls} value={values.adulteration} onChange={(e) => set("adulteration", e.target.value)} />
        <label className={labelCls}>Overall Result</label>
        <select className={inputCls} value={values.testStatus} onChange={(e) => set("testStatus", e.target.value)}>
          <option>PASS</option><option>FAIL</option>
        </select>
        {errors.testStatus && <div className="text-bc-critical text-xs -mt-2 mb-2">{errors.testStatus}</div>}
        <button type="submit" className="w-full rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">Save Analysis</button>
      </form>
    </div>
  );
}
