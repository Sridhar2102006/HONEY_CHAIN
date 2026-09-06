import React, { useEffect } from "react";
import { X } from "lucide-react";

/**
 * Mobile-First Responsive Modal.
 * Transforms into a bottom sheet on mobile devices for ergonomic thumb access,
 * and centers on larger tablets / desktops.
 */
export default function Modal({ title, onClose, children, width = 420 }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog (Bottom sheet style on mobile, centered card on tablet/desktop) */}
      <div
        style={{ maxWidth: width }}
        className="relative z-10 w-full bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 border-t sm:border border-[#ECE6D6] max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
      >
        {/* Mobile Pull Handle (visible on phone) */}
        <div className="w-12 h-1.5 rounded-full bg-[#D8D2C0] mx-auto mb-3 sm:hidden cursor-grab" onClick={onClose} />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0EBE0]">
          <h3 className="font-display font-bold text-lg text-bc-deep-green tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F1E8] flex items-center justify-center text-[#6B7267] hover:text-bc-dark active:scale-95 transition-transform"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div>{children}</div>
      </div>
    </div>
  );
}
