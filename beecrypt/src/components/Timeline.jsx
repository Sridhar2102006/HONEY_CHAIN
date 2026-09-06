import React from "react";
import { CheckCircle2, CircleDot, Circle } from "lucide-react";

/**
 * Mobile-first Vertical Timeline.
 * Clear status icons, glowing animated pulse on the active stage,
 * and high-contrast step indicators.
 */
export default function Timeline({ steps }) {
  return (
    <div className="py-2">
      {steps.map((s, i) => {
        const isDone = s.state === "done";
        const isCurrent = s.state === "current";

        return (
          <div key={s.label} className="flex gap-3.5">
            {/* Step Icon & Connecting Line */}
            <div className="flex flex-col items-center">
              {isDone ? (
                <div className="w-7 h-7 rounded-full bg-bc-light-green text-bc-success flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} strokeWidth={2.5} />
                </div>
              ) : isCurrent ? (
                <div className="w-7 h-7 rounded-full bg-bc-light-honey text-bc-amber flex items-center justify-center shrink-0 border-2 border-bc-gold animate-pulse">
                  <CircleDot size={16} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#F3F1E8] text-[#B8B19E] flex items-center justify-center shrink-0">
                  <Circle size={15} />
                </div>
              )}

              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[30px] my-1 transition-colors ${
                    isDone ? "bg-bc-success" : "bg-[#E5E0CE]"
                  }`}
                />
              )}
            </div>

            {/* Step Label & Subtext */}
            <div className={`pb-5 pt-0.5 ${isCurrent ? "text-bc-deep-green" : isDone ? "text-bc-dark" : "text-[#8A9086]"}`}>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isCurrent ? "text-bc-amber" : ""}`}>
                  {s.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-bc-light-honey text-bc-amber px-2 py-0.5 rounded-full">
                    Current Stage
                  </span>
                )}
              </div>
              {s.sub && (
                <div className="text-xs text-[#8A9086] font-normal mt-0.5">
                  {s.sub}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
