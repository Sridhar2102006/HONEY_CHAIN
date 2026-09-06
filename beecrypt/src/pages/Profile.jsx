import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, CheckCircle2, ShieldCheck, Settings as SettingsIcon, 
  LogOut, ChevronRight, Layers, MapPin, Building, Sparkles 
} from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import PageHeader from "../components/PageHeader.jsx";
import { ROLE_META } from "../components/RoleSwitcher.jsx";
import { initials } from "../utils/format.js";
import BottomSheet from "../components/mobile/BottomSheet.jsx";

export default function Profile() {
  const { currentUser, currentActorId, workspace, switchWorkspace, logout } = useAuth();
  const navigate = useNavigate();
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSelectRole = (r) => {
    switchWorkspace(r);
    setRoleSheetOpen(false);
    navigate(`/app/${r}`);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Account &amp; Profile" sub="Manage your profile, workspaces, and apiary credentials." />

      {/* User Hero Card */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-bc-deep-green to-bc-forest text-white flex items-center justify-center font-display font-bold text-xl shadow-md shrink-0">
          {initials(currentUser.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-bold text-lg text-bc-deep-green truncate">
              {currentUser.name}
            </h3>
            <CheckCircle2 size={16} className="text-bc-success shrink-0" title="Demo account" />
          </div>
          <p className="text-xs text-[#8A9086] truncate">{currentUser.org}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-mono font-bold bg-[#F3F1E8] text-bc-forest px-2 py-0.5 rounded-md">
              {currentActorId}
            </span>
            <span className="text-[11px] font-bold text-bc-success bg-bc-light-green px-2 py-0.5 rounded-full">
              Demo account
            </span>
          </div>
        </div>
      </div>

      {/* Active Workspace Card with 1-tap Switcher */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#8A9086] uppercase tracking-wider">
            Active Workspace
          </span>
          <button
            onClick={() => setRoleSheetOpen(true)}
            className="text-xs font-bold text-bc-deep-green hover:underline flex items-center gap-0.5"
          >
            <span>Switch</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div
          onClick={() => setRoleSheetOpen(true)}
          className="p-3.5 rounded-2xl bg-bc-light-honey border border-bc-gold/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-bc-amber flex items-center justify-center shadow-xs">
              <Layers size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-bc-deep-green">
                {ROLE_META[workspace]?.label || workspace}
              </div>
              <div className="text-[11px] text-[#6B7267]">
                {ROLE_META[workspace]?.desc || "Operational tools"}
              </div>
            </div>
          </div>
          <span className="text-xs font-bold text-bc-amber bg-white px-2 py-0.5 rounded-lg shadow-2xs">
            Active
          </span>
        </div>
      </div>

      {/* Organization & Credentials */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] p-4 shadow-xs space-y-2.5 text-xs">
        <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
          Enterprise Credentials
        </div>

        <div className="flex justify-between py-1.5 border-b border-[#F2EDE2]">
          <span className="text-[#8A9086]">Organization ID</span>
          <span className="font-mono font-bold text-bc-dark">{currentUser.orgId}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#F2EDE2]">
          <span className="text-[#8A9086]">Location / State</span>
          <span className="font-semibold text-bc-dark">{currentUser.location || currentUser.region}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-[#F2EDE2]">
          <span className="text-[#8A9086]">Active Actor ID</span>
          <span className="font-mono font-bold text-bc-deep-green">{currentActorId}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-[#8A9086]">Approved Roles</span>
          <span className="font-semibold text-bc-forest">{currentUser.roles.join(", ")}</span>
        </div>
      </div>

      {/* Menu Links */}
      <div className="bg-white rounded-3xl border border-[#ECE6D6] shadow-xs divide-y divide-[#F2EDE2] overflow-hidden">
        <Link
          to="/app/settings"
          className="flex items-center justify-between p-4 hover:bg-[#FAF8F2] active:bg-[#F3EFE4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F3F1E8] text-bc-dark flex items-center justify-center">
              <SettingsIcon size={16} />
            </div>
            <span className="text-xs font-bold text-bc-dark">Application Settings</span>
          </div>
          <ChevronRight size={16} className="text-[#8A9086]" />
        </Link>

        <Link
          to="/app/traceability"
          className="flex items-center justify-between p-4 hover:bg-[#FAF8F2] active:bg-[#F3EFE4] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-bc-light-green text-bc-success flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
            <span className="text-xs font-bold text-bc-dark">Traceability Explorer</span>
          </div>
          <ChevronRight size={16} className="text-[#8A9086]" />
        </Link>

        <button
          onClick={doLogout}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-bc-critical">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <LogOut size={16} />
            </div>
            <span className="text-xs font-bold">Logout</span>
          </div>
          <ChevronRight size={16} className="text-bc-critical" />
        </button>
      </div>

      {/* Role Switcher BottomSheet */}
      <BottomSheet
        isOpen={roleSheetOpen}
        onClose={() => setRoleSheetOpen(false)}
        title="Switch Active Workspace"
      >
        <div className="space-y-2">
          {currentUser?.roles.map((role) => {
            const meta = ROLE_META[role] || { label: role, desc: "" };
            const isActive = workspace === role;
            return (
              <button
                key={role}
                onClick={() => handleSelectRole(role)}
                className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between active:scale-[0.98] ${
                  isActive
                    ? "border-bc-deep-green bg-bc-light-honey"
                    : "border-[#ECE6D6] bg-white hover:bg-[#F8F6EC]"
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-bc-deep-green">{meta.label}</div>
                  <div className="text-xs text-[#8A9086] mt-0.5">{meta.desc}</div>
                </div>
                {isActive && (
                  <span className="w-6 h-6 rounded-full bg-bc-deep-green text-white flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}
