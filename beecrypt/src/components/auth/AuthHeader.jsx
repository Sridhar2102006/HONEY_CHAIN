import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import BeeCryptLogo from "./BeeCryptLogo.jsx";

export default function AuthHeader({
  onBack,
  showBrand = true,
  step,
  totalSteps,
  inverted = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <header className="pt-safe px-5 py-3.5 flex items-center justify-between z-20">
      {onBack !== false ? (
        <button
          onClick={handleBack}
          aria-label="Go Back"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center active:scale-95 transition-all shadow-xs border ${
            inverted
              ? "bg-white/10 hover:bg-white/20 text-white border-white/15"
              : "bg-[#FFFDF7] hover:bg-white text-[#1F4D2E] border-[#EBE5D3] shadow-sm"
          }`}
        >
          <ArrowLeft size={18} />
        </button>
      ) : (
        <div className="w-10 h-10" />
      )}

      {showBrand && (
        <Link to="/" className="flex items-center">
          <BeeCryptLogo size="sm" inverted={inverted} />
        </Link>
      )}

      {step && totalSteps ? (
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
            inverted
              ? "text-amber-200 bg-white/10 border-white/15"
              : "text-[#1F4D2E] bg-[#EBF5EE] border-[#D1EAD8]"
          }`}
        >
          Step {step}/{totalSteps}
        </span>
      ) : (
        <div className="w-10 h-10" />
      )}
    </header>
  );
}
