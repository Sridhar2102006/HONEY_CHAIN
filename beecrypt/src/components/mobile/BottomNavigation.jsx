import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, Hexagon, Package, QrCode, User, Search, Droplets, History
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * Mobile Bottom Navigation Bar.
 * Provides clean, one-thumb access to the 5 primary areas of BeeCrypt:
 * [ Home ] [ Hives ] [ SCAN (Hero Action) ] [ Batches ] [ Profile ]
 */
export default function BottomNavigation({ onOpenScanner }) {
  const { workspace } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve role-appropriate paths for the tab buttons
  const getHomePath = () => `/app/${workspace || "beekeeper"}`;
  
  const getHivesPath = () => {
    switch (workspace) {
      case "beekeeper":
        return "/app/beekeeper/hive-management";
      case "kvic":
        return "/app/kvic/hives";
      case "processor":
        return "/app/processor/processing";
      case "laboratory":
      case "verifier":
        return "/app/laboratory/requests";
      case "retailer":
        return "/app/retailer/inventory";
      default:
        return "/app/beekeeper/hive-management";
    }
  };

  const getBatchesPath = () => {
    switch (workspace) {
      case "processor":
        return "/app/processor/batches";
      case "beekeeper":
        return "/app/beekeeper/extraction";
      case "laboratory":
      case "verifier":
        return "/app/laboratory/purity";
      case "retailer":
        return "/app/retailer/verify";
      case "kvic":
        return "/app/kvic/batches";
      default:
        return "/app/traceability";
    }
  };

  const isHomeActive = location.pathname === getHomePath();

  const isHivesActive = workspace === "beekeeper"
    ? (location.pathname === "/app/beekeeper/hive-management" || location.pathname.startsWith("/app/beekeeper/hives/"))
    : workspace === "kvic"
    ? location.pathname === "/app/kvic/hives"
    : workspace === "processor"
    ? location.pathname.startsWith("/app/processor/processing")
    : (workspace === "laboratory" || workspace === "verifier")
    ? location.pathname.startsWith("/app/laboratory/requests")
    : workspace === "retailer"
    ? location.pathname.startsWith("/app/retailer/inventory")
    : false;

  const isBatchesActive = workspace === "beekeeper"
    ? location.pathname.startsWith("/app/beekeeper/extraction")
    : workspace === "processor"
    ? location.pathname.startsWith("/app/processor/batches") || location.pathname.startsWith("/app/processor/processing")
    : (workspace === "laboratory" || workspace === "verifier")
    ? location.pathname.startsWith("/app/laboratory/purity")
    : workspace === "retailer"
    ? location.pathname.startsWith("/app/retailer/verify")
    : workspace === "kvic"
    ? location.pathname.startsWith("/app/kvic/batches")
    : location.pathname.includes("batches");

  const isProfileActive = location.pathname === "/app/profile" || location.pathname === "/app/settings";
  const isInspection = workspace === "beekeeper";
  const utilityPath = isInspection ? "/app/beekeeper/hive-history" : "/app/profile";
  const isUtilityActive = isInspection
    ? (location.pathname === "/app/beekeeper/hive-history" || location.pathname === "/app/beekeeper/hives")
    : isProfileActive;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#ECE6D6] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2 relative">
        {/* TAB 1: HOME */}
        <NavLink
          to={getHomePath()}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHomeActive ? "text-bc-deep-green" : "text-[#8A9086] hover:text-bc-dark"
          }`}
        >
          <Home size={21} strokeWidth={isHomeActive ? 2.5 : 2} />
          <span className={`text-[11px] mt-1 ${isHomeActive ? "font-bold text-bc-deep-green" : "font-medium"}`}>
            Home
          </span>
          {isHomeActive && <span className="w-1 h-1 bg-bc-deep-green rounded-full mt-0.5" />}
        </NavLink>

        {/* TAB 2: HIVES */}
        <NavLink
          to={getHivesPath()}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isHivesActive ? "text-bc-deep-green" : "text-[#8A9086] hover:text-bc-dark"
          }`}
        >
          <Hexagon size={21} strokeWidth={isHivesActive ? 2.5 : 2} fill={isHivesActive ? "#FEF3C7" : "none"} />
          <span className={`text-[11px] mt-1 ${isHivesActive ? "font-bold text-bc-deep-green" : "font-medium"}`}>
            {workspace === "laboratory" || workspace === "verifier" ? "Requests" : workspace === "retailer" ? "Inventory" : workspace === "processor" ? "Process" : "Hives"}
          </span>
          {isHivesActive && <span className="w-1 h-1 bg-bc-deep-green rounded-full mt-0.5" />}
        </NavLink>

        {/* TAB 3: CENTER HERO INSPECTION ACTION */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            onClick={() => (isInspection ? navigate("/app/beekeeper/ai-health") : onOpenScanner())}
            aria-label={isInspection ? "Open frame inspection" : "Scan BeeCrypt QR"}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-bc-deep-green to-bc-forest text-bc-gold border-4 border-white shadow-lg flex items-center justify-center active:scale-95 transition-transform hover:shadow-bc-gold/30 hover:shadow-xl"
          >
            {isInspection ? <Search size={25} strokeWidth={2.4} /> : <QrCode size={25} strokeWidth={2.4} />}
          </button>
          <span className="text-[10px] font-extrabold text-bc-deep-green tracking-wider mt-0.5 uppercase">
            {isInspection ? "Inspect Health" : "Scan"}
          </span>
        </div>

        {/* TAB 4: BATCHES */}
        <NavLink
          to={getBatchesPath()}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isBatchesActive ? "text-bc-deep-green" : "text-[#8A9086] hover:text-bc-dark"
          }`}
        >
          {workspace === "beekeeper" ? (
            <Droplets size={21} strokeWidth={isBatchesActive ? 2.5 : 2} />
          ) : (
            <Package size={21} strokeWidth={isBatchesActive ? 2.5 : 2} />
          )}
          <span className={`text-[11px] mt-1 ${isBatchesActive ? "font-bold text-bc-deep-green" : "font-medium"}`}>
            {workspace === "beekeeper" ? "Harvest" : workspace === "retailer" ? "Verify" : "Batches"}
          </span>
          {isBatchesActive && <span className="w-1 h-1 bg-bc-deep-green rounded-full mt-0.5" />}
        </NavLink>

        {/* TAB 5: HIVE HISTORY / PROFILE */}
        <NavLink
          to={utilityPath}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isUtilityActive ? "text-bc-deep-green" : "text-[#8A9086] hover:text-bc-dark"
          }`}
        >
          {isInspection ? (
            <History size={21} strokeWidth={isUtilityActive ? 2.5 : 2} />
          ) : (
            <User size={21} strokeWidth={isUtilityActive ? 2.5 : 2} />
          )}
          <span className={`text-[11px] mt-1 ${isUtilityActive ? "font-bold text-bc-deep-green" : "font-medium"}`}>
            {isInspection ? "Hive History" : "Profile"}
          </span>
          {isUtilityActive && <span className="w-1 h-1 bg-bc-deep-green rounded-full mt-0.5" />}
        </NavLink>
      </div>
    </nav>
  );
}
