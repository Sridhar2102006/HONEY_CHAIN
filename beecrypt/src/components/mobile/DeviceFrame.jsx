import React, { useState, useEffect } from "react";
import { Smartphone, RotateCcw, Monitor, Maximize2, Sparkles } from "lucide-react";
import { isNativeMobile } from "../../config/env";

export const DEVICE_PRESETS = [
  { id: "360", label: "360px", desc: "Compact Android", width: 360, height: 780 },
  { id: "375", label: "375px", desc: "iPhone SE", width: 375, height: 812 },
  { id: "390", label: "390px", desc: "iPhone 14/15", width: 390, height: 844 },
  { id: "412", label: "412px", desc: "Pixel 7 / S24", width: 412, height: 915 },
  { id: "430", label: "430px", desc: "iPhone Pro Max", width: 430, height: 932 },
  { id: "full", label: "Responsive", desc: "Full Mobile View", width: null, height: null },
];

/**
 * Mobile Device Preview Shell.
 * On large screens (desktop/laptop), it presents an interactive smartphone chassis
 * allowing the user or reviewer to test at exact widths: 360px, 375px, 390px, 412px, 430px,
 * or full-bleed responsive. On mobile screens and native Capacitor apps, it automatically yields full viewport.
 */
export default function DeviceFrame({ children }) {
  const [selectedPreset, setSelectedPreset] = useState("390");
  const [isLandscape, setIsLandscape] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const currentPreset = DEVICE_PRESETS.find((p) => p.id === selectedPreset) || DEVICE_PRESETS[2];

  // If on native Capacitor mobile (Android/iOS), render 100% full screen directly
  if (isNativeMobile()) {
    return (
      <div className="w-full min-h-screen bg-[#F8F6EC] flex flex-col pl-safe pr-safe">
        {children}
      </div>
    );
  }

  // If on a real mobile screen (< 768px), don't wrap in device chassis, render full screen directly
  if (!isLargeScreen || selectedPreset === "full") {
    return (
      <div className="w-full min-h-screen bg-[#F8F6EC] flex flex-col">
        {isLargeScreen && (
          <div className="sticky top-0 z-50 bg-[#17201A] text-white px-4 py-2 flex items-center justify-between text-xs border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-bc-gold font-bold flex items-center gap-1">
                <Sparkles size={13} /> Mobile-First Responsive Mode
              </span>
              <span className="text-white/60">· Tested for all mobile widths</span>
            </div>
            <div className="flex items-center gap-1.5">
              {DEVICE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPreset(p.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                    selectedPreset === p.id
                      ? "bg-bc-gold text-bc-dark"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col bg-white shadow-xs">
          {children}
        </div>
      </div>
    );
  }

  const targetWidth = isLandscape ? currentPreset.height : currentPreset.width;
  const targetHeight = isLandscape ? currentPreset.width : currentPreset.height;

  return (
    <div className="min-h-screen bg-[#111814] flex flex-col items-center py-6 px-4">
      {/* Device Preset Switcher Topbar */}
      <div className="mb-5 bg-[#1F2922] border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-4 text-xs shadow-xl flex-wrap justify-center">
        <div className="flex items-center gap-2 font-display font-bold text-white pr-2 border-r border-white/10">
          <Smartphone size={16} className="text-bc-gold" />
          <span>Mobile Device Preview</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {DEVICE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                selectedPreset === p.id
                  ? "bg-bc-gold text-bc-dark shadow-md"
                  : "bg-white/5 text-white/70 hover:bg-white/15"
              }`}
            >
              <span>{p.label}</span>
              <span className="text-[10px] opacity-70 hidden sm:inline">({p.desc})</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsLandscape((prev) => !prev)}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-[11px] font-bold ${
            isLandscape ? "bg-bc-forest border-bc-green text-white" : "border-white/20 text-white/80 hover:bg-white/10"
          }`}
          title="Toggle Orientation"
        >
          <RotateCcw size={13} />
          <span>{isLandscape ? "Landscape" : "Portrait"}</span>
        </button>
      </div>

      {/* Simulated Smartphone Frame */}
      <div
        style={{
          width: targetWidth,
          height: targetHeight,
          maxHeight: "92vh",
        }}
        className="relative bg-black rounded-[48px] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-[6px] border-[#2E3B33] flex flex-col transition-all duration-300 overflow-hidden"
      >
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-4 inset-x-0 flex justify-center z-50 pointer-events-none">
          <div className="w-24 h-5 bg-black rounded-full border border-white/10 flex items-center justify-end px-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#17201A] border border-white/20" />
          </div>
        </div>

        {/* Screen Bezel & Screen Viewport */}
        <div className="relative w-full h-full bg-[#FFFDF5] rounded-[38px] overflow-hidden flex flex-col border border-black/10">
          <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
            {children}
          </div>
        </div>

        {/* Home Bar Indicator */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-50">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Dimensions Pill */}
      <div className="mt-3 text-[11px] font-mono text-white/50 tracking-wider">
        {targetWidth} × {targetHeight} px · {currentPreset.desc} · Touch Active
      </div>
    </div>
  );
}
