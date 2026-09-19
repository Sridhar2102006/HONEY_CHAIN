import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SocialButton from "../../components/auth/SocialButton.jsx";

const DEMO_ACCOUNTS = [
  { role: "Beekeeper", icon: "🐝", email: "beekeeper@beecrypt.demo", desc: "Apiary & Hives" },
  { role: "Processor", icon: "🍯", email: "processor@beecrypt.demo", desc: "Batch & Bottling" },
  { role: "Verifier / Lab", icon: "🧪", email: "lab@beecrypt.demo", desc: "Purity & Tests" },
  { role: "Retailer", icon: "🏪", email: "retailer@beecrypt.demo", desc: "Store & Shelves" },
  { role: "KVIC Admin", icon: "🛡️", email: "admin@beecrypt.demo", desc: "Regulatory" },
  { role: "Multi-Role", icon: "🌟", email: "multi@beecrypt.demo", desc: "All Workspaces" },
];

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [activeDemoEmail, setActiveDemoEmail] = useState(null);

  const handleDemoSignIn = async (demoEmail) => {
    setActiveDemoEmail(demoEmail);
    setEmail(demoEmail);
    setPassword("demo123");
    setError("");
    setLoading(true);
    try {
      await login(demoEmail, "demo123");
      navigate("/app");
    } catch (err) {
      setError(err.message || "Failed to sign in to account.");
    } finally {
      setLoading(false);
      setActiveDemoEmail(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Invalid email or password. Please check your credentials or select a role workspace below.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/app");
    } catch (err) {
      setError(err.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title="Welcome Back"
          subtitle="Continue managing your trusted honey journey."
        >
          {/* Quick Demo Role Selector */}
          <div className="mb-4 bg-[#FFF8E7] border border-[#F4B942]/40 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F4D2E] uppercase tracking-wider mb-2">
              <Sparkles size={13} className="text-[#D99518]" />
              <span>Instant 1-Click Role Access</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = activeDemoEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoSignIn(acc.email)}
                    disabled={loading || googleLoading}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl bg-white border text-center transition-all active:scale-95 ${
                      isSelected
                        ? "border-[#2F6B3F] ring-2 ring-[#2F6B3F]/30 bg-[#EBF5EE]"
                        : "border-[#EBE5D3] hover:border-[#D99518] hover:bg-[#FFFDF7]"
                    }`}
                  >
                    <span className="text-base select-none">{acc.icon}</span>
                    <span className="text-[11px] font-bold text-[#1F4D2E] leading-tight mt-0.5">
                      {acc.role}
                    </span>
                    <span className="text-[9px] text-[#8F9D8F] leading-tight mt-0.5 hidden sm:inline">
                      {acc.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-[#FDF2F2] border border-[#D9383A]/30 text-[#D9383A] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <AuthInput
              label="Email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              icon={Mail}
              required
              autoComplete="email"
            />

            {/* Password Field */}
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              required
              autoComplete="current-password"
            />

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 font-semibold text-[#657365] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#2F6B3F] focus:ring-[#2F6B3F] border-[#EBE5D3] accent-[#2F6B3F]"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-bold text-[#1F4D2E] hover:text-[#2F6B3F] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Primary CTA */}
            <PrimaryButton
              type="submit"
              loading={loading && !activeDemoEmail}
              className="mt-2"
              variant="honey"
            >
              Sign In
            </PrimaryButton>

            {/* Social Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="w-full border-t border-[#EBE5D3]" />
              <span className="absolute bg-[#FFFDF7] px-3 text-[11px] font-bold uppercase tracking-wider text-[#8F9D8F]">
                or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <SocialButton
                provider="google"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
              >
                {googleLoading ? "Signing in…" : "Google"}
              </SocialButton>
              <SocialButton provider="apple">Apple</SocialButton>
            </div>

            {/* Bottom Signup Navigation */}
            <div className="pt-2 text-center text-xs text-[#657365]">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-[#1F4D2E] hover:underline">
                Create Account
              </Link>
            </div>
          </form>
        </AuthCard>
      </main>
    </div>
  );
}
