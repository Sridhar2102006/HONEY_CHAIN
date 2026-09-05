import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Hexagon, User as UserIcon, Settings as SettingsIcon, LogOut, X } from "lucide-react";
import RoleSwitcher from "./RoleSwitcher.jsx";
import { useAuth } from "../hooks/useAuth.js";

// Absolute paths only — this Sidebar is shared across workspaces that sit
// at different nesting depths, so relative links would resolve incorrectly
// depending on which page rendered them.
const NAV_BY_ROLE = {
  beekeeper: [
    { to: "/app/beekeeper", label: "Dashboard", end: true },
    { to: "/app/beekeeper/hives", label: "My Hives" },
    { to: "/app/beekeeper/monitoring", label: "Live Monitoring" },
    { to: "/app/beekeeper/ai-health", label: "AI Hive Health" },
    { to: "/app/beekeeper/alerts", label: "Alerts" },
    { to: "/app/beekeeper/extraction", label: "Honey Extraction" },
    { to: "/app/traceability", label: "Traceability" },
  ],
  processor: [
    { to: "/app/processor", label: "Dashboard", end: true },
    { to: "/app/processor/batches", label: "Honey Batches" },
    { to: "/app/processor/processing", label: "Processing" },
    { to: "/app/processor/laboratories", label: "Find Laboratories" },
    { to: "/app/processor/certifications", label: "Certifications" },
    { to: "/app/traceability", label: "Traceability" },
  ],
  laboratory: [
    { to: "/app/laboratory", label: "Dashboard", end: true },
    { to: "/app/laboratory/requests", label: "Test Requests" },
    { to: "/app/laboratory/purity", label: "Purity Analysis" },
    { to: "/app/laboratory/certificates", label: "Certificates" },
    { to: "/app/traceability", label: "Traceability" },
  ],
  kvic: [
    { to: "/app/kvic", label: "Dashboard", end: true },
    { to: "/app/kvic/verification", label: "User Verification" },
    { to: "/app/kvic/beekeepers", label: "Beekeepers" },
    { to: "/app/kvic/processors", label: "Processors" },
    { to: "/app/kvic/laboratories", label: "Laboratories" },
    { to: "/app/kvic/hives", label: "Hives" },
    { to: "/app/kvic/batches", label: "Honey Batches" },
    { to: "/app/kvic/certifications", label: "Certifications" },
    { to: "/app/kvic/alerts", label: "Alerts" },
    { to: "/app/kvic/analytics", label: "Analytics" },
    { to: "/app/kvic/readiness", label: "Blockchain Readiness" },
    { to: "/app/traceability", label: "Traceability" },
  ],
};

export default function Sidebar({ drawerOpen, closeDrawer }) {
  const { currentUser, workspace, switchWorkspace, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[workspace] || [];

  const doLogout = () => {
    logout();
    navigate("/");
  };

  const handleSwitch = (role) => {
    switchWorkspace(role);
    navigate(`/app/${role}`);
  };

  return (
    <>
      <aside
        className={`w-[236px] bg-white border-r border-[#ECE6D6] p-4 flex flex-col fixed md:static top-0 bottom-0 left-0 z-30 h-screen md:h-auto transition-[left] duration-200 ${
          drawerOpen ? "left-0" : "-left-[260px] md:left-0"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 font-display text-[19px] font-semibold text-bc-deep-green">
            <Hexagon size={20} className="text-bc-deep-green" fill="#F59E0B" /> BeeCrypt
          </div>
          <button className="md:hidden" onClick={closeDrawer}><X size={18} /></button>
        </div>

        <RoleSwitcher roles={currentUser.roles} workspace={workspace} onSwitch={handleSwitch} />

        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive ? "bg-bc-light-honey text-bc-deep-green" : "text-[#4B5548] hover:bg-[#F8F6EC]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#ECE6D6] pt-2 flex flex-col gap-0.5">
          <NavLink to="/app/profile" onClick={closeDrawer} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[#4B5548] hover:bg-[#F8F6EC] flex items-center gap-2">
            <UserIcon size={15} /> Profile
          </NavLink>
          <NavLink to="/app/settings" onClick={closeDrawer} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-[#4B5548] hover:bg-[#F8F6EC] flex items-center gap-2">
            <SettingsIcon size={15} /> Settings
          </NavLink>
          <button onClick={doLogout} className="px-3 py-2.5 rounded-lg text-sm font-semibold text-bc-critical hover:bg-red-50 flex items-center gap-2 text-left">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
      {drawerOpen && <div onClick={closeDrawer} className="fixed inset-0 bg-black/30 z-20 md:hidden" />}
    </>
  );
}
