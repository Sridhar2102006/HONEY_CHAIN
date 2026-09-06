import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Mobile-First AuthInput Component.
 * Styled with BeeCrypt Honey Yellow + Natural Green design language.
 */
export default function AuthInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  success,
  icon: Icon,
  required = false,
  autoComplete,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-1.5 text-left ${className}`}>
      {label && (
        <label className="text-xs font-bold text-[#243024] flex items-center justify-between">
          <span>
            {label} {required && <span className="text-[#D99518]">*</span>}
          </span>
          {success && (
            <span className="text-[11px] font-semibold text-[#2F6B3F] flex items-center gap-1">
              <CheckCircle2 size={12} /> Valid
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-[#8F9D8F] pointer-events-none">
            <Icon size={18} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-12 box-border text-sm font-medium bg-[#FFFDF7] rounded-2xl border transition-all outline-none text-[#243024] placeholder:text-[#9EA89E] ${
            Icon ? "pl-11" : "pl-4"
          } pr-4 ${
            error
              ? "border-[#D9383A] bg-[#FDF2F2] focus:border-[#D9383A] focus:ring-4 focus:ring-[#D9383A]/10"
              : "border-[#EBE5D3] focus:border-[#F4B942] focus:bg-white focus:ring-4 focus:ring-[#F4B942]/20"
          }`}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs font-semibold text-[#D9383A] flex items-center gap-1.5 pt-0.5 animate-in fade-in">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
