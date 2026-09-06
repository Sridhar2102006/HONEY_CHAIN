import React from "react";
import { ArrowRight } from "lucide-react";

/**
 * Secondary CTA Button — Natural Green Outline or Warm White.
 */
export default function SecondaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  icon: Icon = ArrowRight,
  showIcon = true,
  fullWidth = true,
  className = "",
  variant = "outline", // "outline" | "ghost"
  ...props
}) {
  const isOutline = variant === "outline";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${
        fullWidth ? "w-full" : "w-auto"
      } h-13 min-h-[50px] px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isOutline
          ? "bg-[#FFFDF7] hover:bg-[#FFF8E7] text-[#2F6B3F] border-2 border-[#2F6B3F]/30 hover:border-[#2F6B3F] shadow-xs"
          : "bg-[#EBF5EE] hover:bg-[#D1EAD8] text-[#1F4D2E] border border-[#D1EAD8]"
      } ${className}`}
      {...props}
    >
      <span>{children}</span>
      {showIcon && Icon && <Icon size={18} className="shrink-0 text-[#2F6B3F]" />}
    </button>
  );
}
