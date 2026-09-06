import React from "react";
import { Sparkles, ShieldCheck, Award } from "lucide-react";

/**
 * Editorial Honey & Apiary Hero Illustration.
 * Occupies 45-55% of the welcome screen with an original, sophisticated
 * composition of honeycomb geometry, glowing honey droplets, botanical leaves,
 * and a stylized golden bee emblem.
 */
export default function WelcomeHeroIllustration() {
  return (
    <div className="relative w-full max-w-[320px] aspect-[4/4.2] mx-auto flex items-center justify-center">
      {/* Ambient warm honey and natural green aura */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD166]/30 via-[#F4B942]/20 to-[#2F6B3F]/15 rounded-[36px] blur-2xl transform scale-95" />

      {/* Main Rounded Editorial Illustration Panel */}
      <div className="relative w-full h-full rounded-[32px] bg-gradient-to-b from-[#FFFDF7] via-[#FFF8E7] to-[#F5EFE0] border-2 border-[#EBE5D3] p-5 shadow-[0_16px_40px_rgba(217,149,24,0.14)] overflow-hidden flex flex-col items-center justify-between">
        {/* Background Honeycomb Geometry Grid */}
        <svg
          className="absolute inset-0 w-full h-full opacity-15 text-[#D99518]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="welcome-hex"
            width="40"
            height="69.28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 0 L40 11.55 L40 34.64 L20 46.19 L0 34.64 L0 11.55 Z M20 69.28 L40 57.73 L40 34.64 L20 46.19 L0 34.64 L0 57.73 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#welcome-hex)" />
        </svg>

        {/* Botanical Leaf & Honey Droplet Swirls */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Natural Botanical Stem */}
          <path
            d="M40 280 C 70 200, 110 120, 240 60"
            stroke="#2F6B3F"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.3"
          />
          {/* Leaf 1 */}
          <path
            d="M100 190 C 90 160, 130 160, 140 180 C 130 200, 105 200, 100 190 Z"
            fill="#2F6B3F"
            opacity="0.25"
          />
          {/* Leaf 2 */}
          <path
            d="M170 120 C 180 90, 220 100, 215 130 C 195 140, 175 130, 170 120 Z"
            fill="#2F6B3F"
            opacity="0.25"
          />
          {/* Flowing Golden Honey Arc */}
          <path
            d="M60 70 C 160 30, 220 180, 260 250"
            stroke="#F4B942"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="6 8"
            opacity="0.6"
          />
        </svg>

        {/* Top Floating Pill: Trust Metric */}
        <div className="relative z-10 self-start bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#EBE5D3] shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-[#1F4D2E]">
          <ShieldCheck size={13} className="text-[#2F6B3F]" />
          <span>Origin Verified</span>
        </div>

        {/* Central Core: Stylized Bee & Golden Honey Crest */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Concentric Hexagon Aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD166]/40 to-[#F4B942]/20 rounded-3xl rotate-12 animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-br from-[#2F6B3F]/15 to-[#D99518]/20 rounded-3xl -rotate-6" />

            {/* Inner Gold Hive Crest */}
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#D99518] via-[#F4B942] to-[#FFD166] p-1 shadow-lg shadow-[#D99518]/30 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#FFFDF7] flex flex-col items-center justify-center">
                <span className="text-3xl select-none filter drop-shadow-sm">🐝</span>
                <span className="text-[9px] font-black tracking-widest text-[#1F4D2E] uppercase -mt-0.5">
                  PURE
                </span>
              </div>
            </div>

            {/* Floating Golden Droplet 1 */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#FFD166] rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px]">
              ✨
            </div>

            {/* Floating Eco Leaf */}
            <div className="absolute -bottom-2 -left-1 w-6 h-6 bg-[#2F6B3F] text-white rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px]">
              🌿
            </div>
          </div>
        </div>

        {/* Bottom Editorial Badge: 100% Cryptographic Traceability */}
        <div className="relative z-10 w-full bg-[#1F4D2E] text-[#FFFDF7] px-3.5 py-2 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Award size={15} className="text-[#FFD166]" />
            <span className="text-[11px] font-bold tracking-tight">KVIC & Lab Certified</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#FFD166] bg-white/10 px-2 py-0.5 rounded-full">
            Batch Proof
          </span>
        </div>
      </div>
    </div>
  );
}
