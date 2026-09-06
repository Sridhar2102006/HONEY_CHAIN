import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, CheckCircle2, AlertCircle, Sparkles, KeyRound } from "lucide-react";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { requestPasswordReset } from "../../services/authService.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid registered email address.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setIsSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title={isSent ? "Check Your Inbox" : "Forgot Password"}
          subtitle={
            isSent
              ? `We sent password reset instructions to ${email}`
              : "Enter your registered email to reset your BeeCrypt password."
          }
        >
          {isSent ? (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 bg-[#EBF5EE] text-[#2F6B3F] rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-[#2F6B3F]/20">
                <CheckCircle2 size={34} />
              </div>

              <div className="bg-[#FFFDF7] border border-[#EBE5D3] rounded-2xl p-4 text-left space-y-1.5">
                <div className="text-xs font-bold text-[#1F4D2E] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#D99518]" />
                  <span>Next Steps</span>
                </div>
                <p className="text-xs text-[#657365] leading-relaxed">
                  Open the email we just sent and click the reset link or continue below to set your new security password.
                </p>
              </div>

              <div className="space-y-2.5">
                <PrimaryButton
                  onClick={() =>
                    navigate(`/reset-password?email=${encodeURIComponent(email)}`)
                  }
                  variant="honey"
                >
                  Set New Password
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-xs font-bold text-[#1F4D2E] hover:underline block mx-auto py-1"
                >
                  Try another email
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-[#657365]">
                Remember your password?{" "}
                <Link to="/login" className="font-bold text-[#1F4D2E] hover:underline">
                  Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#FDF2F2] border border-[#D9383A]/30 text-[#D9383A] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <AuthInput
                label="Email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                icon={Mail}
                required
                autoComplete="email"
              />

              <PrimaryButton
                type="submit"
                loading={loading}
                className="mt-2"
                variant="honey"
              >
                Send Reset Link
              </PrimaryButton>

              <div className="pt-3 text-center text-xs text-[#657365]">
                Remember your password?{" "}
                <Link to="/login" className="font-bold text-[#1F4D2E] hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </AuthCard>
      </main>
    </div>
  );
}
