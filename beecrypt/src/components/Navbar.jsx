import React, { useState } from "react";
import { Menu, Bell } from "lucide-react";
import SearchBar from "./SearchBar.jsx";
import NotificationPanel from "./NotificationPanel.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useApp } from "../hooks/useApp.js";
import { initials } from "../utils/format.js";
import { HIVES } from "../data/mockData.js";

export default function Navbar({ onOpenDrawer }) {
  const { currentUser } = useAuth();
  const { batches, notifications } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);

  const searchIndex = [
    ...batches.map((b) => ({ label: b.batchId, sublabel: `Batch · ${b.producerName}` })),
    ...HIVES.map((h) => ({ label: h.hiveId, sublabel: `Hive · ${h.region}` })),
  ];
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white border-b border-[#ECE6D6] px-6 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button className="md:hidden" onClick={onOpenDrawer}><Menu size={20} /></button>
        <SearchBar index={searchIndex} />
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative">
            <Bell size={19} />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-bc-critical" />}
          </button>
          {notifOpen && <NotificationPanel notifications={notifications} />}
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-bc-deep-green text-white flex items-center justify-center font-bold text-[13px]">
            {initials(currentUser.name)}
          </div>
          <div className="hidden md:block">
            <div className="text-[13.5px] font-bold">{currentUser.name}</div>
            <div className="text-[11.5px] text-[#8A9086]">{currentUser.org}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
