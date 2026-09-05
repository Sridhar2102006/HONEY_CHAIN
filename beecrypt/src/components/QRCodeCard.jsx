import React from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Section 29 — the QR encodes a verification URL that conceptually
 * resolves to the Batch ID: /verify/:batchId. The Batch ID itself,
 * not the QR image, is the product's identity.
 */
export default function QRCodeCard({ batchId, size = 168 }) {
  const url = `https://beecrypt.demo/verify/${batchId}`;
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div className="p-3 bg-white rounded-xl border border-[#ECE6D6]">
        <QRCodeSVG value={url} size={size} fgColor="#17201A" bgColor="#FFFFFF" level="M" />
      </div>
      <div className="text-[11px] text-[#8A9086]">{url}</div>
    </div>
  );
}
