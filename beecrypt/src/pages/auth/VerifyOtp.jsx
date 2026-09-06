import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import VerificationInput from "../../components/auth/VerificationInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { verifyOtp, resendOtp } from "../../services/authService.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const emailParam = searchParams.get("email") || "";
  const flowParam  = searchParams.get("flow")  || "signin"; // "signup" | "signin"

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setError("Please enter all 6 digits of the verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await verifyOtp(emailParam, otp);
      setIsSuccess(true);

      setTimeout(async () => {
        if (flowParam === "signup") {
          // New registration — account is pending KVIC approval, not yet active
          const roleParam = searchParams.get("role") || localStorage.getItem("beecrypt_registered_role") || "beekeeper";
          navigate(`/registration-pending?role=${encodeURIComponent(roleParam)}&email=${encodeURIComponent(emailParam)}`);
        } else {
          // Existing user sign-in OTP step — attempt login and go to app
          try {
            await login(emailParam, "demo123");
          } catch (_) {}
          navigate("/app");
        }
      }, 1500);
    } catch (err) {
      setError(err.message || "Invalid code. Tip: enter any 6 digits (e.g. 123456).");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(45);
    setResendStatus("New code sent to your email!");
    setError("");

    try {
      await resendOtp(emailParam);
      setTimeout(() => setResendStatus(""), 4000);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title={isSuccess ? "Verified Successfully!" : "Enter Verification Code"}
          subtitle={
            isSuccess
              ? "Your identity has been verified on the BeeCrypt ledger."
              : `We sent a 6-digit verification code to`
          }
        >
          {isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 bg-[#2F6B3F]/20 rounded-full animate-ping" />
                <div className="relative w-full h-full bg-[#EBF5EE] text-[#2F6B3F] rounded-full flex items-center justify-center shadow-xl shadow-[#2F6B3F]/30">
                  <CheckCircle2 size={40} />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#1F4D2E]">
                  {flowParam === "signup" ? "Email Verified!" : "Authentication Confirmed"}
                </h3>
                <p className="text-xs text-[#657365]">
                  {flowParam === "signup"
                    ? "Your account is under KVIC review. We'll notify you when it's approved."
                    : "Redirecting to your trusted workspace..."}
                </p>
              </div>

              <PrimaryButton
                onClick={() => flowParam === "signup" ? navigate("/registration-pending") : navigate("/app")}
                variant="honey"
              >
                {flowParam === "signup" ? "View Application Status" : "Go to Dashboard"}
              </PrimaryButton>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Highlighted Email Target */}
              <div className="bg-[#FFF8E7] border border-[#F4B942]/60 rounded-2xl p-3 text-center">
                <span className="text-xs font-bold text-[#1F4D2E] break-all">
                  {emailParam}
                </span>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div className="py-2">
                <VerificationInput
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    if (error) setError("");
                  }}
                  error={error}
                />
              </div>

              {/* Timer & Resend Button */}
              <div className="text-center space-y-1">
                {resendStatus && (
                  <p className="text-xs font-bold text-[#2F6B3F] animate-in fade-in">
                    {resendStatus}
                  </p>
                )}

                <div className="flex items-center justify-center gap-1.5 text-xs text-[#657365]">
                  <span>Didn't receive the code?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-bold text-[#1F4D2E] hover:underline flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> Resend Code
                    </button>
                  ) : (
                    <span className="font-semibold text-[#8F9D8F]">
                      Resend in <span className="text-[#D99518] font-bold">{timer}s</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Action */}
              <PrimaryButton
                type="submit"
                loading={loading}
                className="mt-2"
                variant="honey"
              >
                Verify & Continue
              </PrimaryButton>

              {/* Demo Hint */}
              <div className="p-3 bg-[#FFFDF7] border border-[#EBE5D3] rounded-2xl flex items-center gap-2 text-[11px] text-[#657365]">
                <Sparkles size={14} className="text-[#D99518] shrink-0" />
                <span>Demo Tip: Any 6 digits (e.g. 123456) will verify successfully.</span>
              </div>
            </form>
          )}
        </AuthCard>
      </main>
    </div>
  );
}
