import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import ProgressIndicator from "../../components/onboarding/ProgressIndicator.jsx";
import RoleCard from "../../components/onboarding/RoleCard.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

const ROLES = [
  { id: "beekeeper", icon: "🐝", title: "Beekeeper",   description: "Manage hives and record honey production." },
  { id: "processor", icon: "🏭", title: "Processor",   description: "Track processing and batch information." },
  { id: "retailer",  icon: "🏪", title: "Retailer",    description: "Verify and manage honey products." },
  { id: "verifier",  icon: "🔎", title: "Verifier",    description: "Verify provenance and product authenticity." },
];

export default function Step2Role() {
  const navigate = useNavigate();
  const { data, setField } = useOnboarding();
  const [error, setError] = useState("");

  const handleSelect = (roleId) => {
    setField("role", roleId);
    setError("");
  };

  const handleContinue = () => {
    if (!data.role) {
      setError("Please choose your primary role to continue.");
      return;
    }
    navigate("/onboarding/personal");
  };

  return (
    <OnboardingContainer>
      <div className="flex flex-col min-h-screen" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/onboarding")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF7] border border-[#EBE5D3] text-[#243024] active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={1} totalSteps={5} />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-4">
          <h1 className="font-display font-black text-[#1F4D2E] leading-tight text-2xl">
            How will you use BeeCrypt?
          </h1>
          <p className="text-sm text-[#657365] mt-1">
            Choose the role that best describes you.
          </p>
        </div>

        {/* Role cards — scrollable if needed */}
        <div className="flex-1 overflow-y-auto px-6 space-y-2.5 pb-4">
          {ROLES.map((role) => (
            <RoleCard
              key={role.id}
              {...role}
              selected={data.role === role.id}
              onSelect={handleSelect}
            />
          ))}

          {error && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#D9383A] pt-1 animate-in fade-in">
              <AlertCircle size={13} className="shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pt-3">
          <PrimaryButton onClick={handleContinue} variant="honey">
            Continue
          </PrimaryButton>
        </div>
      </div>
    </OnboardingContainer>
  );
}
