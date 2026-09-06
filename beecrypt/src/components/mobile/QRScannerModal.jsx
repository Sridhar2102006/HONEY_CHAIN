import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Camera, X, Flashlight, RefreshCw, CheckCircle2, AlertTriangle, 
  ExternalLink, Search, ShieldCheck, Sparkles, Hexagon
} from "lucide-react";
import { useApp } from "../../hooks/useApp.js";

/**
 * First-Class Mobile QR Scanner Workflow.
 * Supports live camera stream with animated mobile viewfinder,
 * permission error fallback, demo quick-scan chips, and instant verification result view.
 */
export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { batches, certificates } = useApp();
  const videoRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [scannedResult, setScannedResult] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  // Initialize camera when scanner is opened
  useEffect(() => {
    let stream = null;
    if (isOpen && isScanning) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((s) => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.play().catch(() => {});
            }
            setCameraActive(true);
            setHasCamera(true);
            setCameraError("");
          })
          .catch((err) => {
            console.log("Camera access not available or permission denied:", err);
            setCameraActive(false);
            setHasCamera(false);
            setCameraError(
              "Camera permission not granted or device has no camera. You can test using the one-tap demo batch chips below."
            );
          });
      } else {
        setCameraActive(false);
        setHasCamera(false);
        setCameraError("Web camera API not supported in this environment. Use demo batch chips below.");
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, isScanning]);

  if (!isOpen) return null;

  const handleBatchSelected = (batchId) => {
    const cleanId = batchId.trim();
    const batch = batches.find((b) => b.batchId.toLowerCase() === cleanId.toLowerCase());
    const cert = certificates.find((c) => c.batchId.toLowerCase() === cleanId.toLowerCase());
    
    setIsScanning(false);
    setScannedResult({
      batchId: cleanId,
      found: !!batch,
      data: batch,
      cert,
      verified: !!batch && batch.certStatus === "CERTIFIED",
    });
  };

  const handleReset = () => {
    setScannedResult(null);
    setIsScanning(true);
    setManualCode("");
  };

  const handleGoToTraceability = () => {
    onClose();
    navigate(`/app/traceability?batchId=${scannedResult.batchId}`);
  };

  const handleGoToConsumerView = () => {
    onClose();
    navigate(`/verify/${scannedResult.batchId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between text-white animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="pt-safe px-5 py-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-white">
          <Hexagon size={20} fill="#F59E0B" className="text-bc-deep-green" />
          <span>BeeCrypt Scanner</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Scanner Body */}
      {isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
          {/* Camera Viewport */}
          <div className="relative w-72 h-72 rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl bg-black/40 flex items-center justify-center">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center">
                <Camera size={44} className="text-bc-gold mb-3 opacity-80" />
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {cameraError || "Point camera at any BeeCrypt QR code on honey jars or batch paperwork."}
                </p>
              </div>
            )}

            {/* Corner Targeting Brackets */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-4 border-l-4 border-bc-gold rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-4 border-r-4 border-bc-gold rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-4 border-l-4 border-bc-gold rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-4 border-r-4 border-bc-gold rounded-br-lg" />

            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-bc-gold to-transparent shadow-[0_0_15px_#F59E0B] bc-laser-line" />
          </div>

          <p className="text-xs text-white/70 mt-5 font-semibold tracking-wide uppercase text-center">
            Align BeeCrypt QR within frame to verify
          </p>

          {/* Quick 1-Tap Demo Batch Scanner Fallback */}
          <div className="w-full max-w-sm mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15">
            <div className="text-[11.5px] font-bold text-bc-light-honey uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={14} /> Instant Demo Batch Barcodes:
            </div>
            <div className="flex flex-wrap gap-2">
              {batches.slice(0, 3).map((b) => (
                <button
                  key={b.batchId}
                  onClick={() => handleBatchSelected(b.batchId)}
                  className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-bc-gold hover:text-bc-dark text-xs font-mono font-bold transition-all active:scale-95 text-white/90 border border-white/20"
                >
                  ⚡ {b.batchId}
                </button>
              ))}
            </div>

            {/* Manual Code Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualCode.trim()) handleBatchSelected(manualCode);
              }}
              className="flex gap-2 mt-3"
            >
              <input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Or enter Batch ID (e.g. BEE-2026-001024)"
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-bc-gold placeholder:text-white/40"
              />
              <button
                type="submit"
                className="bg-bc-gold text-bc-dark font-bold text-xs px-3.5 py-2 rounded-xl active:scale-95 transition-transform"
              >
                Verify
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Scanned Result Card View (Section 8 of Master Prompt) */
        <div className="flex-1 flex flex-col justify-end p-4 z-20">
          <div className="bg-white rounded-3xl p-6 text-bc-dark shadow-2xl max-w-md mx-auto w-full animate-in slide-in-from-bottom duration-300">
            {scannedResult.found ? (
              <>
                {/* Status Seal */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#F0EBE0]">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      scannedResult.verified ? "bg-bc-light-green text-bc-success" : "bg-bc-light-honey text-bc-amber"
                    }`}
                  >
                    {scannedResult.verified ? <CheckCircle2 size={28} /> : <AlertTriangle size={28} />}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
                      Verification Result
                    </div>
                    <div className="font-display font-bold text-xl text-bc-deep-green flex items-center gap-1.5">
                      {scannedResult.verified ? "Certificate record found" : "Certificate pending"}
                    </div>
                  </div>
                </div>

                {/* Extracted Product Data */}
                <div className="py-4 space-y-2.5 text-sm">
                  <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                    <span className="text-[#8A9086]">Honey Type</span>
                    <span className="font-bold">{scannedResult.data.honeyType} Honey</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                    <span className="text-[#8A9086]">Batch ID</span>
                    <span className="font-mono font-bold text-bc-deep-green">{scannedResult.data.batchId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                    <span className="text-[#8A9086]">Origin</span>
                    <span className="font-semibold text-right">
                      {scannedResult.data.producerName} (Hive {scannedResult.data.hiveId})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                    <span className="text-[#8A9086]">Harvest Date</span>
                    <span className="font-semibold">{scannedResult.data.harvestDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#F5F2EA]">
                    <span className="text-[#8A9086]">Quantity</span>
                    <span className="font-semibold">{scannedResult.data.quantity} Litres</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#8A9086]">Integrity Proof Status</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={13} /> Temporarily unavailable
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={handleGoToTraceability}
                    className="w-full rounded-2xl py-3.5 bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    View Full Provenance Journey
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGoToConsumerView}
                      className="flex-1 rounded-2xl py-2.5 border-2 border-bc-deep-green text-bc-deep-green font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={14} /> Consumer View
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 rounded-2xl py-2.5 bg-[#F3F1E8] text-bc-dark font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw size={14} /> Scan Another
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Not found */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-red-100 text-bc-critical flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={28} />
                </div>
                <h4 className="font-display font-bold text-lg text-bc-critical">Batch Record Not Found</h4>
                <p className="text-xs text-[#6B7267] mt-1.5 max-w-xs mx-auto">
                  No verified honey record corresponds to code <b>"{scannedResult.batchId}"</b> in the BeeCrypt registry.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-5 w-full rounded-xl py-3 bg-bc-dark text-white font-bold text-sm active:scale-95 transition-transform"
                >
                  Scan Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom spacer for safe area */}
      <div className="pb-safe" />
    </div>
  );
}
