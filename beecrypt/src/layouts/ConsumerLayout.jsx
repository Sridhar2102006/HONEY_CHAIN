import React from "react";
import { Outlet } from "react-router-dom";

// Deliberately separate from AppLayout: the consumer-facing QR verification
// experience must never show internal sidebars, actor IDs, or full
// blockchain proof details — see Section 30 (consumer verification
// principle) and Section 26 (off-chain vs on-chain UI).
export default function ConsumerLayout() {
  return (
    <div className="min-h-screen bg-bc-deep-green">
      <Outlet />
    </div>
  );
}
