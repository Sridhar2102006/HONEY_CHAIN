import React, { useState, useEffect } from "react";
import { Hexagon, Bell, ChevronDown, Wifi, WifiOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import { ROLE_META } from "../RoleSwitcher.jsx";
import { initials } from "../../utils/format.js";
import NotificationPanel from "../NotificationPanel.jsx";
import BottomSheet from "./BottomSheet.jsx";
import capacitorService from "../../services/capacitorService.js";

// Map workspace roles to their dashboard paths
const WORKSPACE_PATHS = {
  beekeeper: "/app/beekeeper",
  processor: "/app/processor",
  laboratory: "/app/laboratory",
  verifier: "/app/laboratory",
  retailer: "/app/retailer",
  kvic: "/app/kvic",
};

export default function MobileHeader({ title, onBack, rightAction }) {
  const { currentUser, workspace, switchWorkspace } = useAuth();
  const { notifications } = useApp();
  const navigate = useNavigate();
  const [roleSheetOpen, setRoleSheetOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen to native or browser network status changes
    const cleanup = capacitorService.onNetworkChange((status) => {
      setIsOnline(status.connected);
    });
    return cleanup;
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentRoleMeta = ROLE_META[workspace] || { label: workspace, desc: "" };

  const handleSelectRole = (r) => {
    // For verifier, the actual route workspace is "laboratory"
    const target = r === "verifier" ? "laboratory" : r;
    switchWorkspace(target);
    navigate(WORKSPACE_PATHS[r] || `/app/${target}`);
    setRoleSheetOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ECE6D6] pt-safe px-4 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-2">
          {/* Left section: Back button OR Brand + Workspace Picker */}
          {onBack ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={onBack}
                className="w-9 h-9 rounded-full bg-[#F3F1E8] flex items-center justify-center text-bc-dark active:scale-95 transition-transform"
                aria-label="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
              {title && (
                <h1 className="font-display font-bold text-base text-bc-deep-green truncate">
                  {title}
                </h1>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {/* Brand icon */}
              <div className="flex items-center gap-1.5 font-display font-bold text-lg text-bc-deep-green">
                <Hexagon size={22} fill="#F59E0B" className="text-bc-deep-green" />
                <span className="hidden xs:inline tracking-tight">BeeCrypt</span>
              </div>

              {/* Active Workspace Selector Pill */}
              {currentUser && (
                <button
                  onClick={() => setRoleSheetOpen(true)}
                  className="flex items-center gap-1.5 bg-bc-light-honey hover:bg-[#FDE68A] text-bc-deep-green text-xs font-bold px-2.5 py-1.5 rounded-full border border-bc-gold/30 active:scale-95 transition-all truncate"
                >
                  <span className="truncate">{currentRoleMeta.label}</span>
                  <ChevronDown size={13} className="text-bc-amber shrink-0" />
                </button>
              )}
            </div>
          )}

          {/* Right section: Offline toggle, Notifications, Avatar */}
          <div className="flex items-center gap-2">
            {rightAction}

            {/* Offline / Online Field Usability Pill */}
            <button
              onClick={() => setIsOnline((prev) => !prev)}
              title={isOnline ? "Simulating Online Mode. Tap to toggle Field Offline Mode." : "Simulating Offline Field Mode. Tap to reconnect."}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold transition-colors ${
                isOnline
                  ? "bg-bc-light-green text-bc-success"
                  : "bg-red-100 text-bc-critical animate-pulse"
              }`}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              <span className="hidden sm:inline">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-[#F8F6EC] flex items-center justify-center text-bc-dark active:scale-95 transition-transform relative"
                aria-label="Notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-bc-critical" />
                )}
              </button>
              {notifOpen && <NotificationPanel notifications={notifications} />}
            </div>

            {/* User Initials Avatar */}
            {currentUser && (
              <button
                type="button"
                onClick={() => navigate("/app/profile")}
                title={`${currentUser.name} (${currentUser.org})`}
                aria-label="Open profile"
                className="w-8 h-8 rounded-full bg-bc-deep-green text-white flex items-center justify-center font-bold text-xs shadow-xs"
              >
                {initials(currentUser.name)}
              </button>
            )}
          </div>
        </div>

        {/* Field Offline Notice Banner if toggled offline */}
        {!isOnline && (
          <div className="mt-2 py-1 px-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center justify-between">
            <span><b>Field Mode:</b> Offline indicator only. No sync queue is connected.</span>
            <button onClick={() => setIsOnline(true)} className="underline font-bold text-amber-900">Reconnect</button>
          </div>
        )}
      </header>

      {/* Role / Workspace Switcher BottomSheet */}
      <BottomSheet
        isOpen={roleSheetOpen}
        onClose={() => setRoleSheetOpen(false)}
        title="Switch Workspace"
      >
        <div className="space-y-2">
          <p className="text-xs text-[#8A9086] mb-3">
            Select the operational workspace you would like to view and manage:
          </p>
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
    </>
  );
}
