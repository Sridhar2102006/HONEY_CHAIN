import React from "react";
import { useNavigate } from "react-router-dom";
import AuthBackground from "../../components/auth/AuthBackground.jsx";
import CartoonHoneyBee from "../../components/auth/CartoonHoneyBee.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SecondaryButton from "../../components/auth/SecondaryButton.jsx";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen max-h-screen flex flex-col overflow-hidden bg-[#FFF8E7] text-[#243024]">

      {/* ── LAYER 0-3: animated honeycomb + glow background ── */}
      <AuthBackground variant="light" />

      {/* ── LAYER 4-7: hero + content — fills remaining height ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-[max(8px,env(safe-area-inset-top))] pb-0 text-center overflow-hidden">

        {/* ── BEECRYPT Wordmark ── */}
        <div className="flex flex-col items-center mb-0.5">
          <span className="text-xs mb-0.5 opacity-50 select-none" aria-hidden="true">🍯</span>

          <h2
            className="font-display font-black tracking-[0.12em] uppercase leading-none select-none"
            style={{
              fontSize: "clamp(1.6rem, 6.5vw, 2rem)",
              background: "linear-gradient(135deg, #1F4D2E 30%, #2F6B3F 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            BeeCrypt
          </h2>

          {/* Thin golden rule */}
          <div
            className="mt-1 rounded-full"
            style={{ width: 40, height: 2, background: "linear-gradient(90deg, #FFD166, #D99518, #FFD166)" }}
          />
        </div>

        {/* ── Flying Cartoon Honey Bee ── smaller size to fit ── */}
        <CartoonHoneyBee
          className="w-full"
          style={{ maxWidth: 135, height: 135 }}
        />

        {/* ── Hero headline + sub-copy ── */}
        <div className="space-y-0.5 max-w-[260px] mx-auto">
          <h1
            className="font-display font-black text-[#1F4D2E] tracking-tight leading-[1.15]"
            style={{ fontSize: "clamp(1.2rem, 5vw, 1.5rem)" }}
          >
            From Hive to<br />Harvest, Trusted.
          </h1>

          <p className="text-[11px] text-[#657365] font-normal leading-snug">
            Track, verify and protect the journey of every honey batch.
          </p>
        </div>
      </main>

      {/* ── LAYER 8: Auth action card ── */}
      <footer
        className="relative z-10 flex-shrink-0 bg-[#FFFDF7] rounded-t-[28px] px-6 pt-2.5 pb-[max(16px,env(safe-area-inset-bottom,16px))] shadow-[0_-8px_32px_rgba(31,77,46,0.07)] border-t border-[#EBE5D3] space-y-2"
      >
        {/* Drag-handle pill */}
        <div className="w-8 h-1 bg-[#DDD5C0] rounded-full mx-auto" />

        <div className="space-y-2 max-w-md mx-auto">
          <PrimaryButton onClick={() => navigate("/login")} variant="honey" className="w-full">
            Sign In
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate("/onboarding")} variant="outline" className="w-full">
            Create Account
          </SecondaryButton>
        </div>

        <div className="text-center">
          <p className="text-[10.5px] text-[#9EA89E] font-medium">
            BeeCrypt Decentralized Honey Traceability
          </p>
        </div>
      </footer>
    </div>
  );
}
