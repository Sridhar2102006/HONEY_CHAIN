import React from "react";

/**
 * CartoonHoneyBee — Centered cartoon bee with:
 *  • Smooth gentle drift animation (bee-drift)
 *  • Fast wing-flutter (wing-left / wing-right)
 *  • Sparse golden honey particle dots around it
 *  • Soft warm aura glow beneath the bee
 *
 * No honeycomb canvas here — honeycomb lives in the full-screen background.
 */
export default function CartoonHoneyBee({ className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>

      {/* ── Ambient warm aura glow ── */}
      <div
        className="absolute w-40 h-40 rounded-full animate-aura"
        style={{ background: "radial-gradient(circle, #FFD16666 0%, #F4B94200 70%)" }}
      />

      {/* ── Honey Particle Dots ── sparse, slow, GPU-only ── */}
      {/* Particle 1 — top-right */}
      <div
        className="absolute animate-particle-1"
        style={{ top: "8%", right: "18%", width: 8, height: 8,
          borderRadius: "50%", background: "#D99518", filter: "blur(0.5px)" }}
      />
      {/* Particle 2 — mid-left */}
      <div
        className="absolute animate-particle-2"
        style={{ top: "42%", left: "12%", width: 6, height: 6,
          borderRadius: "50%", background: "#FFD166", filter: "blur(0.5px)" }}
      />
      {/* Particle 3 — lower-right */}
      <div
        className="absolute animate-particle-3"
        style={{ bottom: "14%", right: "22%", width: 5, height: 5,
          borderRadius: "50%", background: "#F4B942", filter: "blur(0.5px)" }}
      />
      {/* Particle 4 — top-left tiny */}
      <div
        className="absolute animate-particle-2"
        style={{ top: "20%", left: "22%", width: 4, height: 4,
          borderRadius: "50%", background: "#D99518", opacity: 0.5 }}
      />

      {/* ── Bee SVG — drift + wing flutter ── */}
      <div className="relative animate-bee-drift" style={{ width: 130, height: 130 }}>
        <svg
          viewBox="0 0 130 130"
          width="130"
          height="130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Wing glass gradient */}
            <linearGradient id="wl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="wr" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.7" />
            </linearGradient>

            {/* Honey body gradient */}
            <linearGradient id="bb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#FFD166" />
              <stop offset="55%"  stopColor="#F4B942" />
              <stop offset="100%" stopColor="#D99518" />
            </linearGradient>

            {/* Subtle drop shadow filter */}
            <filter id="bee-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1F4D2E" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* ── Left wing — fast flutter ── */}
          <g className="animate-wing-left" style={{ transformOrigin: "55px 44px" }}>
            <ellipse cx="40" cy="30" rx="17" ry="26"
              transform="rotate(-30 40 30)"
              fill="url(#wl)" stroke="#BAE6FD" strokeWidth="1.2" />
            <path d="M 38 18 C 41 26, 44 34, 42 40"
              stroke="#93C5FD" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75" />
          </g>

          {/* ── Right wing — fast flutter ── */}
          <g className="animate-wing-right" style={{ transformOrigin: "75px 44px" }}>
            <ellipse cx="88" cy="28" rx="16" ry="24"
              transform="rotate(26 88 28)"
              fill="url(#wr)" stroke="#BAE6FD" strokeWidth="1.2" />
            <path d="M 84 18 C 86 26, 88 32, 86 38"
              stroke="#93C5FD" strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.75" />
          </g>

          {/* ── Stinger ── */}
          <path d="M 43 88 L 35 90 L 43 93 Z" fill="#243024" />

          {/* ── Body ── */}
          <ellipse cx="65" cy="72" rx="28" ry="22" fill="url(#bb)" filter="url(#bee-shadow)" />

          {/* ── Black stripes ── */}
          <path d="M 50 54 Q 53 72, 50 90" stroke="#1C1C1C" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 65 50 Q 68 72, 65 94" stroke="#1C1C1C" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M 80 54 Q 82 72, 80 90" stroke="#1C1C1C" strokeWidth="5.5" strokeLinecap="round" fill="none" />

          {/* ── Antennae ── */}
          <path d="M 72 52 Q 80 36, 92 38" stroke="#243024" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="93" cy="37" r="3" fill="#D99518" />
          <path d="M 80 55 Q 90 40, 100 44" stroke="#243024" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="101" cy="44" r="3" fill="#D99518" />

          {/* ── Cute large cartoon eye ── */}
          <circle cx="87" cy="64" r="8" fill="#1C1C1C" />
          <circle cx="90" cy="61" r="3.5" fill="#FFFFFF" />
          <circle cx="86" cy="67" r="1.5" fill="#FFFFFF" />

          {/* ── Blush ── */}
          <ellipse cx="84" cy="74" rx="4.5" ry="2.5" fill="#FF8A8A" opacity="0.55" />

          {/* ── Smile ── */}
          <path d="M 90 70 Q 93 76, 87 77" stroke="#243024" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* ── Tiny legs ── */}
          <path d="M 52 91 Q 50 97, 47 100" stroke="#243024" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 64 93 Q 64 100, 62 103" stroke="#243024" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 76 90 Q 79 97, 81 100" stroke="#243024" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}
