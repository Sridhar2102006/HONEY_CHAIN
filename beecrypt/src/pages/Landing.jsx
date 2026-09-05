import React from "react";
import { Link } from "react-router-dom";
import {
  Hexagon, Leaf, ArrowRight, QrCode, Activity, Sparkles, Droplets,
  Factory, FlaskConical, ShieldCheck, ChevronRight,
} from "lucide-react";

const STEPS = [
  { icon: Hexagon, label: "Harvested" },
  { icon: Droplets, label: "Extracted" },
  { icon: Factory, label: "Processed" },
  { icon: FlaskConical, label: "Quality Verified" },
  { icon: ShieldCheck, label: "Certificate Issued" },
  { icon: QrCode, label: "QR Verification" },
];

const SECTIONS = [
  { icon: Hexagon, title: "Smart Beekeeping", body: "Simulated live hive data — temperature, humidity, vibration — plus AI-assisted health checks (demo)." },
  { icon: Droplets, title: "Honey Traceability", body: "Every batch carries a permanent Batch ID from hive to shelf, with full parent/child batch relationships." },
  { icon: FlaskConical, title: "Laboratory Verification", body: "Purity results, certification, and off-chain report storage, visible the moment they're issued." },
  { icon: ShieldCheck, title: "Blockchain-Ready Provenance", body: "Every action becomes a canonical provenance event — ready for hashing, signing, and on-chain anchoring by a future backend." },
  { icon: QrCode, title: "Consumer Verification", body: "A scan resolves to the Batch ID and shows a simple, honest verification result — nothing more, nothing fabricated." },
  { icon: Activity, title: "One Account, Every Role", body: "A single approved user can switch between Beekeeper, Processor, and Laboratory workspaces without logging out." },
];

export default function Landing() {
  return (
    <div>
      {/* NAV */}
      <div className="sticky top-0 z-30 bg-bc-cream/90 backdrop-blur border-b border-[#ECE6D6]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display text-xl font-semibold text-bc-deep-green">
            <Hexagon size={24} className="text-bc-deep-green" fill="#F59E0B" /> BeeCrypt
          </div>
          <div className="hidden md:flex gap-7 text-sm font-semibold">
            <span className="cursor-pointer">How It Works</span>
            <span className="cursor-pointer">Features</span>
            <Link to="/verify/BEE-2026-001024" className="cursor-pointer">Verify Honey</Link>
          </div>
          <div className="flex gap-2.5">
            <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-[#F3F1E8]">Login</Link>
            <Link to="/signup" className="rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-bc-gold to-bc-amber shadow-lg">Get Started</Link>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden px-6 pt-20 pb-16 bc-honeycomb-bg">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-bc-light-honey text-bc-amber font-bold text-xs px-3.5 py-1.5 rounded-full mb-5">
              
            </div>
            <h1 className="font-display text-5xl leading-tight text-bc-deep-green font-semibold">From hive to trust.</h1>
            <p className="text-lg text-[#4B5548] leading-relaxed mt-5 max-w-lg">
              Smart beekeeping. Verified honey. Complete traceability. BeeCrypt connects beekeepers, processors,
              laboratories, and consumers through one blockchain-ready honey ecosystem.
            </p>
            <div className="flex gap-3 mt-8">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white bg-gradient-to-br from-bc-gold to-bc-amber shadow-lg">
                Get Started <ArrowRight size={16} />
              </Link>
              <Link to="/verify/BEE-2026-001024" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold border-2 border-bc-deep-green text-bc-deep-green">
                <QrCode size={16} /> Verify Honey
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center h-80">
            <svg viewBox="0 0 360 360" className="w-full max-w-sm">
              <polygon points="180,50 260,95 260,185 180,230 100,185 100,95" fill="none" stroke="#14532D" strokeWidth="2" opacity="0.35" />
              <polygon points="180,80 240,113 240,178 180,211 120,178 120,113" fill="#FEF3C7" opacity="0.6" />
              <polygon points="180,80 240,113 240,178 180,211 120,178 120,113" fill="none" stroke="#D97706" strokeWidth="2" />
              <circle cx="180" cy="145" r="26" fill="#F59E0B" opacity="0.9" />
              <path d="M158 145 a22 22 0 1 1 44 0" fill="none" stroke="#14532D" strokeWidth="3" />
              <ellipse cx="180" cy="300" rx="34" ry="42" fill="#D97706" />
              <ellipse cx="180" cy="296" rx="26" ry="32" fill="#F59E0B" />
              <path d="M60 260 Q 180 300 300 250" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="4 6" fill="none" opacity="0.6" />
            </svg>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-bc-deep-green text-center mb-10">How BeeCrypt Works</h2>
          <div className="flex flex-wrap gap-3.5 justify-center">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4 w-32 text-center">
                  <div className="w-10 h-10 rounded-xl bg-bc-light-honey flex items-center justify-center mx-auto mb-2.5">
                    <s.icon size={20} className="text-bc-amber" />
                  </div>
                  <div className="text-xs font-bold">{s.label}</div>
                </div>
                {i < STEPS.length - 1 && <div className="self-center text-[#C9C2AC]"><ChevronRight size={18} /></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="px-6 pb-24 bg-white">
        <div className="max-w-6xl mx-auto pt-16">
          <h2 className="font-display text-3xl text-bc-deep-green text-center mb-10">Built blockchain-ready, end to end</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {SECTIONS.map((f) => (
              <div key={f.title} className="bg-bc-cream rounded-2xl border border-[#ECE6D6] p-6">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-bc-forest to-bc-deep-green flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-white" />
                </div>
                <div className="font-bold text-base mb-1.5">{f.title}</div>
                <div className="text-sm text-[#6B7267] leading-relaxed">{f.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-10 px-6 bg-bc-deep-green text-white text-center">
        <div className="max-w-xl mx-auto">
          <div className="font-display text-xl mb-1.5">Trust begins at the hive.</div>
          <div className="text-sm opacity-75">BeeCrypt</div>
        </div>
      </div>
    </div>
  );
}
