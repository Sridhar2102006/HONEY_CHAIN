import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  CheckCircle2, ArrowRight, ArrowLeft, Droplets, Hexagon, 
  Calendar, ShieldCheck, Plus, Minus, Sparkles 
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import ProvenanceStatus from "../../components/ProvenanceStatus.jsx";
import * as hiveService from "../../services/hiveService.js";
import { validateExtractionForm } from "../../utils/validators.js";

const HONEY_TYPES = ["Multifloral", "Forest Honey", "Acacia", "Wildflower", "Mustard Bloom"];

export default function HoneyExtraction() {
  const { currentActorId } = useAuth();
  const { recordExtraction, hives: allHives } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const hives = (allHives || []).filter((h) => h.producerId === currentActorId);

  const initialHiveId = params.get("hiveId") || hives[0]?.hiveId || "";

  // Step state
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    hiveId: initialHiveId,
    extractionDate: new Date().toISOString().slice(0, 10),
    quantity: "10.0",
    honeyType: "Multifloral",
    floralSource: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [savedBatch, setSavedBatch] = useState(null);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const stepLabels = ["Hive Source", "Honey Details", "Volume", "Review"];

  const handleQuantityAdjust = (delta) => {
    const current = parseFloat(values.quantity) || 0;
    const next = Math.max(0.5, +(current + delta).toFixed(1));
    set("quantity", String(next));
  };

  const handleNextStep = () => {
    const { valid, errors: errs } = validateExtractionForm(values);
    setErrors(errs);
    if (step === 1 && errs.hiveId) return;
    if (step === 2 && errs.honeyType) return;
    if (step === 3 && errs.quantity) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const { valid, errors: errs } = validateExtractionForm(values);
    setErrors(errs);
    if (!valid) return;

    setSubmitting(true);
    try {
      const batch = await recordExtraction(values);
      if (batch) {
        setSavedBatch(batch);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION STATE (Section 6)
  if (savedBatch) {
    return (
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-6 text-center shadow-lg animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-bc-light-green text-bc-success flex items-center justify-center mx-auto mb-3 shadow-inner">
          <CheckCircle2 size={36} strokeWidth={2.5} />
        </div>

        <span className="text-[11px] uppercase tracking-wider font-extrabold text-bc-amber bg-bc-light-honey px-3 py-1 rounded-full">
          Local Batch Recorded
        </span>

        <h3 className="font-display font-bold text-2xl text-bc-deep-green mt-3">
          Honey Extraction Logged!
        </h3>

        <p className="text-xs text-[#6B7267] mt-1">
          A local Batch ID has been generated and linked to Hive {savedBatch.hiveId}.
        </p>

        {/* Permanent Batch ID Display Card */}
        <div className="bg-[#F8F6EC] border border-[#ECE6D6] rounded-2xl p-4 my-4">
          <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
            Local Batch ID
          </div>
          <div className="font-display font-bold text-2xl text-bc-deep-green mt-1 font-mono">
            {savedBatch.batchId}
          </div>
          <div className="text-xs font-semibold text-bc-dark mt-1">
            {savedBatch.quantity} kg · {savedBatch.honeyType} Honey
          </div>
        </div>

        <ProvenanceStatus status="unavailable" />

        <div className="space-y-2.5">
          <button
            onClick={() => navigate(`/app/traceability?batchId=${savedBatch.batchId}`)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            View Traceability Journey
          </button>
          <button
            onClick={() => {
              setSavedBatch(null);
              setStep(1);
            }}
            className="w-full py-3 rounded-2xl bg-[#F3F1E8] text-bc-dark font-bold text-xs active:scale-95 transition-transform"
          >
            Record Another Harvest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Record Honey Harvest"
        sub="Creates a local batch record from an assigned hive source."
      />

      {/* Step Progress Indicators */}
      <div className="flex items-center justify-between px-1">
        {stepLabels.map((lbl, idx) => {
          const sNum = idx + 1;
          const isDone = step > sNum;
          const isCurrent = step === sNum;

          return (
            <div key={lbl} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-bc-success text-white"
                    : isCurrent
                    ? "bg-bc-deep-green text-white"
                    : "bg-[#E5E0CE] text-[#8A9086]"
                }`}
              >
                {isDone ? "✓" : sNum}
              </div>
              <span className={`text-[11px] hidden xs:inline ${isCurrent ? "font-bold text-bc-deep-green" : "text-[#8A9086]"}`}>
                {lbl}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Step Form Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs">
        {/* STEP 1: HIVE SOURCE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-display font-bold text-base text-bc-deep-green">
              Step 1: Select Hive Source
            </h4>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Source Hive
              </label>
              {hives.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="font-bold text-amber-900">No Hives Registered in Your Apiary</div>
                  <p className="text-amber-800">
                    You must register at least one hive before you can record a honey harvest.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/app/beekeeper")}
                    className="px-3.5 py-2 bg-bc-forest hover:bg-bc-deep-green text-white font-bold rounded-xl active:scale-95 transition-all text-xs"
                  >
                    + Register Hive First
                  </button>
                </div>
              ) : (
                <select
                  value={values.hiveId}
                  onChange={(e) => set("hiveId", e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-[#E5E0CE] text-sm bg-white font-medium outline-none focus:border-bc-deep-green"
                >
                  <option value="">Select a hive...</option>
                  {hives.map((h) => (
                    <option key={h.hiveId} value={h.hiveId}>
                      Hive {h.hiveId} — {h.block} ({h.status})
                    </option>
                  ))}
                </select>
              )}
              {errors.hiveId && (
                <p className="text-bc-critical text-xs mt-1">{errors.hiveId}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Extraction Date
              </label>
              <input
                type="date"
                value={values.extractionDate}
                onChange={(e) => set("extractionDate", e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E0CE] text-sm bg-white font-medium outline-none focus:border-bc-deep-green"
              />
              {errors.extractionDate && (
                <p className="text-bc-critical text-xs mt-1">{errors.extractionDate}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: HONEY DETAILS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-display font-bold text-base text-bc-deep-green">
              Step 2: Honey &amp; Floral Type
            </h4>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-2">
                Honey Variety
              </label>
              <div className="flex flex-wrap gap-2">
                {HONEY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("honeyType", t)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                      values.honeyType === t
                        ? "bg-bc-deep-green text-white shadow-xs"
                        : "bg-[#F3F1E8] text-[#4B5548] hover:bg-[#EAE5D4]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.honeyType && (
                <p className="text-bc-critical text-xs mt-1">{errors.honeyType}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Floral Source
              </label>
              <input
                value={values.floralSource}
                onChange={(e) => set("floralSource", e.target.value)}
                placeholder="e.g. Eucalyptus / Wildflower / Mustard"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E0CE] text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
          </div>
        )}

        {/* STEP 3: VOLUME */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-display font-bold text-base text-bc-deep-green">
              Step 3: Harvest Volume
            </h4>

            {/* Numeric Stepper Touch Target */}
            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Quantity Extracted (kg)
              </label>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => handleQuantityAdjust(-1)}
                  className="w-12 h-12 rounded-2xl bg-[#F3F1E8] text-bc-dark flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                >
                  <Minus size={18} />
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    step="0.5"
                    value={values.quantity}
                    onChange={(e) => set("quantity", e.target.value)}
                    className="w-full text-center font-display font-bold text-3xl text-bc-deep-green bg-transparent outline-none"
                  />
                  <span className="text-xs text-[#8A9086] uppercase font-bold">kg</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuantityAdjust(1)}
                  className="w-12 h-12 rounded-2xl bg-[#F3F1E8] text-bc-dark flex items-center justify-center font-bold text-lg active:scale-95 transition-transform"
                >
                  <Plus size={18} />
                </button>
              </div>
              {errors.quantity && (
                <p className="text-bc-critical text-xs mt-1 text-center">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-bc-dark block mb-1">
                Field Notes (Optional)
              </label>
              <input
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Good clarity, natural extraction"
                className="w-full px-3.5 py-3 rounded-xl border border-[#E5E0CE] text-sm outline-none focus:border-bc-deep-green"
              />
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h4 className="font-display font-bold text-base text-bc-deep-green">
              Step 4: Review Batch Details
            </h4>

            <div className="bg-[#FBF9F2] rounded-2xl p-4 text-xs space-y-2 border border-[#ECE6D6]">
              <div className="flex justify-between py-1 border-b border-[#EBE6D8]">
                <span className="text-[#8A9086]">Source Hive:</span>
                <span className="font-bold text-bc-dark">Hive {values.hiveId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBE6D8]">
                <span className="text-[#8A9086]">Extraction Date:</span>
                <span className="font-bold">{values.extractionDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBE6D8]">
                <span className="text-[#8A9086]">Honey Variety:</span>
                <span className="font-bold text-bc-forest">{values.honeyType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBE6D8]">
                <span className="text-[#8A9086]">Floral Source:</span>
                <span className="font-bold">{values.floralSource}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#8A9086]">Harvest Quantity:</span>
                <span className="font-display font-bold text-base text-bc-amber">
                  {values.quantity} kg
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles size={16} className="text-bc-amber shrink-0" />
              <span>Saving provenance events now. External verification will appear when the service is available.</span>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2.5 mt-6 pt-4 border-t border-[#F0EBE0]">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="py-3 px-4 rounded-2xl border border-[#E5E0CE] bg-white text-bc-dark font-bold text-xs active:scale-95 transition-transform"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-1 py-3.5 rounded-2xl bg-bc-deep-green text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <span>Continue</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-bc-gold to-bc-amber text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
            >
              <ShieldCheck size={16} />
              <span>Mint &amp; Create Batch</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
