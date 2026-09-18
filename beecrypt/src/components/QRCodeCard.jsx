import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { getPublicVerifyUrl } from "../config/env.js";

/**
 * Section 29 — the QR encodes a canonical verification URL that resolves to
 * /verify/:batchId on the current deployment origin or VITE_PUBLIC_VERIFY_URL.
 */
export default function QRCodeCard({ batchId, size = 168 }) {
  const url = getPublicVerifyUrl(batchId);
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-xl border border-[#ECE6D6]">
        <QRCodeSVG value={url} size={size} fgColor="#17201A" bgColor="#FFFFFF" level="M" />
      </div>
      <div className="text-[11px] text-[#8A9086] font-mono break-all text-center max-w-xs">{url}</div>
    </div>
  );
}
