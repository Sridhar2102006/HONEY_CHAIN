import React from "react";

/**
 * AuthCard — Mobile Authentication Container.
 * Features:
 * - Warm white surface (#FFFDF7)
 * - 24-28px rounded corners with subtle agricultural shadow
 * - Generous internal padding and clean hierarchy
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  badge,
  className = "",
}) {
  return (
    <div
      className={`w-full max-w-md mx-auto bg-[#FFFDF7] rounded-t-[28px] sm:rounded-[28px] border-t sm:border border-[#EBE5D3] p-6 sm:p-7 shadow-[0_-8px_30px_rgba(31,77,46,0.08)] sm:shadow-lg transition-all z-10 flex flex-col ${className}`}
    >
      {/* Mobile drag handle indicator */}
      <div className="w-10 h-1 bg-[#E0D9C5] rounded-full mx-auto mb-4 sm:hidden" />

      {(title || subtitle || badge) && (
        <div className="text-left mb-5 space-y-1.5">
          {badge && <div className="mb-2">{badge}</div>}
          {title && (
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#1F4D2E] tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm font-normal text-[#657365] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
