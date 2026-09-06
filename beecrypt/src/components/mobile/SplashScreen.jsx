import React, { useState, useEffect } from "react";
import { Hexagon, Sparkles } from "lucide-react";

/**
 * Mobile App Splash Screen Animation.
 * Features a honeybee flying in the middle of the screen with flapping wings,
 * dashed golden flight path, honeycomb background, and smooth exit transition into the app.
 */
export default function SplashScreen({ onFinish }) {
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Progress bar animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 25;
      });
    }, 450);

    // Fade out timer (~2.3s)
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 2200);

    // Complete / unmount timer (~2.8s)
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2700);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center bg-gradient-to-b from-[#14532D] via-[#104324] to-[#0A2816] text-white p-6 transition-opacity duration-500 select-none cursor-pointer ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Honeycomb Ambient Circles */}
      <div className="absolute inset-0 pointer-events-none bc-honeycomb-bg opacity-20" />
      <div className="absolute top-1/4 -left-12 w-48 h-48 rounded-full bg-bc-gold/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-12 w-56 h-56 rounded-full bg-bc-green/10 blur-3xl pointer-events-none" />

      {/* Top Space / Safe area */}
      <div className="pt-safe w-full flex justify-end">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
          Tap to skip
        </span>
      </div>

      {/* Center Flying Honeybee Animation */}
      <div className="relative flex flex-col items-center justify-center -mt-6">
        {/* Honeybee SVG Container with Hover Bobbing Animation */}
        <div className="relative w-48 h-40 flex items-center justify-center animate-bee-hover">
          <svg
            viewBox="0 0 160 120"
            className="w-40 h-32 drop-shadow-[0_12px_24px_rgba(245,158,11,0.35)] overflow-visible"
          >
            {/* Dashed Golden Flight Path Loop Behind Bee */}
            <path
              d="M 15,85 C 20,40 50,20 70,55 C 80,75 55,90 40,75 C 25,60 55,30 95,50"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-trail opacity-75"
            />

            {/* Little Sparkle / Pollen Dots along flight path */}
            <circle cx="25" cy="55" r="2" fill="#FEF3C7" className="animate-ping opacity-60" />
            <circle cx="65" cy="45" r="1.5" fill="#F59E0B" />
            <circle cx="45" cy="80" r="2" fill="#FEF3C7" />

            {/* Honeybee Body Group (Centered around 100, 55) */}
            <g transform="translate(90, 48)">
              {/* Left Wing (flapping) */}
              <ellipse
                cx="-6"
                cy="-18"
                rx="11"
                ry="17"
                fill="url(#wingGradient)"
                stroke="#E2E8F0"
                strokeWidth="1.2"
                className="animate-wing-left"
                style={{ opacity: 0.9 }}
              />
              <line
                x1="-6"
                y1="-2"
                x2="-6"
                y2="-30"
                stroke="#CBD5E1"
                strokeWidth="1"
                className="animate-wing-left"
              />

              {/* Right Wing (flapping) */}
              <ellipse
                cx="10"
                cy="-20"
                rx="12"
                ry="18"
                fill="url(#wingGradient)"
                stroke="#E2E8F0"
                strokeWidth="1.2"
                className="animate-wing-right"
                style={{ opacity: 0.9 }}
              />
              <line
                x1="10"
                y1="-3"
                x2="10"
                y2="-32"
                stroke="#CBD5E1"
                strokeWidth="1"
                className="animate-wing-right"
              />

              {/* Stinger */}
              <polygon points="-26,-1 -33,2 -26,5" fill="#17201A" />

              {/* Bee Abdomen & Thorax (Striped oval) */}
              <ellipse cx="0" cy="2" rx="26" ry="18" fill="#F59E0B" />
              
              {/* Dark Stripes */}
              <path
                d="M -12,-13 Q -9,2 -12,17 L -6,18 Q -3,2 -6,-14 Z"
                fill="#17201A"
              />
              <path
                d="M 2,-14 Q 5,2 2,18 L 8,17 Q 11,2 8,-13 Z"
                fill="#17201A"
              />

              {/* Bee Head */}
              <circle cx="22" cy="1" r="13" fill="#17201A" />

              {/* Cute Eyes */}
              <circle cx="24" cy="-2" r="3.5" fill="#FFFFFF" />
              <circle cx="25" cy="-2" r="2" fill="#000000" />
              <circle cx="26" cy="-3" r="0.8" fill="#FFFFFF" />

              {/* Cute Rosy Cheek */}
              <ellipse cx="22" cy="6" rx="2.5" ry="1.5" fill="#F87171" opacity="0.8" />

              {/* Antennae */}
              <path
                d="M 26,-10 Q 30,-18 36,-17"
                fill="none"
                stroke="#17201A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="36" cy="-17" r="2" fill="#F59E0B" />

              <path
                d="M 22,-11 Q 23,-20 28,-21"
                fill="none"
                stroke="#17201A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="28" cy="-21" r="1.8" fill="#F59E0B" />
            </g>

            {/* Gradient definition for translucent wings */}
            <defs>
              <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Typography */}
        <div className="text-center mt-3 space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Hexagon size={24} fill="#F59E0B" className="text-bc-gold" />
            <h1 className="font-display font-bold text-3xl text-white tracking-tight">
              BeeCrypt
            </h1>
          </div>
          <p className="text-xs uppercase tracking-widest text-bc-gold font-bold">
            From Hive to Trust
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="pb-safe w-full max-w-xs text-center space-y-2.5">
        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-bc-gold to-amber-300 rounded-full transition-all duration-300"
          />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/70 font-medium">
          <Sparkles size={12} className="text-bc-gold" />
          <span>Synchronizing smart hive network...</span>
        </div>
      </div>
    </div>
  );
}
