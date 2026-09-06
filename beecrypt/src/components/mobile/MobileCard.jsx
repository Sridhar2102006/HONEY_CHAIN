import React from "react";
import StatusBadge from "../StatusBadge.jsx";

/**
 * Standardized Mobile Card Component (Section 11).
 * Clear title, status badge, 2-4 key data items in responsive row,
 * primary touch action, and optional secondary action.
 */
export default function MobileCard({
  title,
  subtitle,
  icon: Icon,
  status,
  tone,
  dataItems = [],
  primaryAction,
  secondaryAction,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#ECE6D6] p-4 shadow-xs active:bg-[#FAF8F0] transition-colors ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Header: Title + Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-bc-light-honey text-bc-amber flex items-center justify-center shrink-0">
              <Icon size={18} />
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-display font-bold text-[15px] text-bc-deep-green leading-snug truncate">
              {title}
            </h4>
            {subtitle && (
              <p className="text-xs text-[#8A9086] mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {status && <StatusBadge status={status} tone={tone} />}
      </div>

      {/* 2 to 4 Key Data Points in a 2-column touch grid */}
      {dataItems.length > 0 && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 py-2.5 my-1 border-t border-b border-[#F2EDE2] text-xs">
          {dataItems.map((item, idx) => (
            <div key={idx} className="flex flex-col min-w-0">
              <span className="text-[#8A9086] text-[11px] font-medium truncate">{item.label}</span>
              <span className="font-semibold text-bc-dark text-[13px] truncate mt-0.5">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Primary & Secondary Action Buttons */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2 mt-3 pt-1">
          {secondaryAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                secondaryAction.onClick();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-[#E5E0CE] bg-white text-bc-dark text-xs font-bold active:scale-95 transition-transform truncate"
            >
              {secondaryAction.label}
            </button>
          )}
          {primaryAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                primaryAction.onClick();
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-transform truncate text-center ${
                primaryAction.variant === "outline"
                  ? "border border-bc-deep-green text-bc-deep-green bg-white hover:bg-bc-light-honey"
                  : primaryAction.variant === "gold"
                  ? "bg-gradient-to-r from-bc-gold to-bc-amber text-white"
                  : "bg-gradient-to-r from-bc-forest to-bc-deep-green text-white"
              }`}
            >
              {primaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
