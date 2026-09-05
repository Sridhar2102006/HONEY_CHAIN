import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, width = 380 }) {
  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6" style={{ width, maxWidth: "100%" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-base">{title}</div>
          <button onClick={onClose} className="text-[#8A9086] hover:text-bc-dark">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
