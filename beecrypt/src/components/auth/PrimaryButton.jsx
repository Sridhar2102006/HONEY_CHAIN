import React from "react";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * Primary CTA Button — Honey Gold / Deep Honey.
 * Features:
 * - Gradient from #F4B942 to #D99518 with amber glow shadow
 * - High-contrast readable typography
 * - Min-height 50px touch target
 * - Active scaling and disabled/loading states
 */
export default function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  icon: Icon = ArrowRight,
  showIcon = true,
  fullWidth = true,
  className = "",
  variant = "honey", // "honey" | "green"
  ...props
}) {
  const isGreen = variant === "green";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${
        fullWidth ? "w-full" : "w-auto"
      } h-13 min-h-[50px] px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
        isGreen
          ? "bg-gradient-to-r from-[#2F6B3F] to-[#1F4D2E] hover:from-[#1F4D2E] hover:to-[#153720] text-white shadow-md shadow-[#1F4D2E]/25"
          : "bg-gradient-to-r from-[#F4B942] via-[#E8A524] to-[#D99518] hover:from-[#E8A524] hover:to-[#C68412] text-[#1F4D2E] shadow-md shadow-[#D99518]/30 font-black"
      } ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className={`animate-spin ${isGreen ? "text-white" : "text-[#1F4D2E]"}`}
          />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showIcon && Icon && (
            <Icon
              size={18}
              className={`shrink-0 transition-transform group-hover:translate-x-0.5 ${
                isGreen ? "text-white/90" : "text-[#1F4D2E]"
              }`}
            />
          )}
        </>
      )}
    </button>
  );
}
