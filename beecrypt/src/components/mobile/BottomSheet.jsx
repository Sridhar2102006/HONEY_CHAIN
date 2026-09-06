import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Mobile-first BottomSheet modal.
 * Slides up smoothly from the bottom of the screen with a handle bar,
 * title, and full touch accessibility.
 */
export default function BottomSheet({ isOpen, onClose, title, children, maxHeight = "85vh" }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Sheet Container */}
      <div
        style={{ maxHeight }}
        className="relative z-10 w-full bg-white rounded-t-3xl shadow-2xl border-t border-[#ECE6D6] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
      >
        {/* Drag/Swipe Handle */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-[#D8D2C0]" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#F0EBE0]">
          <h3 className="font-display font-bold text-lg text-bc-deep-green tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F1E8] flex items-center justify-center text-[#6B7267] hover:text-bc-dark active:scale-95 transition-transform"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sheet Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
