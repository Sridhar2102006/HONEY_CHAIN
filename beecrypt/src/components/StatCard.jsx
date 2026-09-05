import React from "react";

const TONE_TEXT = {
  dark: "text-bc-dark",
  gold: "text-bc-amber",
  success: "text-bc-success",
  warning: "text-bc-warning",
  critical: "text-bc-critical",
  green: "text-bc-deep-green",
};

export default function StatCard({ label, value, sub, tone = "dark" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 flex-1 min-w-[150px]">
      <div className="text-[13px] font-semibold text-[#6B7267]">{label}</div>
      <div className={`font-display text-3xl font-semibold mt-1.5 ${TONE_TEXT[tone] || TONE_TEXT.dark}`}>{value}</div>
      {sub && <div className="text-xs text-[#8A9086] mt-1">{sub}</div>}
    </div>
  );
}
