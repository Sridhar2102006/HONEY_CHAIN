import React, { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "../hooks/useToast.js";

export default function Toast() {
  const { toast, clearToast } = useToast();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3200);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  if (!toast) return null;
  const critical = toast.tone === "critical";

  return (
    <div className="fixed bottom-5 right-5 z-[100]">
      <div className={`flex items-center gap-2 rounded-xl shadow-lg px-4 py-3 text-sm font-semibold text-white ${critical ? "bg-bc-critical" : "bg-bc-deep-green"}`}>
        {critical ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
        {toast.message}
      </div>
    </div>
  );
}
