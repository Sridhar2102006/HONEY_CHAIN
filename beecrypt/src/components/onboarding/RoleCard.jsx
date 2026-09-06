import React from "react";
import { Check } from "lucide-react";

/**
 * RoleCard — tappable card for role selection.
 * Selected state: gold/green border, subtle cream fill, checkmark badge.
 */
export default function RoleCard({ id, icon, title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] flex items-start gap-3.5 ${
        selected
          ? "border-[#2F6B3F] bg-[#F0F9F2] shadow-md shadow-[#2F6B3F]/10"
          : "border-[#EBE5D3] bg-[#FFFDF7] hover:border-[#D1EAD8] hover:bg-[#F9FAF6]"
      }`}
      aria-pressed={selected}
    >
      {/* Icon */}
      <span
        className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl shrink-0 transition-all duration-200 ${
          selected ? "bg-[#2F6B3F]/10" : "bg-[#FFF8E7]"
        }`}
      >
        {icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-bold leading-tight ${
            selected ? "text-[#1F4D2E]" : "text-[#243024]"
          }`}
        >
          {title}
        </p>
        <p className="text-xs text-[#657365] font-normal mt-0.5 leading-snug">
          {description}
        </p>
      </div>

      {/* Selection indicator */}
      <div
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          selected
            ? "border-[#2F6B3F] bg-[#2F6B3F]"
            : "border-[#DDD5C0] bg-transparent"
        }`}
      >
        {selected && <Check size={11} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}
