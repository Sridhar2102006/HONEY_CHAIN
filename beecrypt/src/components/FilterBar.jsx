import React from "react";

export default function FilterBar({ options, active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            active === opt ? "bg-bc-deep-green text-white" : "bg-[#F3F1E8] text-bc-dark hover:bg-[#EDE7D6]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
