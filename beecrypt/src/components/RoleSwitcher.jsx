import React, { useState } from "react";
import { ChevronDown, CircleCheck, Hexagon, Factory, FlaskConical, ShieldCheck, Store, Compass } from "lucide-react";
import { ROLE_META, WORKSPACE_ROLES } from "../auth/permissions.js";

export { ROLE_META };

const ROLE_ICONS = {
  beekeeper: Hexagon,
  processor: Factory,
  laboratory: FlaskConical,
  retailer: Store,
  kvic: ShieldCheck,
};

export default function RoleSwitcher({ roles = [], workspace, onSwitch }) {
  const [open, setOpen] = useState(false);
  const meta = ROLE_META[workspace] || ROLE_META.beekeeper;
  const MetaIcon = ROLE_ICONS[workspace] || Hexagon;

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-bc-light-honey rounded-xl px-3 py-2.5 transition-colors hover:bg-[#FFECC2]"
      >
        <span className="flex items-center gap-2 font-bold text-[13.5px] text-bc-amber">
          <MetaIcon size={16} /> {meta.label.toUpperCase()}
        </span>
        <ChevronDown size={15} className="text-bc-amber" />
      </button>

      {open && (
        <div className="absolute top-[108%] left-0 right-0 bg-white rounded-2xl border border-[#ECE6D6] shadow-xl z-30 p-2 max-h-[340px] overflow-y-auto animate-in fade-in">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A9086] px-2 py-1 flex items-center gap-1">
            <Compass size={11} /> Switch Workspace
          </div>

          <div className="space-y-0.5 mt-1">
            {WORKSPACE_ROLES.filter((role) => roles.includes(role)).map((r) => {
              const m = ROLE_META[r];
              const RoleIcon = ROLE_ICONS[r];
              const active = r === workspace;
              return (
                <button
                  key={r}
                  onClick={() => { onSwitch(r); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold text-left transition-colors ${
                    active ? "bg-[#F3F1E8] text-[#1F4D2E]" : "hover:bg-[#F8F6EC] text-[#4B5548]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {active ? (
                      <CircleCheck size={15} className="text-bc-forest shrink-0" />
                    ) : (
                      <RoleIcon size={15} className="text-[#8A9086] shrink-0" />
                    )}
                    <span>{m.label}</span>
                  </div>
                  {active && (
                    <span className="text-[9px] bg-[#EBF5EE] text-[#2F6B3F] px-1.5 py-0.5 rounded font-bold uppercase">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
