import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import CartoonHoneyBee from "../../components/auth/CartoonHoneyBee.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";

export default function Step1Welcome() {
  const navigate = useNavigate();
  const { reset } = useOnboarding();

  const handleStart = () => {
    reset(); // fresh session
    navigate("/onboarding/role");
  };

  return (
    <OnboardingContainer>
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-6 min-h-screen">

        {/* Top brand mark */}
        <div className="w-full flex items-center justify-center pt-2">
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-[#8F9D8F] select-none">
            BeeCrypt
          </span>
        </div>

        {/* Hero center */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs mx-auto gap-4">
          {/* Animated bee */}
          <CartoonHoneyBee
            className="w-full animate-bee-drift"
            style={{ maxWidth: 140, height: 140 }}
          />

          <div className="space-y-2">
            <h1 className="font-display font-black text-[#1F4D2E] leading-tight"
              style={{ fontSize: "clamp(1.6rem, 7vw, 2rem)" }}>
              Welcome to BeeCrypt 🐝
            </h1>
            <p className="text-[#2F6B3F] font-semibold text-sm leading-snug">
              Build a trusted journey<br />from hive to harvest.
            </p>
          </div>

          <p className="text-xs text-[#657365] font-normal leading-relaxed max-w-[220px]">
            Let's set up your BeeCrypt profile.<br />It only takes a minute.
          </p>
        </div>

        {/* Bottom actions */}
        <div className="w-full max-w-sm space-y-3 pb-6" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>
          <PrimaryButton onClick={handleStart} variant="honey">
            Get Started
          </PrimaryButton>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-xs text-[#657365] py-2 hover:text-[#1F4D2E] transition-colors"
          >
            Already have an account?{" "}
            <span className="font-bold text-[#1F4D2E]">Sign In</span>
          </button>
        </div>
      </div>
    </OnboardingContainer>
  );
}
