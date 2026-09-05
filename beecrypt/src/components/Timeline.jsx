import React from "react";
import { CircleCheck, CircleDot, Circle } from "lucide-react";

/**
 * Generic vertical timeline used for processing status and provenance
 * step-by-step views. `steps` = [{ label, state: "done"|"current"|"future" }]
 */
export default function Timeline({ steps }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex gap-3">
          <div className="flex flex-col items-center">
            {s.state === "done" ? (
              <CircleCheck size={20} className="text-bc-success" />
            ) : s.state === "current" ? (
              <CircleDot size={20} className="text-bc-amber" />
            ) : (
              <Circle size={20} className="text-[#C9C2AC]" />
            )}
            {i < steps.length - 1 && (
              <div className={`w-0.5 flex-1 min-h-[26px] ${s.state === "done" ? "bg-bc-success" : "bg-[#E5E0CE]"}`} />
            )}
          </div>
          <div className={`pb-5 font-bold text-sm ${s.state === "future" ? "text-[#8A9086] font-medium" : "text-bc-dark"}`}>
            {s.label}
            {s.sub && <div className="text-xs text-[#8A9086] font-medium mt-0.5">{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
