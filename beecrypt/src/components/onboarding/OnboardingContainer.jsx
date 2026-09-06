import React from "react";
import AuthBackground from "../auth/AuthBackground.jsx";

/**
 * OnboardingContainer — consistent wrapper for every onboarding step.
 * - Honeycomb background (pointer-events:none, absolute)
 * - SafeArea-aware (env CSS)
 * - Scrollable content area with keyboard-friendly bottom padding
 */
export default function OnboardingContainer({ children, className = "" }) {
  return (
    <div
      className={`relative min-h-screen flex flex-col overflow-x-hidden bg-[#FFF8E7] text-[#243024] ${className}`}
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* Absolute background — never affects layout height */}
      <AuthBackground variant="light" />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
