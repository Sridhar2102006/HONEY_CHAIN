import React from "react";
import { Outlet } from "react-router-dom";
import Toast from "../components/Toast.jsx";

// Wraps the public/marketing + auth pages. Kept intentionally light —
// each page (Landing/Login/Signup) controls its own full-bleed styling.
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bc-cream">
      <Outlet />
      <Toast />
    </div>
  );
}
