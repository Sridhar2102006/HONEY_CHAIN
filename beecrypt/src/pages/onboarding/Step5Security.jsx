import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Check, X } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import ProgressIndicator from "../../components/onboarding/ProgressIndicator.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

function getRequirements(pw) {
  return [
    { label: "8 or more characters",   met: pw.length >= 8 },
    { label: "One uppercase letter",   met: /[A-Z]/.test(pw) },
    { label: "One number",             met: /[0-9]/.test(pw) },
  ];
}

export default function Step5Security() {
  const navigate = useNavigate();
  const { data, setField } = useOnboarding();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [errors, setErrors] = useState({});

  const requirements = getRequirements(password);
  const allMet = requirements.every(r => r.met);

  const handleContinue = () => {
    const errs = {};
    if (!password) errs.password = "Password is required.";
    else if (!allMet) errs.password = "Password does not meet all requirements.";
    if (!confirmPw) errs.confirmPw = "Please confirm your password.";
    else if (password !== confirmPw) errs.confirmPw = "Passwords do not match.";

    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Store password in context (memory only, not sessionStorage — see context)
      setField("_password", password);
      navigate("/onboarding/review");
    }
  };

  return (
    <OnboardingContainer>
      <div className="flex flex-col min-h-screen" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/onboarding/organization")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF7] border border-[#EBE5D3] text-[#243024] active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={4} totalSteps={5} />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-5">
          <h1 className="font-display font-black text-[#1F4D2E] leading-tight text-2xl">
            Secure your account
          </h1>
          <p className="text-sm text-[#657365] mt-1">
            Create a strong password to protect your BeeCrypt profile.
          </p>
        </div>

        {/* Fields */}
        <div className="flex-1 px-6 space-y-4">
          <PasswordInput
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
            showStrength
            required
            error={errors.password}
            autoComplete="new-password"
          />

          {/* Requirements checklist */}
          {password.length > 0 && (
            <div className="space-y-1.5 px-1 animate-in fade-in">
              {requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${r.met ? "bg-[#2F6B3F]" : "bg-[#EBE5D3]"}`}>
                    {r.met
                      ? <Check size={10} className="text-white" strokeWidth={3} />
                      : <X size={10} className="text-[#9EA89E]" strokeWidth={2.5} />
                    }
                  </div>
                  <span className={`text-xs font-medium ${r.met ? "text-[#2F6B3F]" : "text-[#9EA89E]"}`}>
                    {r.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPw}
            onChange={e => { setConfirmPw(e.target.value); setErrors(p => ({ ...p, confirmPw: "" })); }}
            required
            error={errors.confirmPw}
            autoComplete="new-password"
          />

          {/* Privacy consent */}
          <p className="text-[11px] text-[#9EA89E] leading-snug pt-1">
            By creating an account, you agree to the{" "}
            <span className="font-bold text-[#2F6B3F]">BeeCrypt Privacy Notice</span>{" "}
            and the processing of your personal data.
          </p>
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
