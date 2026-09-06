import React, { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Mobile-First PasswordInput component.
 * Features:
 * - 48px touch height with rounded-2xl corners
 * - Show/Hide password toggle
 * - Honey & Natural Green strength bar
 * - Accessible error and valid states
 */
export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  placeholder = "••••••••",
  error,
  success,
  required = false,
  showStrength = false,
  autoComplete = "current-password",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (val) => {
    if (!val) return 0;
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    return score;
  };

  const strength = showStrength ? getStrength(value) : 0;
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-[#D9383A]", "bg-[#F4B942]", "bg-[#D99518]", "bg-[#2F6B3F]"];

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
        <div className="absolute left-4 text-[#8F9D8F] pointer-events-none">
          <Lock size={18} />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full h-12 box-border text-sm font-medium bg-[#FFFDF7] rounded-2xl border transition-all outline-none text-[#243024] placeholder:text-[#9EA89E] pl-11 pr-12 ${
            error
              ? "border-[#D9383A] bg-[#FDF2F2] focus:border-[#D9383A] focus:ring-4 focus:ring-[#D9383A]/10"
              : "border-[#EBE5D3] focus:border-[#F4B942] focus:bg-white focus:ring-4 focus:ring-[#F4B942]/20"
          }`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3.5 p-1.5 text-[#8F9D8F] hover:text-[#243024] active:scale-95 transition-colors focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {showStrength && value && value.length > 0 && (
        <div className="pt-1 space-y-1">
          <div className="flex gap-1.5 h-1.5 w-full">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                  strength >= step ? strengthColors[strength - 1] : "bg-[#EBE5D3]"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#657365] font-medium">
            <span>Strength: {strengthLabels[Math.max(0, strength - 1)]}</span>
            <span>Must be at least 8 characters</span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-[#D9383A] flex items-center gap-1.5 pt-0.5 animate-in fade-in">
          <AlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
