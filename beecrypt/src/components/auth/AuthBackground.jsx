import React from "react";

/**
 * AuthBackground — Full-screen honeycomb environment.
 *
 * Layers:
 *  1. Warm cream gradient base
 *  2. Full-screen honeycomb SVG grid (symmetrical, low opacity)
 *  3. Three independently-animated golden hex glow patches
 *  4. Soft ambient light blobs (top-right, bottom-left)
 */
export default function AuthBackground({ variant = "light" }) {
  const isDark = variant === "dark";

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none"
      style={{
        background: isDark
          ? "linear-gradient(175deg, #153720 0%, #1F4D2E 55%, #2F6B3F 100%)"
          : "linear-gradient(170deg, #FFF8E7 0%, #FFFDF7 45%, #F5EFE0 100%)",
      }}
    >
      {/* ── Layer 1: Warm ambient light blobs ── */}
      <div
        className="absolute -top-28 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #FFD16640 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #F4B94230 0%, transparent 70%)" }}
      />

      {/* ── Layer 2: Full-screen honeycomb grid (static, very subtle) ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: isDark ? 0.09 : 0.12 }}
      >
        <defs>
          <pattern
            id="bg-honeycomb"
            width="52"
            height="90.07"
            patternUnits="userSpaceOnUse"
          >
            {/* Each hex: two rows offset by half a width */}
            <path
              d="M26 0 L52 15.01 L52 45.03 L26 60.04 L0 45.03 L0 15.01 Z"
              fill="none"
              stroke="#C8960C"
              strokeWidth="1.1"
            />
            <path
              d="M26 90.07 L52 75.06 L52 45.03 L26 60.04 L0 45.03 L0 75.06 Z"
              fill="none"
              stroke="#C8960C"
              strokeWidth="1.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-honeycomb)" />
      </svg>

      {/* ── Layer 3a: Glow patch — upper area (staggered timing) ── */}
      <svg
        className="absolute animate-hex-glow-1"
        style={{ top: "8%", left: "50%", transform: "translateX(-50%)", width: 180, height: 160 }}
        viewBox="0 0 180 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="90" cy="80" rx="80" ry="60"
          fill="#FFD166" style={{ filter: "blur(28px)" }} />
      </svg>

      {/* ── Layer 3b: Glow patch — lower-left ── */}
      <svg
        className="absolute animate-hex-glow-2"
        style={{ bottom: "22%", left: "5%", width: 130, height: 120 }}
        viewBox="0 0 130 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="65" cy="60" rx="55" ry="45"
          fill="#F4B942" style={{ filter: "blur(24px)" }} />
      </svg>

      {/* ── Layer 3c: Glow patch — upper-right ── */}
      <svg
        className="absolute animate-hex-glow-3"
        style={{ top: "20%", right: "4%", width: 110, height: 100 }}
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="55" cy="50" rx="48" ry="38"
          fill="#D99518" style={{ filter: "blur(20px)" }} />
      </svg>
    </div>
  );
}
