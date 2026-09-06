import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Lock, Wifi, Sun, Smartphone, Check, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import { useApp } from "../hooks/useApp.js";

const SETTINGS_SECTIONS = [
  {
    title: "Field Usability & Connectivity",
    items: [
      { id: "offlineSync", label: "Offline Queue (Unavailable)", sub: "No offline sync service is connected in this build", default: false },
      { id: "mqttInterval", label: "Telemetry Sync (Unavailable)", sub: "No IoT stream or MQTT service is connected", default: false },
    ],
  },
  {
    title: "Notifications & Alerts",
    items: [
      { id: "critAlerts", label: "Critical Hive Temperature Push", sub: "Notify immediately if hive > 38°C", default: true },
      { id: "batchUpdates", label: "Batch Status Transitions", sub: "Notify when processing or tests complete", default: true },
    ],
  },
  {
    title: "Security & Verification",
    items: [
      { id: "biometric", label: "Biometric Sign-In (Unavailable)", sub: "No native biometric authentication is connected", default: false },
      { id: "ledgerConfirm", label: "Provenance Synchronization", sub: "External verification is temporarily unavailable", default: false },
    ],
  },
  {
    title: "Display & Outdoor Experience",
    items: [
      { id: "haptic", label: "Haptic Touch Feedback", sub: "Subtle vibration on QR scan and button taps", default: true },
      { id: "contrast", label: "High-Contrast Outdoor Mode", sub: "Enhanced sunlight legibility for apiary fieldwork", default: false },
    ],
  },
];

export default function Settings() {
  const { resetAllData } = useApp();
  const [toggles, setToggles] = useState(() => {
    const initial = {};
    SETTINGS_SECTIONS.forEach((s) => {
      s.items.forEach((item) => {
        initial[item.id] = item.default;
      });
    });
    return initial;
  });

  const toggle = (id) => setToggles((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          to="/app/profile"
          className="text-bc-deep-green font-bold text-xs flex items-center gap-1 active:scale-95"
        >
          <ArrowLeft size={14} /> Back to Profile
        </Link>
      </div>

      <PageHeader
        title="Settings &amp; Preferences"
        sub="Configure offline field operation, notifications, and outdoor view preferences."
      />

      <div className="space-y-4">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider px-1">
              {section.title}
            </div>

            <div className="bg-white rounded-3xl border border-[#ECE6D6] shadow-xs divide-y divide-[#F2EDE2] overflow-hidden">
              {section.items.map((item) => {
                const isOn = toggles[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAF8F2] active:bg-[#F3EFE4] transition-colors"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-bold text-bc-dark">{item.label}</div>
                      <div className="text-[11px] text-[#8A9086] mt-0.5">{item.sub}</div>
                    </div>

                    {/* Native Toggle Switch */}
                    <button
                      type="button"
                      aria-checked={isOn}
                      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                        isOn ? "bg-bc-forest" : "bg-[#E5E0CE]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-xs flex items-center justify-center ${
                          isOn ? "left-[22px]" : "left-0.5"
                        }`}
                      >
                        {isOn && <Check size={11} className="text-bc-forest" strokeWidth={3} />}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Fresh Data Management */}
        <div className="space-y-1.5 pt-2">
          <div className="text-[11px] font-bold text-bc-critical uppercase tracking-wider px-1 flex items-center gap-1.5">
            <Trash2 size={13} /> Data Reset &amp; Fresh Testing
          </div>
          <div className="bg-white rounded-3xl border border-red-200 shadow-xs p-4 space-y-3">
            <div>
              <div className="text-xs font-bold text-bc-dark">Reset All Data (Start Fresh)</div>
              <div className="text-[11px] text-[#8A9086] mt-0.5 leading-relaxed">
                Wipes all hives, batches, lab tests, certificates, and events from both the Neon database and local browser storage so you can manually feed data from scratch. Login accounts are preserved.
              </div>
            </div>
            <button
              onClick={async () => {
                if (window.confirm("Are you sure you want to clear all operational data and start fresh?")) {
                  await resetAllData();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-bc-critical font-bold text-xs border border-red-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Trash2 size={14} /> Clear All Data &amp; Start Fresh
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-[#8A9086] pt-2">
        BeeCrypt Mobile v1.0.4 · Production Build
      </div>
    </div>
  );
}
