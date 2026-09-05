import React, { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";

const ROWS = ["Account Settings", "Notification Settings", "Password", "Appearance", "Language"];

export default function Settings() {
  const [toggles, setToggles] = useState({});
  return (
    <div>
      <PageHeader title="Settings" />
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm max-w-lg divide-y divide-[#ECE6D6]">
        {ROWS.map((r) => (
          <div key={r} className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-semibold">{r}</span>
            <button
              onClick={() => setToggles((p) => ({ ...p, [r]: !p[r] }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${toggles[r] ? "bg-bc-forest" : "bg-[#E5E0CE]"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${toggles[r] ? "left-[18px]" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
