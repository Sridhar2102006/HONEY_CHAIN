import React, { useState } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../components/mobile/MobileHeader.jsx";
import BottomNavigation from "../components/mobile/BottomNavigation.jsx";
import QRScannerModal from "../components/mobile/QRScannerModal.jsx";
import DeviceFrame from "../components/mobile/DeviceFrame.jsx";
import Toast from "../components/Toast.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function AppLayout() {
  const { currentUser, workspace } = useAuth();
  const [scannerOpen, setScannerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser || !workspace) return <Navigate to="/login" replace />;

  // Determine if current screen is a sub-screen that should show a back button
  const isSubScreen = 
    location.pathname.includes("/hives/") ||
    location.pathname.includes("/processing") ||
    location.pathname.includes("/purity") ||
    location.pathname.includes("/monitoring") ||
    location.pathname.includes("/ai-health") ||
    location.pathname.includes("/alerts") ||
    location.pathname.includes("/laboratories") ||
    location.pathname.includes("/certifications") ||
    location.pathname.includes("/settings");

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <DeviceFrame>
      <div className="min-h-full flex flex-col bg-[#F8F6EC] text-bc-dark relative">
        {/* Mobile App Header */}
        <MobileHeader
          onBack={isSubScreen ? handleBack : null}
        />

        {/* Scrollable Mobile Page Body */}
        <main className="flex-1 px-4 py-4 pb-28">
          <Outlet context={{ openScanner: () => setScannerOpen(true) }} />
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <BottomNavigation onOpenScanner={() => setScannerOpen(true)} />

        {/* Mobile Camera QR Scanner Overlay */}
        <QRScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
        />

        {/* System Feedback Toast */}
        <Toast />
      </div>
    </DeviceFrame>
  );
}
