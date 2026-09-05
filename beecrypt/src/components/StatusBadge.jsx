import React from "react";
import { toneForStatus } from "../utils/status.js";

const TONE_CLASSES = {
  success: "bg-bc-light-green text-bc-success",
  warning: "bg-bc-light-honey text-bc-amber",
  critical: "bg-red-100 text-bc-critical",
  neutral: "bg-gray-100 text-bc-dark",
  gold: "bg-bc-light-honey text-bc-amber",
};

export default function StatusBadge({ status, tone }) {
  const resolvedTone = tone || toneForStatus(status);
  const cls = TONE_CLASSES[resolvedTone] || TONE_CLASSES.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
