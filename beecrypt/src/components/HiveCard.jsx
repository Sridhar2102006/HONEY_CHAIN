import React from "react";
import { Thermometer, Droplets, Activity, Battery, MapPin, ChevronRight, Hexagon } from "lucide-react";
import StatusBadge from "./StatusBadge.jsx";
import { Link } from "react-router-dom";

export default function HiveCard({ hive, onInspect }) {
  const isHealthy = hive.status === "healthy";
  const isCritical = hive.status === "critical";

  return (
    <div className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs hover:shadow-md transition-all active:scale-[0.99]">
      {/* Top row: Hive ID, Queen/Colony status & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
            isCritical ? "bg-red-100 text-bc-critical" : isHealthy ? "bg-bc-light-green text-bc-success" : "bg-amber-100 text-bc-amber"
          }`}>
            <Hexagon size={18} fill="currentColor" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-bc-deep-green">
              Hive {hive.hiveId}
            </div>
            <div className="text-[11px] text-[#8A9086] flex items-center gap-1">
              <MapPin size={11} /> {hive.block || `${hive.region} Apiary`}
            </div>
          </div>
        </div>

        <StatusBadge status={hive.status} />
      </div>

      {/* Sensor telemetry chips (Temperature, Humidity, Vibration, Battery) */}
      <div className="grid grid-cols-3 gap-2 py-2.5 my-2 bg-[#FBF9F2] rounded-xl px-3 text-xs">
        <div className="flex items-center gap-1 text-[#4B5548]">
          <Thermometer size={13} className="text-bc-amber shrink-0" />
          <span className="font-bold">{hive.temp}°C</span>
        </div>
        <div className="flex items-center gap-1 text-[#4B5548]">
          <Droplets size={13} className="text-bc-forest shrink-0" />
          <span className="font-bold">{hive.humidity}%</span>
        </div>
        <div className="flex items-center gap-1 text-[#4B5548]">
          <Activity size={13} className="text-bc-deep-green shrink-0" />
          <span className="font-bold">{hive.vibration}g</span>
        </div>
      </div>

      {/* Bottom info row: Battery & Sensor connection */}
      <div className="flex items-center justify-between text-[11px] text-[#8A9086] mb-3 px-1">
        <span className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${hive.sensor === "online" ? "bg-bc-success" : "bg-gray-400"}`} />
          {hive.sensor === "online" ? "IoT Online" : "Offline"}
        </span>
        <span className="flex items-center gap-1 font-medium">
          <Battery size={13} className="text-[#8A9086]" />
          {hive.battery}% Battery
        </span>
      </div>

      {/* Action Buttons: 1-tap View Details and Quick Record Inspection */}
      <div className="flex gap-2">
        <Link
          to={`/app/beekeeper/hives/${hive.hiveId}`}
          className="flex-1 py-2.5 rounded-xl bg-[#F3F1E8] hover:bg-[#EDE7D6] text-bc-dark text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform"
        >
          <span>View Telemetry</span>
          <ChevronRight size={14} />
        </Link>
        <Link
          to={`/app/beekeeper/extraction?hiveId=${hive.hiveId}`}
          className="px-3.5 py-2.5 rounded-xl bg-bc-deep-green text-white text-xs font-bold flex items-center justify-center active:scale-95 transition-transform"
        >
          Extract Honey
        </Link>
      </div>
    </div>
  );
}
