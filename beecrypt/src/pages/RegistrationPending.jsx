import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Clock, ShieldCheck, Building2, ArrowRight } from "lucide-react";
import AuthBackground from "../components/auth/AuthBackground.jsx";
import AuthCard from "../components/auth/AuthCard.jsx";
import PrimaryButton from "../components/auth/PrimaryButton.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function RegistrationPending() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, login, switchWorkspace } = useAuth();

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Resolve target role from URL params, localStorage, or current session
  const rawRole = (
    searchParams.get("role") ||
    localStorage.getItem("beecrypt_registered_role") ||
    currentUser?.roles?.[0] ||
    "beekeeper"
  ).toLowerCase();

  let roleKey = "beekeeper";
  let roleName = "Beekeeper";
  let roleIcon = "🐝";
  let dashboardPath = "/app/beekeeper";

  if (rawRole.includes("proc")) {
    roleKey = "processor";
    roleName = "Processor";
    roleIcon = "🍯";
    dashboardPath = "/app/processor";
  } else if (rawRole.includes("lab") || rawRole.includes("verif")) {
    roleKey = "laboratory";
    roleName = "Verifier / Laboratory";
    roleIcon = "🧪";
    dashboardPath = "/app/laboratory";
  } else if (rawRole.includes("ret")) {
    roleKey = "retailer";
    roleName = "Retailer";
    roleIcon = "🏪";
    dashboardPath = "/app/retailer";
  } else if (rawRole.includes("kvic") || rawRole.includes("admin")) {
    roleKey = "kvic";
    roleName = "KVIC Admin";
    roleIcon = "🛡️";
    dashboardPath = "/app/kvic";
  } else {
    roleKey = "beekeeper";
    roleName = "Beekeeper";
    roleIcon = "🐝";
    dashboardPath = "/app/beekeeper";
  }

  const handleProceed = async () => {
    setLoading(true);
    try {
      const demoEmailMap = {
        beekeeper: "beekeeper@beecrypt.demo",
        processor: "processor@beecrypt.demo",
        laboratory: "lab@beecrypt.demo",
        retailer: "retailer@beecrypt.demo",
        kvic: "admin@beecrypt.demo",
      };

      if (!currentUser || !currentUser.roles?.includes(roleKey)) {
        const targetEmail = demoEmailMap[roleKey] || "beekeeper@beecrypt.demo";
        await login(targetEmail, "demo123");
      } else {
        switchWorkspace(roleKey);
      }
      navigate(dashboardPath);
    } catch (err) {
      console.warn("Direct navigation fallback:", err);
      navigate(dashboardPath);
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect countdown
  useEffect(() => {
    if (countdown <= 0) {
      handleProceed();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-[#FFF8E7] text-[#243024]">
      <AuthBackground variant="light" />

      <main className="flex-1 flex flex-col justify-end z-10 py-2 sm:py-6 px-0 sm:px-4">
        <AuthCard
          title="Registration Under Review"
          subtitle="Your organization details have been submitted to KVIC."
        >
          <div className="space-y-4 text-center py-2">
            {/* Pulsing Pending Badge */}
            <div className="w-16 h-16 rounded-3xl bg-[#FFF8E7] text-[#D99518] border border-[#F4B942]/60 flex items-center justify-center mx-auto shadow-lg shadow-[#D99518]/15">
              <Clock size={32} strokeWidth={2.5} className="animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-[#FFF3D6] text-[#D99518] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-[#F4B942]/40">
              <span>Status: KVIC Verification Pending</span>
            </div>

            <p className="text-xs text-[#657365] leading-relaxed max-w-xs mx-auto">
              Your apiary or facility credentials have been submitted for regulatory review. You can now explore your <b>{roleName}</b> workspace.
            </p>

            {/* SLA Info Card */}
            <div className="bg-[#FFFDF7] border border-[#EBE5D3] rounded-2xl p-3.5 text-xs text-left space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#657365]">Review Authority:</span>
                <span className="font-bold text-[#1F4D2E] flex items-center gap-1">
                  <Building2 size={13} className="text-[#2F6B3F]" /> KVIC Regional Board
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#657365]">Assigned Role:</span>
                <span className="font-bold text-[#2F6B3F] flex items-center gap-1">
                  <span>{roleIcon}</span> {roleName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#657365]">Trust Credential:</span>
                <span className="font-bold text-[#2F6B3F] flex items-center gap-1">
                  <ShieldCheck size={13} /> Auto-Generated DID
                </span>
              </div>
            </div>

            {/* Automatic redirection notice & primary button */}
            <div className="space-y-2 pt-1">
              <PrimaryButton onClick={handleProceed} loading={loading}>
                <span className="flex items-center justify-center gap-2">
                  <span>Enter {roleName} Dashboard</span>
                  <ArrowRight size={16} />
                </span>
              </PrimaryButton>

              <p className="text-[11px] text-[#8F9D8F]">
                Redirecting to your dashboard in <span className="font-bold text-[#1F4D2E]">{countdown}s</span>...
              </p>
            </div>

            <div className="pt-1">
              <Link
                to="/login"
                className="text-[11.5px] font-semibold text-[#8F9D8F] hover:text-[#1F4D2E] transition-colors"
              >
                Sign out or choose another account
              </Link>
            </div>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
