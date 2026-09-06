import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Hexagon, Search, Sparkles, Camera, CheckCircle2, AlertTriangle, 
  RefreshCw, Info, ClipboardCheck, Video, VideoOff, X, ArrowRight,
  ShieldCheck, ShieldAlert, Clock, MapPin, Radio, HardDrive, Wifi, WifiOff
} from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import Modal from "../../components/Modal.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useApp } from "../../hooks/useApp.js";
import * as hiveService from "../../services/hiveService.js";
import cameraApi from "../../api/cameraApi.js";

export default function AIHiveHealth() {
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const { currentActorId, currentUser } = useAuth();
  const { hives, recordInspection, showToast } = useApp();

  // Resolve beekeeper's hives from live state
  const myHives = useMemo(() => {
    return (hives || []).filter((h) => !currentActorId || h.producerId === currentActorId);
  }, [hives, currentActorId]);

  const [selectedHive, setSelectedHive] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(false);
  const [state, setState] = useState("idle"); // idle | loading | done
  const [result, setResult] = useState(null);

  // ESP32-CAM Hardware Integration State Machine
  // captureState: IDLE | TRIGGERING | CAPTURING | SAVING | SUCCESS | FAILED
  const [captureState, setCaptureState] = useState("IDLE");
  const [captureError, setCaptureError] = useState(null);
  const [esp32Status, setEsp32Status] = useState("checking"); // checking | online | offline
  const [esp32Latency, setEsp32Latency] = useState(null);
  const [esp32Address, setEsp32Address] = useState(null);
  const [latestCapture, setLatestCapture] = useState(null);

  // Modal state for "MAP TO INSPECTION"
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapQueenStatus, setMapQueenStatus] = useState("Active & Laying");
  const [mapColonyStrength, setMapColonyStrength] = useState("Strong (8-10 frames)");
  const [mapNotes, setMapNotes] = useState("");

  const activeHiveId = myHives.some((h) => h.hiveId === selectedHive)
    ? selectedHive
    : myHives[0]?.hiveId || "";

  // Check ESP32-CAM health on mount and provide refresh
  const probeEsp32Health = useCallback(async () => {
    setEsp32Status("checking");
    try {
      const res = await cameraApi.getStatus();
      if (res.online) {
        setEsp32Status("online");
        setEsp32Latency(res.latencyMs || null);
        setEsp32Address(res.address || null);
      } else {
        setEsp32Status("offline");
        setEsp32Address(res.address || null);
      }
    } catch (err) {
      setEsp32Status("offline");
    }
  }, []);

  useEffect(() => {
    probeEsp32Health();
    const timer = setInterval(probeEsp32Health, 15000);
    return () => clearInterval(timer);
  }, [probeEsp32Health]);

  // Stop video stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Start Live Inspection (WebRTC Camera Stream)
  const handleStartLiveInspection = async () => {
    if (isLiveStreaming && videoRef.current) {
      captureLiveFrame();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLiveStreaming(true);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      showToast("Live camera inspection active. Align honey frame in lens.");
    } catch (err) {
      console.warn("Live camera access failed or unavailable, falling back to camera upload:", err);
      cameraInputRef.current?.click();
    }
  };

  const stopLiveInspection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsLiveStreaming(false);
  };

  const captureLiveFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `live_frame_${activeHiveId}_${Date.now()}.jpg`, { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setSelectedFile(file);
        stopLiveInspection();
        handleAnalyze(file);
      }
    }, "image/jpeg", 0.9);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopLiveInspection();
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    handleAnalyze(file);
  };

  // ── ESP32-CAM TRIGGER PIPELINE ──
  // Deterministic state machine: IDLE → TRIGGERING → CAPTURING → SAVING → SUCCESS / FAILED
  const handleEsp32Capture = async () => {
    if (captureState !== "IDLE" && captureState !== "SUCCESS" && captureState !== "FAILED") {
      return; // Lock against duplicate clicks
    }

    setCaptureError(null);
    setCaptureState("TRIGGERING");

    const t1 = setTimeout(() => setCaptureState("CAPTURING"), 700);
    const t2 = setTimeout(() => setCaptureState("SAVING"), 2400);

    try {
      const response = await cameraApi.capture(activeHiveId);
      clearTimeout(t1);
      clearTimeout(t2);

      setCaptureState("SUCCESS");
      setEsp32Status("online");
      setLatestCapture(response);
      showToast(`Photo captured and saved to MongoDB! (ID: ${response.captureId})`, "success");

      // Load captured image into viewfinder and run AI scan
      try {
        const asset = await cameraApi.getCaptureImageBlob(response.captureId);
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(asset.url);
        const file = new File([asset.blob], `${response.captureId}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        await handleAnalyze(file);
      } catch (assetErr) {
        console.warn("Could not download blob for instant AI preview:", assetErr);
        // Fallback to backend direct URL
        setPreviewUrl(cameraApi.getCaptureImageUrl(response.captureId));
      }
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setCaptureState("FAILED");
      const errorData = err.data || err.response?.data;
      const message = errorData?.error || err.message || "Capture failed.";
      const detail = errorData?.detail;
      const hint = errorData?.hint;
      setCaptureError({ message, detail, hint });
      showToast(message, "error");
    }
  };

  const handleAnalyze = async (fileToUse = selectedFile) => {
    setState("loading");
    try {
      const res = await hiveService.runAiHealthAnalysis(activeHiveId, fileToUse);
      setResult(res);
      setState("done");

      // Pre-fill mapping fields with AI findings
      if (res.status === "CRITICAL") {
        setMapQueenStatus("Queen Absent (Urgent)");
        setMapColonyStrength("Weak (Under 4 frames)");
      } else if (res.status === "WARNING") {
        setMapQueenStatus("Queen Cell Observed");
        setMapColonyStrength("Moderate (5-7 frames)");
      } else {
        setMapQueenStatus("Active & Laying");
        setMapColonyStrength("Strong (8-10 frames)");
      }
      setMapNotes(
        `[AI Frame Scan - ${res.status}] ${res.label} (${res.confidence}% confidence). Recommendation: ${res.recommendation}`
      );
    } catch (err) {
      console.error(err);
      setState("idle");
    }
  };

  const handleOpenMapInspection = () => {
    if (!mapNotes) {
      setMapNotes(
        `[Field Frame Inspection] Target: Hive ${activeHiveId}. Frame architecture reviewed. Worker brood pattern active.`
      );
    }
    setMapModalOpen(true);
  };

  const handleSaveMappedInspection = (e) => {
    e.preventDefault();
    if (recordInspection) {
      recordInspection({
        hiveId: activeHiveId,
        queenStatus: mapQueenStatus,
        colonyStrength: mapColonyStrength,
        notes: mapNotes,
      });
    } else {
      showToast(`Inspection mapped to Hive ${activeHiveId}.`);
    }
    setMapModalOpen(false);
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setSelectedFile(null);
    setCaptureState("IDLE");
    setCaptureError(null);
    stopLiveInspection();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const isCapturingBusy = ["TRIGGERING", "CAPTURING", "SAVING"].includes(captureState);

  return (
    <div className="space-y-4">
      <PageHeader
        title="AI Honey Frame Inspection"
        sub="Analyze comb brood cells for Varroa mite risk, brood density, and colony health."
      />

      {/* Hardware Status & Simulation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* ESP32-CAM Status Pill */}
        <div className="bg-white border border-[#ECE6D6] rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              esp32Status === "online" 
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                : esp32Status === "checking"
                ? "bg-amber-50 text-amber-600 border border-amber-200"
                : "bg-rose-50 text-rose-600 border border-rose-200"
            }`}>
              {esp32Status === "online" ? <Wifi size={18} /> : <WifiOff size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  esp32Status === "online" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`} />
                <span className="font-bold text-xs text-bc-dark">
                  {esp32Status === "online" ? "Camera Connected" : esp32Status === "checking" ? "Probing Camera..." : "Camera Offline"}
                </span>
              </div>
              <div className="text-[11px] text-[#8A9086] mt-0.5">
                {esp32Address ? `${esp32Address.replace('http://', '')}` : '10.131.229.39'} 
                {esp32Latency ? ` • ${esp32Latency}ms` : ''}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={probeEsp32Health}
            title="Refresh Camera Status"
            className="p-1.5 text-[#8A9086] hover:text-bc-dark hover:bg-[#F3F1E8] rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={esp32Status === "checking" ? "animate-spin" : ""} />
          </button>
        </div>

        {/* MongoDB Atlas Storage Status Pill */}
        <div className="bg-white border border-[#ECE6D6] rounded-2xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <HardDrive size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-xs text-bc-dark">MongoDB GridFS</span>
            </div>
            <div className="text-[11px] text-[#8A9086] mt-0.5">
              Cluster: ESP32Cluster • Bucket: images
            </div>
          </div>
        </div>

        {/* AI Model Architecture Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
          <Info size={16} className="text-bc-amber shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[11px]">Hardware Edge Capture</div>
            <div className="text-[10.5px] text-amber-800 leading-tight">
              Direct streaming pipeline from ESP32-CAM to MongoDB Atlas GridFS with computer vision comb analysis.
            </div>
          </div>
        </div>
      </div>

      {myHives.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#ECE6D6] p-8 text-center shadow-xs">
          <Hexagon size={36} className="text-[#C9C2AC] mx-auto mb-2" />
          <h3 className="font-bold text-base text-bc-dark">No Hives Registered Yet</h3>
          <p className="text-xs text-[#8A9086] mt-1 max-w-sm mx-auto">
            You need at least one registered apiary hive to run AI frame scans and colony health analysis.
          </p>
          <Link
            to="/app/beekeeper"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-bc-forest text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Go to Apiary &amp; Register Hive
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#ECE6D6] p-5 shadow-xs space-y-4">
          {/* Hive Selector dynamically derived from managed hives */}
          <div>
            <label className="text-xs font-bold text-bc-dark block mb-1">Target Hive Source</label>
            <select
              value={activeHiveId}
              onChange={(e) => setSelectedHive(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-bold text-bc-deep-green bg-white outline-none focus:border-bc-deep-green shadow-2xs"
            >
              {myHives.map((h) => (
                <option key={h.hiveId} value={h.hiveId}>
                  Hive {h.hiveId} — {h.block || h.region} ({h.status})
                </option>
              ))}
            </select>
          </div>

          {/* Camera / magnifier inspection viewport */}
          <div className="relative h-64 rounded-2xl bg-[#F3E3B5] overflow-hidden border border-amber-200 shadow-inner flex items-center justify-center">
            {isLiveStreaming ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Animated HUD reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-44 rounded-full border-2 border-dashed border-white/80 animate-spin-slow flex items-center justify-center">
                    <div className="w-36 h-36 rounded-full border-2 border-bc-gold/70" />
                  </div>
                  <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-red-500/80 to-transparent animate-pulse" />
                </div>
              </>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded Honey Frame"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(#A66A1F_1px,transparent_1px)] [background-size:14px_14px]" />
                <div className="relative w-32 h-32 rounded-full border-[7px] border-white/90 bg-[#C9953D]/35 shadow-[0_0_0_999px_rgba(54,34,13,0.12)] flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border border-white/70 bg-[#F8D878]/45 flex items-center justify-center">
                    <Hexagon size={42} className="text-[#8A551B] opacity-80" />
                  </div>
                  <div className="absolute -right-9 -bottom-7 w-16 h-5 rotate-45 rounded-full bg-white/90 shadow-md" />
                </div>
                <div className="absolute bottom-3 inset-x-0 text-center text-[11px] font-bold uppercase tracking-wider text-[#6B4318]">
                  Align or capture honey frame brood cells
                </div>
              </>
            )}

            {/* Frame lens status pill */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#3B2814]/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-xs shadow-xs">
              {isLiveStreaming ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>Live Feed Active</span>
                </>
              ) : previewUrl ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400" />
                  <span>{latestCapture ? `Capture ${latestCapture.captureId}` : "Frame Preview Loaded"}</span>
                </>
              ) : (
                <>
                  <Search size={12} />
                  <span>Frame Lens Active</span>
                </>
              )}
            </div>

            {/* Live Stream Controls Overlay */}
            {isLiveStreaming && (
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                <button
                  type="button"
                  onClick={captureLiveFrame}
                  className="flex-1 py-2 px-3 rounded-xl bg-bc-gold text-bc-dark font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                >
                  <Camera size={14} /> Capture &amp; Analyze Frame
                </button>
                <button
                  type="button"
                  onClick={stopLiveInspection}
                  className="py-2 px-2.5 rounded-xl bg-black/60 text-white font-bold text-xs flex items-center justify-center active:scale-95 transition-transform"
                  title="Stop camera"
                >
                  <VideoOff size={14} />
                </button>
              </div>
            )}

            {selectedFile && !isLiveStreaming && (
              <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-bc-dark shadow-xs truncate max-w-[170px]">
                {selectedFile.name}
              </div>
            )}
          </div>

          {/* Hidden native camera/file input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Capture In-Flight State Progress Bar */}
          {isCapturingBusy && (
            <div className="bg-[#FFF9E8] border border-amber-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-bc-dark">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-bc-amber border-t-transparent animate-spin" />
                  <span>
                    {captureState === "TRIGGERING" && "1. Triggering ESP32-CAM..."}
                    {captureState === "CAPTURING" && "2. ESP32-CAM Capturing Frame..."}
                    {captureState === "SAVING" && "3. Uploading & Saving to MongoDB GridFS..."}
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-amber-700 font-mono">
                  {captureState}
                </span>
              </div>

              {/* Multi-step progress ticks */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className={`h-1.5 rounded-full ${captureState === "TRIGGERING" || captureState === "CAPTURING" || captureState === "SAVING" ? "bg-bc-amber" : "bg-[#ECE6D6]"}`} />
                <div className={`h-1.5 rounded-full ${captureState === "CAPTURING" || captureState === "SAVING" ? "bg-bc-amber" : "bg-[#ECE6D6]"}`} />
                <div className={`h-1.5 rounded-full ${captureState === "SAVING" ? "bg-bc-amber" : "bg-[#ECE6D6]"}`} />
              </div>
            </div>
          )}

          {/* Capture Failure Diagnostic Box */}
          {captureState === "FAILED" && captureError && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>Capture Execution Error</span>
              </div>
              <p className="leading-relaxed pl-6 font-medium">
                {typeof captureError === 'object' ? captureError.message : captureError}
              </p>
              {typeof captureError === 'object' && captureError.detail && (
                <div className="ml-6 p-2 bg-rose-100/70 border border-rose-200 rounded-xl font-mono text-[11px] text-rose-900">
                  <span className="font-bold">Hardware Output:</span> {captureError.detail}
                </div>
              )}
              {typeof captureError === 'object' && captureError.hint && (
                <div className="ml-6 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5 mb-1">
                    <span>💡 Action Required to Resolve:</span>
                  </div>
                  <div>{captureError.hint}</div>
                </div>
              )}
              <div className="pl-6 pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={handleEsp32Capture}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-[11px] shadow-xs active:scale-95"
                >
                  Retry Capture
                </button>
                <button
                  type="button"
                  onClick={probeEsp32Health}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-bold text-[11px] shadow-xs active:scale-95"
                >
                  Check Camera Status
                </button>
              </div>
            </div>
          )}

          {/* ── THREE PRIMARY ACTION BUTTONS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* 1. ESP32-CAM TRIGGER BUTTON (PRIMARY USER FOCUS) */}
            <button
              type="button"
              onClick={handleEsp32Capture}
              disabled={!activeHiveId || isCapturingBusy}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all tracking-wider uppercase ${
                isCapturingBusy
                  ? "bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-bc-amber to-[#D49826] hover:from-[#D49826] hover:to-bc-amber text-bc-dark"
              }`}
            >
              <Camera size={18} className={isCapturingBusy ? "animate-pulse" : ""} />
              <span>
                {isCapturingBusy
                  ? "CAPTURING..."
                  : "📷 CAPTURE PHOTO"}
              </span>
            </button>

            {/* 2. WebRTC Live Camera Stream */}
            <button
              type="button"
              onClick={handleStartLiveInspection}
              disabled={!activeHiveId || isCapturingBusy}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-bc-forest to-bc-deep-green hover:from-bc-deep-green hover:to-bc-forest text-white font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all tracking-wider uppercase disabled:opacity-50"
            >
              <Radio size={18} className="text-bc-gold" />
              <span>LIVE INSPECTION</span>
            </button>

            {/* 3. Map to Inspection */}
            <button
              type="button"
              onClick={handleOpenMapInspection}
              disabled={!activeHiveId || isCapturingBusy}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-bc-deep-green bg-white hover:bg-bc-light-honey/40 text-bc-deep-green font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all tracking-wider uppercase disabled:opacity-50"
            >
              <ClipboardCheck size={18} />
              <span>MAP TO INSPECTION</span>
            </button>
          </div>

          {/* ── LATEST CAPTURE SUMMARY CARD ── */}
          {latestCapture && (
            <div className="bg-[#FAF8F2] border border-[#ECE6D6] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="font-bold text-xs text-bc-dark">Latest ESP32-CAM Capture</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Status: {latestCapture.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white rounded-xl p-3 border border-[#EBE6D8]">
                <div>
                  <div className="text-[10px] text-[#8A9086] uppercase">Capture ID</div>
                  <div className="font-mono font-bold text-bc-dark truncate">{latestCapture.captureId}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A9086] uppercase">Captured At</div>
                  <div className="font-medium text-bc-dark">
                    {new Date(latestCapture.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A9086] uppercase">File Size</div>
                  <div className="font-medium text-bc-dark">
                    {latestCapture.metadata?.fileSize ? `${Math.round(latestCapture.metadata.fileSize / 1024)} KB` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#8A9086] uppercase">Device Source</div>
                  <div className="font-medium text-bc-dark">
                    {latestCapture.metadata?.deviceId || 'ESP32-CAM-01'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* State 1: Idle instructions and secondary options */}
          {state === "idle" && (
            <div className="space-y-3 pt-2">
              <div className="bg-[#FBF9F2] rounded-2xl p-3.5 border border-[#ECE6D6] text-xs space-y-1">
                <div className="text-[11px] font-bold text-[#8A9086] uppercase tracking-wider">
                  Inspection Workflow
                </div>
                <p className="text-[#6B7267] leading-relaxed">
                  Trigger <strong>Capture Photo</strong> to command the ESP32-CAM to snap an image and store it in MongoDB Atlas, or choose a file from your device. The algorithm analyzes brood comb pattern, cell density, and flags early Varroa mite or chalkbrood symptoms.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-[#E5E0CE] bg-white hover:bg-[#F8F6EC] text-bc-dark font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <Camera size={14} className="text-bc-deep-green" />
                  <span>Choose Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAnalyze()}
                  disabled={!activeHiveId}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#F3F1E8] hover:bg-[#EBE6D8] text-bc-dark font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-bc-amber" />
                  <span>Run Demo Scan</span>
                </button>
              </div>
            </div>
          )}

          {/* State 2: Loading Analysis */}
          {state === "loading" && (
            <div className="text-center py-8 space-y-3">
              <div className="w-10 h-10 border-[3px] border-bc-light-honey border-t-bc-amber rounded-full mx-auto bc-spin" />
              <div className="font-display font-bold text-base text-bc-deep-green">
                Analyzing Honey Frame...
              </div>
              <p className="text-xs text-[#8A9086] max-w-xs mx-auto">
                Scanning brood cell architecture and calculating colony diagnostic parameters for Hive {activeHiveId}...
              </p>
            </div>
          )}

          {/* State 3: Done */}
          {state === "done" && result && (
            <div className="space-y-3 animate-in zoom-in-95 duration-200 pt-1">
              <div
                className={`rounded-2xl p-4 border ${
                  result.status === "HEALTHY"
                    ? "bg-bc-light-green border-emerald-200 text-bc-success"
                    : result.status === "WARNING"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-red-50 border-red-200 text-bc-critical"
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.status === "HEALTHY" ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <AlertTriangle size={22} />
                  )}
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Diagnosis: {result.status} (Hive {result.hiveId})
                    </div>
                    <h4 className="font-display font-bold text-base mt-0.5">
                      {result.label}
                    </h4>
                  </div>
                </div>

                <div className="text-xs mt-3 space-y-1.5 pt-2 border-t border-black/10 text-bc-dark">
                  <div className="flex justify-between">
                    <span className="text-[#8A9086]">Diagnostic Confidence:</span>
                    <span className="font-bold">{result.confidence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A9086]">Processed Frame:</span>
                    <span className="font-mono font-medium truncate max-w-[180px]">
                      {result.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#8A9086]">Action Recommendation:</span>
                    <span className="font-semibold text-right max-w-[200px] leading-tight">
                      {result.recommendation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#8A9086] px-1">
                <span>Classified: {result.isSimulated ? "Simulated Model Output" : "On-Device Inference"}</span>
                <span>{new Date(result.analyzedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenMapInspection}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
                >
                  <ClipboardCheck size={15} /> Map to Inspection Log
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-4 rounded-xl bg-[#F3F1E8] text-bc-dark font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                >
                  <RefreshCw size={14} /> Re-scan
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MAP TO INSPECTION MODAL ── */}
      {mapModalOpen && (
        <Modal
          title={`Map to Inspection — Hive ${activeHiveId}`}
          onClose={() => setMapModalOpen(false)}
        >
          <form onSubmit={handleSaveMappedInspection} className="space-y-3.5 text-xs">
            <div className="bg-[#FBF9F2] p-3 rounded-2xl border border-[#ECE6D6] space-y-1">
              <div className="text-[10.5px] font-bold text-[#8A9086] uppercase tracking-wider">
                Target Hive &amp; Source
              </div>
              <div className="font-bold text-sm text-bc-deep-green">
                Hive {activeHiveId}
              </div>
              {result && (
                <div className="text-[11px] text-bc-forest font-semibold pt-0.5">
                  Latest AI Scan: {result.label} ({result.confidence}%)
                </div>
              )}
            </div>

            <div>
              <label className="font-bold text-bc-dark block mb-1">Queen Status</label>
              <select
                value={mapQueenStatus}
                onChange={(e) => setMapQueenStatus(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-medium outline-none focus:border-bc-deep-green"
              >
                <option>Active &amp; Laying</option>
                <option>Virgin Queen</option>
                <option>Queen Cell Observed</option>
                <option>Queen Absent (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-bc-dark block mb-1">Colony Strength</label>
              <select
                value={mapColonyStrength}
                onChange={(e) => setMapColonyStrength(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E0CE] text-xs font-medium outline-none focus:border-bc-deep-green"
              >
                <option>Strong (8-10 frames)</option>
                <option>Moderate (5-7 frames)</option>
                <option>Weak (Under 4 frames)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-bc-dark block mb-1">Inspection Notes</label>
              <textarea
                value={mapNotes}
                onChange={(e) => setMapNotes(e.target.value)}
                rows={3}
                placeholder="Observed good brood pattern, worker activity normal..."
                className="w-full px-3 py-2 rounded-xl border border-[#E5E0CE] text-xs outline-none focus:border-bc-deep-green"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-bc-forest to-bc-deep-green text-white font-bold text-xs shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <ClipboardCheck size={16} /> Save to Hive History
              </button>

              <Link
                to={`/app/beekeeper/hives/${activeHiveId}`}
                onClick={() => setMapModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#F3F1E8] text-bc-dark font-bold text-xs text-center flex items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-[#EBE6D8]"
              >
                <span>View Hive Details &amp; History</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
