import React from "react";
import { Link } from "react-router-dom";
import {
  Hexagon, ArrowRight, QrCode, Sparkles, Droplets,
  Factory, FlaskConical, ShieldCheck, ChevronRight, CheckCircle2
} from "lucide-react";

const STEPS = [
  { icon: Hexagon, label: "Harvested", sub: "Apiary ID" },
  { icon: Droplets, label: "Extracted", sub: "Cold Extracted" },
  { icon: Factory, label: "Processed", sub: "Clean Facility" },
  { icon: FlaskConical, label: "Tested", sub: "NABL Purity" },
  { icon: ShieldCheck, label: "Certified", sub: "AGMARK Seal" },
  { icon: QrCode, label: "Verified", sub: "Consumer QR" },
];

const FEATURES = [
  {
    icon: Hexagon,
    title: "Smart Beekeeping",
    body: "Live telemetry (temperature, humidity, vibration) and AI-assisted colony diagnostics.",
  },
  {
    icon: Droplets,
    title: "Honey Traceability",
    body: "Every harvest creates an immutable Batch ID linking hive boxes to consumer retail jars.",
  },
  {
    icon: FlaskConical,
    title: "Accredited Lab Testing",
    body: "Enter chemical sugar profiles and issue certificates archived off-chain.",
  },
  {
    icon: ShieldCheck,
    title: "Integrated Provenance",
    body: "Every event is prepared with deterministic hashes ready for distributed ledger anchoring.",
  },
  {
    icon: QrCode,
    title: "Consumer Verification",
    body: "Consumers scan jar QR codes in supermarkets to verify pure origin in seconds.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-bc-dark flex flex-col">
      {/* Mobile-First Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#ECE6D6] px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-lg text-bc-deep-green">
            <Hexagon size={22} fill="#F59E0B" className="text-bc-deep-green" />
            <span>BeeCrypt</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-bc-deep-green hover:bg-[#F3F1E8] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-bc-gold to-bc-amber text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-bc-light-honey text-bc-amber text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <Sparkles size={13} /> Honey provenance platform
          </span>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-bc-deep-green leading-tight">
            From Hive to Trust.
          </h1>

          <p className="text-xs sm:text-sm text-[#4B5548] leading-relaxed max-w-sm mx-auto">
            Smart apiary monitoring, verified processing, and end-to-end provenance connecting beekeepers, processors, labs, and consumers.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5 max-w-xs mx-auto">
            <Link
              to="/login"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
            >
              <span>Open Beekeeper App</span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/traceability"
              className="w-full py-3.5 rounded-2xl border-2 border-bc-deep-green text-bc-deep-green bg-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xs"
            >
              <QrCode size={16} />
              <span>Verify Honey Batch</span>
            </Link>
          </div>
        </div>

        {/* 6-Step Journey Pipeline Chips */}
        <div className="bg-white rounded-3xl border border-[#ECE6D6] p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider mb-3 text-center">
            Complete Honey Journey
          </div>

          <div className="grid grid-cols-3 gap-2">
            {STEPS.map((s, idx) => (
              <div
                key={s.label}
                className="bg-[#FAF8F0] rounded-2xl p-2.5 text-center flex flex-col items-center justify-center border border-[#F0ECE0]"
              >
                <div className="w-8 h-8 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center mb-1">
                  <s.icon size={16} />
                </div>
                <span className="text-[11px] font-bold text-bc-dark">{s.label}</span>
                <span className="text-[9.5px] text-[#8A9086] truncate max-w-full">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider px-1">
            Core Platform Capabilities
          </div>

          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-bc-light-green text-bc-forest flex items-center justify-center shrink-0 mt-0.5">
                <f.icon size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-bc-deep-green">
                  {f.title}
                </h4>
                <p className="text-xs text-[#6B7267] mt-0.5 leading-relaxed">
                  {f.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo Fast-Login Card */}
        <div className="bg-gradient-to-br from-bc-deep-green to-bc-forest rounded-3xl p-5 text-white shadow-md text-center space-y-2">
          <h3 className="font-display font-bold text-xl">Ready to test the ecosystem?</h3>
          <p className="text-xs text-white/80 max-w-xs mx-auto">
            Test as Beekeeper, Processor, Quality Laboratory, or KVIC Regulator with one tap.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block w-full py-3 rounded-2xl bg-gradient-to-r from-bc-gold to-bc-amber text-bc-dark font-bold text-xs shadow-md active:scale-95 transition-transform"
            >
              Access Role Workspaces
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ECE6D6] py-6 px-4 text-center text-xs text-[#8A9086] bg-white">
        <div className="max-w-md mx-auto space-y-1">
          <div className="font-display font-bold text-bc-deep-green">BeeCrypt Mobile</div>
          <div>SIH 2026 Problem Statement 26021 — Honey Traceability Platform</div>
        </div>
      </footer>
    </div>
  );
}
