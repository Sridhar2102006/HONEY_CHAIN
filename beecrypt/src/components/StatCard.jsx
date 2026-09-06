import React from "react";

const TONE_CLASSES = {
  dark: { text: "text-bc-dark", bg: "bg-[#F3F1E8]" },
  gold: { text: "text-bc-amber", bg: "bg-bc-light-honey" },
  success: { text: "text-bc-success", bg: "bg-bc-light-green" },
  warning: { text: "text-bc-warning", bg: "bg-amber-100" },
  critical: { text: "text-bc-critical", bg: "bg-red-100" },
  green: { text: "text-bc-deep-green", bg: "bg-bc-light-green" },
};

export default function StatCard({ label, value, sub, tone = "dark", icon: Icon, onClick }) {
  const t = TONE_CLASSES[tone] || TONE_CLASSES.dark;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#ECE6D6] p-3.5 shadow-xs flex flex-col justify-between flex-1 min-w-[130px] transition-all ${
        onClick ? "cursor-pointer active:scale-[0.98] hover:border-bc-gold" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="text-[11.5px] font-semibold text-[#6B7267] leading-tight truncate">
          {label}
        </span>
        {Icon && (
          <div className={`w-6 h-6 rounded-lg ${t.bg} ${t.text} flex items-center justify-center shrink-0`}>
            <Icon size={13} />
          </div>
        )}
      </div>

      <div className={`font-display text-2xl font-bold tracking-tight ${t.text}`}>
        {value}
      </div>

      {sub && (
        <div className="text-[11px] text-[#8A9086] mt-1 font-medium truncate">
          {sub}
        </div>
      )}
    </div>
  );
}
