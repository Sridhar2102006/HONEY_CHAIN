import React from "react";
import { Hexagon, Sparkles } from "lucide-react";
import { THEME } from "../../theme/authTheme.js";

export default function BeeCryptLogo({
  size = "md", // "sm" | "md" | "lg"
  showTagline = false,
  inverted = false,
  className = "",
}) {
  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Brand Hexagon Bee Emblem */}
      <div
        className={`relative flex items-center justify-center rounded-2xl shadow-sm transition-transform active:scale-95 ${
          isLg ? "w-12 h-12" : isSm ? "w-8 h-8" : "w-10 h-10"
        } bg-gradient-to-tr from-[#D99518] via-[#F4B942] to-[#FFD166] p-0.5 shadow-[#D99518]/25`}
      >
        <div
          className={`w-full h-full rounded-[14px] flex items-center justify-center ${
            inverted ? "bg-[#1F4D2E]" : "bg-[#FFFDF7]"
          }`}
        >
          <span className={isLg ? "text-xl" : isSm ? "text-sm" : "text-base"} role="img" aria-label="Bee">
            🐝
          </span>
        </div>
      </div>

      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-display font-black tracking-tight leading-none ${
              isLg ? "text-2xl" : isSm ? "text-base" : "text-xl"
            } ${inverted ? "text-[#FFFDF7]" : "text-[#1F4D2E]"}`}
          >
            BeeCrypt
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F4B942]" />
        </div>

        {showTagline && (
          <span
            className={`font-medium tracking-tight mt-0.5 ${
              isLg ? "text-xs" : "text-[10px]"
            } ${inverted ? "text-[#EBF5EE]" : "text-[#657365]"}`}
          >
            From Hive to Harvest, Trusted.
          </span>
        )}
      </div>
    </div>
  );
}
