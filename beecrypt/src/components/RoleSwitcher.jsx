import React, { useState } from "react";
import { ChevronDown, CircleCheck, Hexagon, Factory, FlaskConical, ShieldCheck } from "lucide-react";

export const ROLE_META = {
  beekeeper: { label: "Beekeeper", icon: Hexagon },
  processor: { label: "Processor", icon: Factory },
  laboratory: { label: "Laboratory", icon: FlaskConical },
  kvic: { label: "KVIC Admin", icon: ShieldCheck },
};

export default function RoleSwitcher({ roles, workspace, onSwitch }) {
  const [open, setOpen] = useState(false);
  const meta = ROLE_META[workspace];
  if (!meta) return null;

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-bc-light-honey rounded-xl px-3 py-2.5"
      >
        <span className="flex items-center gap-2 font-bold text-[13.5px] text-bc-amber">
          <meta.icon size={16} /> {meta.label.toUpperCase()}
        </span>
        <ChevronDown size={15} className="text-bc-amber" />
      </button>
      {open && (
        <div className="absolute top-[108%] left-0 right-0 bg-white rounded-2xl border border-[#ECE6D6] shadow-lg z-20 p-2">
          <div className="text-[11px] font-bold text-[#8A9086] px-2 py-1">SWITCH WORKSPACE</div>
          {roles.map((r) => {
            const m = ROLE_META[r];
            const active = r === workspace;
            return (
              <button
                key={r}
                onClick={() => { onSwitch(r); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13.5px] font-semibold text-left ${active ? "bg-[#F3F1E8]" : "hover:bg-[#F8F6EC]"}`}
              >
                {active ? <CircleCheck size={15} className="text-bc-forest" /> : <m.icon size={15} className="text-[#8A9086]" />}
                {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
