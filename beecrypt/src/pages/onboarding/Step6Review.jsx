import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Briefcase, Building2, Pencil, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import OnboardingContainer from "../../components/onboarding/OnboardingContainer.jsx";
import ProgressIndicator from "../../components/onboarding/ProgressIndicator.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { useOnboarding } from "../../context/OnboardingContext.jsx";
import { submitRegistration } from "../../services/authService.js";

function ReviewRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[#F0EBE0] last:border-0">
      <span className="text-[11px] font-semibold text-[#8F9D8F] uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm font-semibold text-[#243024] text-right">{value}</span>
    </div>
  );
}

function ReviewSection({ icon: Icon, title, children, onEdit, editStep }) {
  const navigate = useNavigate();
  return (
    <div className="bg-[#FFFDF7] rounded-2xl border border-[#EBE5D3] p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] flex items-center justify-center">
            <Icon size={14} className="text-[#2F6B3F]" />
          </div>
          <span className="text-sm font-bold text-[#1F4D2E]">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate(editStep)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#2F6B3F] py-1 px-2 rounded-lg hover:bg-[#EBF5EE] transition-colors active:scale-95"
        >
          <Pencil size={11} />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export default function Step6Review() {
  const navigate = useNavigate();
  const { data, reset } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const roleLabel = data.role ? data.role.charAt(0).toUpperCase() + data.role.slice(1) : "";

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      await submitRegistration({
        fullName: data.fullName,
        email:    data.email,
        phone:    data.phone,
        role:     data.role,
        organization: data.organization,
        password: data._password,
      });
      localStorage.setItem("beecrypt_registered_role", data.role || "beekeeper");
      setSuccess(true);
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}&role=${encodeURIComponent(data.role || "beekeeper")}&flow=signup`);
        reset();
      }, 1500);
    } catch (err) {
      setError(err.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <OnboardingContainer>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 min-h-screen text-center">
          <div className="w-20 h-20 bg-[#EBF5EE] rounded-3xl flex items-center justify-center shadow-lg shadow-[#2F6B3F]/20 animate-in zoom-in">
            <CheckCircle2 size={40} className="text-[#2F6B3F]" />
          </div>
          <div>
            <h2 className="font-display font-black text-[#1F4D2E] text-2xl">Account Created!</h2>
            <p className="text-sm text-[#657365] mt-1">
              Redirecting you to email verification...
            </p>
          </div>
        </div>
      </OnboardingContainer>
    );
  }

  return (
    <OnboardingContainer>
      <div className="flex flex-col min-h-screen" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))" }}>

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/onboarding/security")}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF7] border border-[#EBE5D3] text-[#243024] active:scale-95 transition-all shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <ProgressIndicator currentStep={5} totalSteps={5} />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pt-2 pb-5">
          <h1 className="font-display font-black text-[#1F4D2E] leading-tight text-2xl">
            Almost there! 🐝
          </h1>
          <p className="text-sm text-[#657365] mt-1">
            Review your details before we create your account.
          </p>
        </div>

        {/* Review sections */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
          <ReviewSection icon={User} title="Profile" editStep="/onboarding/personal">
            <ReviewRow label="Name"  value={data.fullName} />
            <ReviewRow label="Email" value={data.email} />
            <ReviewRow label="Phone" value={data.phone} />
          </ReviewSection>

          <ReviewSection icon={Briefcase} title="Role" editStep="/onboarding/role">
            <ReviewRow label="Role" value={roleLabel} />
          </ReviewSection>

          {Object.keys(data.organization || {}).length > 0 && (
            <ReviewSection icon={Building2} title="Organisation" editStep="/onboarding/organization">
              {Object.entries(data.organization).map(([k, v]) => (
                <ReviewRow key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
              ))}
            </ReviewSection>
          )}

          {error && (
            <div className="p-3 bg-[#FDF2F2] border border-[#D9383A]/30 text-[#D9383A] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-6 pt-3">
          <PrimaryButton onClick={handleCreate} loading={loading} variant="green">
            {loading ? "Creating Account..." : "Create My Account"}
          </PrimaryButton>
        </div>
      </div>
    </OnboardingContainer>
  );
}
