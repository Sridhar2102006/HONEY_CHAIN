import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import PageHeader from "../components/PageHeader.jsx";
import { ROLE_META } from "../components/RoleSwitcher.jsx";
import { Check } from "lucide-react";

export default function Profile() {
  const { currentUser, currentActorId, workspace } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" />
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-lg">
        <div className="font-display text-xl">{currentUser.name}</div>
        <div className="text-sm text-[#8A9086] mt-1">{currentUser.org}</div>
        <div className="grid grid-cols-2 gap-3 mt-5 text-sm">
          <div><div className="text-[#8A9086] text-xs">Region</div><div className="font-semibold">{currentUser.region}</div></div>
          <div><div className="text-[#8A9086] text-xs">Active Actor ID</div><div className="font-semibold">{currentActorId}</div></div>
          <div><div className="text-[#8A9086] text-xs">Organization ID</div><div className="font-semibold">{currentUser.orgId}</div></div>
          <div><div className="text-[#8A9086] text-xs">Active Workspace</div><div className="font-semibold">{ROLE_META[workspace]?.label}</div></div>
        </div>
        <div className="mt-5">
          <div className="text-xs font-bold text-[#8A9086] mb-2">APPROVED WORKSPACES</div>
          <div className="flex flex-wrap gap-2">
            {currentUser.roles.map((r) => (
              <span key={r} className="flex items-center gap-1.5 bg-bc-light-green text-bc-success text-xs font-bold px-3 py-1.5 rounded-full">
                <Check size={12} /> {ROLE_META[r]?.label}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-5 text-xs text-bc-success font-semibold">✓ KVIC Verified</div>
      </div>
    </div>
  );
}
