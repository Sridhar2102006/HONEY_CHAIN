import React from "react";
import { AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/format.js";

export default function AlertCard({ alert }) {
  const critical = alert.level === "critical";

  return (
    <div
      className={`bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs ${
        critical ? "border-l-4 border-l-bc-critical" : "border-l-4 border-l-bc-amber"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${
          critical ? "text-bc-critical" : "text-bc-amber"
        }`}>
          <AlertTriangle size={15} />
          <span>{alert.title}</span>
        </div>
        <span className="text-[11px] text-[#8A9086] flex items-center gap-1 shrink-0">
          <Clock size={11} /> {timeAgo(alert.occurredAt)}
        </span>
      </div>

      <div className="text-xs text-bc-dark mt-1.5 leading-relaxed">
        <span className="font-bold">Hive {alert.hiveId}</span>: {alert.body}
      </div>

      {alert.hiveId && (
        <div className="mt-3 pt-2 border-t border-[#F2EDE2] flex justify-end">
          <Link
            to={`/app/beekeeper/hives/${alert.hiveId}`}
            className="text-xs font-bold text-bc-deep-green flex items-center gap-1 hover:underline"
          >
            <span>Inspect Hive Telemetry</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
