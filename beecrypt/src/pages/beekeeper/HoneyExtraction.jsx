import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import * as hiveService from "../../services/hiveService.js";
import { validateExtractionForm } from "../../utils/validators.js";

const inputCls = "w-full box-border px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E0CE] mt-1.5 mb-4 text-[14.5px] outline-none focus:border-bc-forest";
const labelCls = "text-[12.5px] font-bold";

export default function HoneyExtraction() {
  const { currentActorId } = useAuth();
  const { recordExtraction } = useApp();
  const navigate = useNavigate();
  const hives = hiveService.listHives(currentActorId);

  const [values, setValues] = useState({
    hiveId: hives[0]?.hiveId || "", extractionDate: "2026-09-05", quantity: "18.5",
    honeyType: "Multifloral", floralSource: "", notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(null);
  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateExtractionForm(values);
    setErrors(errs);
    if (!valid) return;
    const batch = recordExtraction(values);
    setSaved(batch);
  };

  if (saved) {
    return (
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-8 max-w-md text-center">
        <Check size={30} className="text-bc-success mx-auto mb-3" />
        <div className="font-bold text-base">Extraction Recorded</div>
        <div className="text-[13.5px] text-[#8A9086] mt-1.5">Permanent Batch ID</div>
        <div className="font-display text-xl text-bc-deep-green my-1">{saved.batchId}</div>
        <div className="text-[13.5px] text-[#8A9086]">Quantity: {saved.quantity} L</div>
        <div className="text-[11px] text-[#B08900] bg-bc-light-honey rounded-lg px-2.5 py-1.5 mt-3 inline-block">
          HARVESTED + EXTRACTED events recorded — hash/signature pending backend.
        </div>
        <button onClick={() => navigate(`/app/traceability?batchId=${saved.batchId}`)} className="block w-full mt-5 rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green">
          View Traceability
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Honey Extraction" sub="Record a new extraction — this creates a permanent Batch ID." />
      <form onSubmit={submit} className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-md">
        <label className={labelCls}>Hive</label>
        <select className={inputCls} value={values.hiveId} onChange={(e) => set("hiveId", e.target.value)}>
          {hives.map((h) => <option key={h.hiveId} value={h.hiveId}>{h.hiveId}</option>)}
        </select>
        {errors.hiveId && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.hiveId}</div>}

        <label className={labelCls}>Extraction Date</label>
        <input type="date" className={inputCls} value={values.extractionDate} onChange={(e) => set("extractionDate", e.target.value)} />
        {errors.extractionDate && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.extractionDate}</div>}

        <label className={labelCls}>Quantity (L)</label>
        <input className={inputCls} value={values.quantity} onChange={(e) => set("quantity", e.target.value)} />
        {errors.quantity && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.quantity}</div>}

        <label className={labelCls}>Honey Type</label>
        <input className={inputCls} value={values.honeyType} onChange={(e) => set("honeyType", e.target.value)} />
        {errors.honeyType && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.honeyType}</div>}

        <label className={labelCls}>Floral Source</label>
        <input className={inputCls} value={values.floralSource} onChange={(e) => set("floralSource", e.target.value)} placeholder="e.g. Eucalyptus / Wildflower" />

        <label className={labelCls}>Notes</label>
        <input className={inputCls} value={values.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Optional" />

        <button type="submit" className="w-full rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-gold to-bc-amber shadow-lg">
          Save Extraction
        </button>
      </form>
    </div>
  );
}
