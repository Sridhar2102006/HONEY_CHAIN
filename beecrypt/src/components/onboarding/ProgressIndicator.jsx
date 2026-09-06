import React from "react";
import { Check } from "lucide-react";

/**
 * ProgressIndicator — shows step dots connected by lines.
 * Completed steps show a green check, current is a gold filled dot,
 * future steps are hollow.
 */
export default function ProgressIndicator({ currentStep, totalSteps, labels = [] }) {
  return (
    <div className="w-full px-4 py-2">
      {/* Dot row */}
      <div className="flex items-center justify-center gap-0">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              {/* Connector line (before every step except the first) */}
              {i > 0 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-500"
                  style={{
                    background: isCompleted
                      ? "linear-gradient(90deg, #2F6B3F, #F4B942)"
                      : "#EBE5D3",
                  }}
                />
              )}

              {/* Step dot */}
              <div
                className={`flex items-center justify-center rounded-full transition-all duration-300 shrink-0 ${
                  isCompleted
                    ? "w-7 h-7 bg-[#2F6B3F] shadow-sm shadow-[#2F6B3F]/30"
                    : isCurrent
                    ? "w-8 h-8 shadow-md shadow-[#F4B942]/40 ring-4 ring-[#F4B942]/20"
                    : "w-6 h-6 bg-[#EBE5D3]"
                }`}
                style={
                  isCurrent
                    ? {
                        background:
                          "linear-gradient(135deg, #F4B942 0%, #D99518 100%)",
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <Check size={13} className="text-white" strokeWidth={3} />
                ) : (
                  <span
                    className={`text-[10px] font-black ${
                      isCurrent ? "text-[#1F4D2E]" : "text-[#9EA89E]"
                    }`}
                  >
                    {step}
                  </span>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step label */}
      <p className="text-center text-[11px] font-semibold text-[#8F9D8F] mt-2 tracking-wide">
        STEP {currentStep} OF {totalSteps}
      </p>
    </div>
  );
}
