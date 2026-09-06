import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, ChevronDown } from "lucide-react";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SocialButton from "../../components/auth/SocialButton.jsx";
import { submitRegistration } from "../../services/authService.js";

const ROLE_OPTIONS = [
  { id: "beekeeper", label: "Beekeeper", icon: "🐝", desc: "Hive & honey extraction" },
  { id: "processor", label: "Processor", icon: "🍯", desc: "Bottling & facility" },
  { id: "retailer",  label: "Retailer",  icon: "🏪", desc: "Market & store shelves" },
  { id: "verifier",  label: "Verifier",  icon: "🧪", desc: "Lab testing & KVIC" },
];

export default function Signup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("beekeeper");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address";
    if (!password || password.length < 8) newErrors.password = "Password must contain at least 8 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!consentAccepted) newErrors.consent = "You must agree to the processing of your personal data";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await submitRegistration({
        fullName,
        email,
        role,
        password,
      });

      localStorage.setItem("beecrypt_registered_role", role);
      setSuccessMessage("Account created successfully! Redirecting to verification...");
      setTimeout(() => {
        navigate(`/verify-otp?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}&flow=signup`);
      }, 1200);
    } catch (err) {
      setErrors({ form: err.message || "Unable to complete registration. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title="Create Account"
          subtitle="Join BeeCrypt and start building trusted honey records."
        >
          {successMessage ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-[#EBF5EE] text-[#2F6B3F] rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-[#2F6B3F]/20">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-lg font-bold text-[#1F4D2E]">{successMessage}</h3>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="p-3 bg-[#FDF2F2] border border-[#D9383A]/30 text-[#D9383A] text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              {/* Full Name */}
              <AuthInput
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
                icon={User}
                required
                error={errors.fullName}
                autoComplete="name"
              />

              {/* Email Address */}
              <AuthInput
                label="Email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                icon={Mail}
                required
                error={errors.email}
                autoComplete="email"
              />

              {/* Role Selection Dropdown */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-[#243024] flex items-center justify-between">
                  <span>Role in Honey Supply Chain</span>
                  <span className="text-[11px] text-[#657365]">Optional</span>
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 px-4 appearance-none rounded-2xl bg-[#FFFDF7] border border-[#EBE5D3] text-sm font-semibold text-[#243024] outline-none focus:border-[#F4B942] focus:ring-4 focus:ring-[#F4B942]/20 transition-all cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.icon} {opt.label} — {opt.desc}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F9D8F]">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>

              {/* Password */}
              <PasswordInput
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                required
                showStrength={true}
                error={errors.password}
                autoComplete="new-password"
              />

              {/* Confirm Password */}
              <PasswordInput
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                }}
                required
                error={errors.confirmPassword}
                autoComplete="new-password"
              />

              {/* Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 text-xs text-[#657365] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => {
                      setConsentAccepted(e.target.checked);
                      if (errors.consent) setErrors({ ...errors, consent: "" });
                    }}
                    className="mt-0.5 w-4 h-4 rounded-md text-[#2F6B3F] focus:ring-[#2F6B3F] border-[#EBE5D3] shrink-0 accent-[#2F6B3F]"
                  />
                  <span className="leading-snug">
                    I agree to the processing of my personal data according to the{" "}
                    <a href="#" className="font-bold text-[#2F6B3F] hover:underline">
                      BeeCrypt Privacy Notice
                    </a>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-xs font-semibold text-[#D9383A] mt-1 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errors.consent}</span>
                  </p>
                )}
              </div>

              {/* Primary CTA */}
              <PrimaryButton
                type="submit"
                loading={loading}
                className="mt-2"
                variant="honey"
              >
                Create Account
              </PrimaryButton>

              {/* Social Login Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="w-full border-t border-[#EBE5D3]" />
                <span className="absolute bg-[#FFFDF7] px-3 text-[11px] font-bold uppercase tracking-wider text-[#8F9D8F]">
                  or continue with
                </span>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <SocialButton provider="google">Google</SocialButton>
                <SocialButton provider="apple">Apple</SocialButton>
              </div>

              {/* Bottom Navigation */}
              <div className="pt-2 text-center text-xs text-[#657365]">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-[#1F4D2E] hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          )}
        </AuthCard>
      </main>
    </div>
  );
}
