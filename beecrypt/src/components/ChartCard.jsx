import React from "react";

export default function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-4 ${className}`}>
      {title && <div className="font-bold text-[13.5px] mb-2.5">{title}</div>}
      {children}
    </div>
  );
}
