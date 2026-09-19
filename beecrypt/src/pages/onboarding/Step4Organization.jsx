import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Building2, MapPin, Hash } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import ProgressIndicator from "../../components/onboarding/ProgressIndicator.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

// Role-specific field configurations
const ROLE_CONFIG = {
  beekeeper: {
    header: "Tell us about your apiary",
    subtitle: "Help us understand your beekeeping operation.",
    fields: [
      { key: "name",     label: "Farm / Apiary Name",  placeholder: "e.g. Honey Valley Apiary", icon: Building2, required: true },
      { key: "location", label: "Location",             placeholder: "e.g. Coimbatore, Tamil Nadu",  icon: MapPin,    required: false },
      { key: "hives",    label: "Number of Hives",      placeholder: "e.g. 24",                   icon: Hash,      required: false, type: "number" },
    ],
  },
  processor: {
    header: "Tell us about your facility",
    subtitle: "Share details about your processing operation.",
    fields: [
      { key: "name",         label: "Facility Name",  placeholder: "e.g. Pure Honey Processing",  icon: Building2, required: true },
      { key: "location",     label: "Location",       placeholder: "City, State",                  icon: MapPin,    required: false },
      { key: "businessType", label: "Business Type",  placeholder: "e.g. Co-operative, Private",   icon: Hash,      required: false },
    ],
  },
  retailer: {
    header: "Tell us about your store",
    subtitle: "Share details about your retail operation.",
    fields: [
      { key: "name",     label: "Store / Business Name", placeholder: "e.g. Nature's Pantry",  icon: Building2, required: true },
      { key: "location", label: "Store Location",        placeholder: "City, State",           icon: MapPin,    required: false },
    ],
  },
  verifier: {
    header: "Tell us about your organisation",
    subtitle: "Share details about your verification body.",
    fields: [
      { key: "name",     label: "Organisation Name",  placeholder: "e.g. KVIC Regional Lab",  icon: Building2, required: true },
      { key: "location", label: "Location",           placeholder: "City, State",              icon: MapPin,    required: false },
    ],
  },
};


const DEFAULT_CONFIG = {
  header: "Tell us about your organisation",
  subtitle: "Share a few details about your operation.",
  fields: [
    { key: "name",     label: "Organisation Name", placeholder: "Your organisation name", icon: Building2, required: true },
    { key: "location", label: "Location",           placeholder: "City, State",           icon: MapPin,    required: false },
  ],
};

export default function Step4Organization() {
  const navigate = useNavigate();
  const { data, setOrgField } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const config = ROLE_CONFIG[data.role] || DEFAULT_CONFIG;

  const validate = () => {
    const errs = {};
    config.fields.forEach(f => {
      if (f.required && !data.organization[f.key]?.trim()) {
        errs[f.key] = `${f.label} is required.`;
      }
    });
    return errs;
  };

  const handleContinue = () => {
    const errs = validate();
    const allTouched = {};
    config.fields.forEach(f => { allTouched[f.key] = true; });
    setTouched(allTouched);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      navigate("/onboarding/security");
    }
  };

  return (
    <OnboardingContainer>
      <div className="flex flex-col min-h-screen" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/onboarding/personal")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF7] border border-[#EBE5D3] text-[#243024] active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={3} totalSteps={5} />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-5">
          <h1 className="font-display font-black text-[#1F4D2E] leading-tight text-2xl">
            {config.header}
          </h1>
          <p className="text-sm text-[#657365] mt-1">{config.subtitle}</p>
        </div>

        {/* Role badge */}
        <div className="px-6 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF5EE] border border-[#D1EAD8] text-xs font-bold text-[#2F6B3F]">
            {data.role?.charAt(0).toUpperCase() + data.role?.slice(1) || "Selected role"}
          </span>
        </div>

        {/* Dynamic fields */}
        <div className="flex-1 px-6 space-y-4">
          {config.fields.map(f => (
            <AuthInput
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              icon={f.icon}
              type={f.type || "text"}
              required={f.required}
              value={data.organization[f.key] || ""}
              onChange={e => {
                setOrgField(f.key, e.target.value);
                setTouched(p => ({ ...p, [f.key]: true }));
              }}
              onBlur={() => setTouched(p => ({ ...p, [f.key]: true }))}
              error={touched[f.key] ? errors[f.key] : undefined}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pt-6">
          <PrimaryButton onClick={handleContinue} variant="honey">
            Continue
          </PrimaryButton>
        </div>
      </div>
    </OnboardingContainer>
  );
}
