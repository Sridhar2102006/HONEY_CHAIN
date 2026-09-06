import React from "react";
import { Thermometer, Droplets, Activity, Gauge } from "lucide-react";

const ICONS = {
  Temperature: Thermometer,
  Humidity: Droplets,
  Vibration: Activity,
};

export default function SensorCard({ label, value, status = "Normal" }) {
  const Icon = ICONS[label] || Gauge;
  const isNormal = status === "Normal";

  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] p-3.5 shadow-xs flex-1 min-w-[105px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-[#6B7267] truncate">{label}</span>
        <Icon size={14} className="text-bc-amber" />
      </div>
      <div className="font-display text-xl font-bold text-bc-deep-green tracking-tight">
        {value}
      </div>
      <div className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
        isNormal ? "text-bc-success" : "text-bc-amber"
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{status}</span>
      </div>
    </div>
  );
}
