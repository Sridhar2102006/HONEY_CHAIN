import React from "react";

export default function PageHeader({ title, sub }) {
  return (
    <div className="mb-5">
      <div className="font-display text-2xl">{title}</div>
      {sub && <div className="text-sm text-[#8A9086] mt-1">{sub}</div>}
    </div>
  );
}
