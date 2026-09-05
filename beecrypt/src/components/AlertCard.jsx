import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { timeAgo } from "../utils/format.js";

export default function AlertCard({ alert }) {
  const critical = alert.level === "critical";
  return (
    <div
      className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4"
      style={{ borderLeft: `4px solid ${critical ? "#DC2626" : "#F59E0B"}` }}
    >
      <div className="flex justify-between items-start">
        <div className={`flex items-center gap-2 font-bold text-[13.5px] ${critical ? "text-bc-critical" : "text-bc-amber"}`}>
          <AlertTriangle size={15} /> {alert.title.toUpperCase()}
        </div>
        <span className="text-[11.5px] text-[#8A9086] flex items-center gap-1">
          <Clock size={11} /> {timeAgo(alert.occurredAt)}
        </span>
      </div>
      <div className="text-[13.5px] mt-1.5">Hive {alert.hiveId} {alert.body}</div>
    </div>
  );
}
