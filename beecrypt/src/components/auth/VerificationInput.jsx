import React, { useRef, useEffect } from "react";

/**
 * Mobile-First 6-Digit OTP Verification Input.
 * Styled in BeeCrypt Honey Yellow + Natural Green palette.
 */
export default function VerificationInput({
  value = "",
  onChange,
  length = 6,
  error = null,
  disabled = false,
}) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (!value && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    const char = rawVal.slice(-1);

    if (!/^[0-9]$/.test(char) && char !== "") {
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);

    if (char && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      const nextIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 max-w-[340px] mx-auto" onPaste={handlePaste}>
        {Array.from({ length }).map((_, index) => {
          const isFilled = Boolean(digits[index]);
          return (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digits[index]}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={disabled}
              aria-label={`Digit ${index + 1}`}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-2xl border transition-all outline-none ${
                error
                  ? "border-[#D9383A] bg-[#FDF2F2] text-[#D9383A] focus:border-[#D9383A] focus:ring-4 focus:ring-[#D9383A]/10"
                  : isFilled
                  ? "border-[#F4B942] bg-[#FFF8E7] text-[#1F4D2E] shadow-xs ring-1 ring-[#F4B942]"
                  : "border-[#EBE5D3] bg-[#FFFDF7] text-[#243024] focus:border-[#F4B942] focus:bg-white focus:ring-4 focus:ring-[#F4B942]/20"
              }`}
            />
          );
        })}
      </div>
      {error && (
        <p className="text-xs font-semibold text-[#D9383A] text-center pt-1 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
