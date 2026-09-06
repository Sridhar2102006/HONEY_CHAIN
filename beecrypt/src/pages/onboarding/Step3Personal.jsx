import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Mail, Phone } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import ProgressIndicator from "../../components/onboarding/ProgressIndicator.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

function validate(data) {
  const errs = {};
  if (!data.fullName.trim()) errs.fullName = "Full name is required.";
  if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email))
    errs.email = "Enter a valid email address.";
  if (data.phone && !/^[+\d\s\-()]{7,}$/.test(data.phone))
    errs.phone = "Enter a valid phone number.";
  return errs;
}

export default function Step3Personal() {
  const navigate = useNavigate();
  const { data, setField } = useOnboarding();
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleContinue = () => {
    const errs = validate(data);
    setTouched({ fullName: true, email: true, phone: true });
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      navigate("/onboarding/organization");
    }
  };

  const getError = (f) => (touched[f] ? errors[f] : undefined);

  return (
    <OnboardingContainer>
      <div className="flex flex-col min-h-screen" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/onboarding/role")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF7] border border-[#EBE5D3] text-[#243024] active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={2} totalSteps={5} />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-5">
          <h1 className="font-display font-black text-[#1F4D2E] leading-tight text-2xl">
            Tell us about yourself
          </h1>
          <p className="text-sm text-[#657365] mt-1">
            This helps us personalise your BeeCrypt experience.
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 space-y-4">
          <AuthInput
            label="Full Name"
            placeholder="Your full name"
            icon={User}
            required
            value={data.fullName}
            onChange={e => { setField("fullName", e.target.value); setTouched(p => ({ ...p, fullName: true })); }}
            onBlur={() => handleBlur("fullName")}
            error={getError("fullName")}
            autoComplete="name"
          />
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            icon={Mail}
            required
            value={data.email}
            onChange={e => { setField("email", e.target.value); setTouched(p => ({ ...p, email: true })); }}
            onBlur={() => handleBlur("email")}
            error={getError("email")}
            autoComplete="email"
          />
          <AuthInput
            label="Phone Number"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            icon={Phone}
            value={data.phone || ""}
            onChange={e => { setField("phone", e.target.value); setTouched(p => ({ ...p, phone: true })); }}
            onBlur={() => handleBlur("phone")}
            error={getError("phone")}
            autoComplete="tel"
          />
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
