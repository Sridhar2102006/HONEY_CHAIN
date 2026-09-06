import React from "react";
import { Outlet } from "react-router-dom";
import Toast from "../components/Toast.jsx";
import DeviceFrame from "../components/mobile/DeviceFrame.jsx";

/**
 * PublicLayout wraps all public, auth, and onboarding flows.
 * Uses DeviceFrame on desktop viewports to simulate native smartphone viewports
 * (360, 375, 390, 412, 430px) and renders full-width directly on real mobile screens.
 */
export default function PublicLayout() {
  return (
    <DeviceFrame>
      <Outlet />
      <Toast />
    </DeviceFrame>
  );
}
