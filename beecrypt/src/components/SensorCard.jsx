import React from "react";

export default function SensorCard({ label, value, status = "Normal" }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-5 flex-1 min-w-[140px]">
      <div className="text-[13px] font-semibold text-[#6B7267]">{label}</div>
      <div className="font-display text-2xl font-semibold mt-1.5">{value}</div>
      <div className="text-xs font-semibold text-bc-success mt-1">{status}</div>
    </div>
  );
}
