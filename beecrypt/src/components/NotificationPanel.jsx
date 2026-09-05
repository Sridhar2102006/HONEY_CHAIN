import React from "react";

export default function NotificationPanel({ notifications }) {
  return (
    <div className="absolute top-[140%] right-0 w-72 bg-white rounded-2xl border border-[#ECE6D6] shadow-lg p-3.5 z-20">
      <div className="font-bold text-[13.5px] mb-2">Notifications</div>
      {notifications.length === 0 && <div className="text-xs text-[#8A9086] py-2">You're all caught up.</div>}
      {notifications.map((n, i) => (
        <div
          key={n.id}
          className={`text-xs py-2 text-[#4B5548] ${i < notifications.length - 1 ? "border-b border-[#ECE6D6]" : ""} ${n.read ? "opacity-60" : ""}`}
        >
          {n.text}
        </div>
      ))}
    </div>
  );
}
