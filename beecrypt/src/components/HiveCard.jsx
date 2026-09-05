import React from "react";
import { Thermometer, Droplets, Activity } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { Link } from "react-router-dom";

export default function HiveCard({ hive }) {
  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-[15px]">Hive {hive.hiveId}</div>
        <StatusBadge status={hive.status} />
      </div>
      <div className="flex justify-between text-xs text-[#8A9086] mb-2">
        <span className="flex items-center gap-1"><Thermometer size={12} /> {hive.temp}°C</span>
        <span className="flex items-center gap-1"><Droplets size={12} /> {hive.humidity}%</span>
        <span className="flex items-center gap-1"><Activity size={12} /> {hive.vibration}g</span>
      </div>
      <div className="text-xs font-semibold text-bc-success mb-3">● Sensor {hive.sensor === "online" ? "Online" : "Offline"}</div>
      <Link
        to={`/app/beekeeper/hives/${hive.hiveId}`}
        className="block text-center w-full rounded-xl bg-[#F3F1E8] hover:bg-[#EDE7D6] transition-colors text-sm font-bold py-2.5"
      >
        View Details
      </Link>
    </div>
  );
}
