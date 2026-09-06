import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import AuthCard from "../../components/auth/AuthCard.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { resetPassword } from "../../services/authService.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get("email") || "beekeeper@beecrypt.demo";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await resetPassword(emailParam, password);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title={isSuccess ? "Password Updated!" : "Create New Password"}
          subtitle={
            isSuccess
              ? "Your account credentials have been updated securely."
              : "Choose a strong password with letters, numbers, and symbols."
          }
        >
          {isSuccess ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-20 h-20 bg-[#EBF5EE] text-[#2F6B3F] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#2F6B3F]/30">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-[#1F4D2E]">
                  Ready to Sign In
                </h3>
                <p className="text-xs text-[#657365]">
                  You can now log in using your newly configured password.
                </p>
              </div>

              <PrimaryButton onClick={() => navigate("/login")} variant="honey">
                Sign In to BeeCrypt
              </PrimaryButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-[#FDF2F2] border border-[#D9383A]/30 text-[#D9383A] text-xs font-semibold rounded-2xl flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Context */}
              <div className="p-2.5 bg-[#FFF8E7] border border-[#F4B942]/50 rounded-2xl flex items-center gap-2 text-xs text-[#243024]">
                <KeyRound size={15} className="text-[#D99518] shrink-0" />
                <span className="truncate">Resetting password for: <b className="text-[#1F4D2E]">{emailParam}</b></span>
              </div>

              {/* New Password */}
              <PasswordInput
                label="New Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                required
                showStrength={true}
                autoComplete="new-password"
              />

              {/* Confirm New Password */}
              <PasswordInput
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError("");
                }}
                required
                autoComplete="new-password"
              />

              {/* Submit Button */}
              <PrimaryButton
                type="submit"
                loading={loading}
                className="mt-2"
                variant="honey"
              >
                Update Password
              </PrimaryButton>

              <div className="pt-2 text-center text-xs text-[#657365]">
                Remember your old password?{" "}
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
