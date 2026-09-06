import React from "react";

export default function FilterBar({ options, active, onChange }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      {options.map((opt) => {
        const isActive = active === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 shadow-xs ${
              isActive
                ? "bg-bc-deep-green text-white shadow-bc-deep-green/20"
                : "bg-white border border-[#ECE6D6] text-[#6B7267] hover:bg-[#F8F6EC] hover:text-bc-dark"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
