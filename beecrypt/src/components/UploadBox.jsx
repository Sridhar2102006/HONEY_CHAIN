import React, { useState, useCallback } from "react";
import { Upload, Check, X } from "lucide-react";

export default function UploadBox({ label = "Drag and drop your documents here", accepted = "PDF, JPG, PNG", onFiles, files = [], onRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(null);

  const simulateUpload = useCallback(
    (fileList) => {
      const names = Array.from(fileList).map((f) => f.name);
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(timer);
            onFiles?.(names);
            setTimeout(() => setProgress(null), 400);
            return 100;
          }
          return p + 20;
        });
      }, 90);
    },
    [onFiles]
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) simulateUpload(e.dataTransfer.files); }}
        onClick={() => document.getElementById("bc-upload-input")?.click()}
        className={`border-2 border-dashed rounded-2xl text-center p-6 cursor-pointer transition-colors ${dragOver ? "border-bc-forest bg-bc-light-green" : "border-bc-forest bg-[#F8F6EC]"}`}
      >
        <input
          id="bc-upload-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files?.length && simulateUpload(e.target.files)}
        />
        <Upload size={22} className="text-bc-forest mx-auto mb-2" />
        <div className="text-[13.5px] font-semibold">{label}</div>
        <div className="text-xs text-[#8A9086] mt-1">or click to upload · {accepted}</div>
      </div>
      {progress !== null && (
        <div className="h-1.5 bg-[#ECE6D6] rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-bc-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {files.map((f, i) => (
        <div key={i} className="flex items-center justify-between text-[13.5px] text-bc-success font-semibold mt-2">
          <span className="flex items-center gap-2"><Check size={15} /> {f}</span>
          {onRemove && (
            <button onClick={() => onRemove(i)} className="text-[#8A9086] hover:text-bc-critical">
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
