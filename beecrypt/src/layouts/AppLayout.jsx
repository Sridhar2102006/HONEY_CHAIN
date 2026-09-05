import React, { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Toast from "../components/Toast.jsx";
import { useAuth } from "../hooks/useAuth.js";

export default function AppLayout() {
  const { currentUser, workspace } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!currentUser || !workspace) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-[#F8F6EC]">
      <Sidebar drawerOpen={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 md:ml-0">
        <Navbar onOpenDrawer={() => setDrawerOpen(true)} />
        <div className="p-6">
          <Outlet />
        </div>
      </div>
      <Toast />
    </div>
  );
}
