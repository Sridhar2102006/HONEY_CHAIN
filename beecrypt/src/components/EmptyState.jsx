import React from "react";
import { Hexagon } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", subtitle }) {
  return (
    <div className="text-center py-14">
      <Hexagon size={30} className="text-[#C9C2AC] mx-auto mb-3" />
      <div className="font-semibold text-[#4B5548]">{title}</div>
      {subtitle && <div className="text-sm text-[#8A9086] mt-1">{subtitle}</div>}
    </div>
  );
}
