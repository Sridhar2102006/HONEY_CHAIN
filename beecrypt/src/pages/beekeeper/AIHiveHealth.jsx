import React, { useState } from "react";
import { Hexagon, Upload, Sparkles } from "lucide-react";
import PageHeader from "../../components/PageHeader.jsx";
import * as hiveService from "../../services/hiveService.js";

export default function AIHiveHealth() {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    setState("loading");
    const res = await hiveService.runAiHealthAnalysis("H-1024", null);
    setResult(res);
    setState("done");
  };

  return (
    <div>
      <PageHeader title="AI Hive Health" sub="AI-assisted analysis — Demo. No model runs in this build." />
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-6 max-w-lg">
        <div className="font-bold text-[15px]">Hive H-1024</div>
        <div className="h-32 rounded-xl bg-gradient-to-br from-bc-light-honey to-[#FDE8B8] flex items-center justify-center my-3">
          <Hexagon size={40} className="text-bc-amber" />
        </div>
        {state === "idle" && (
          <>
            <div className="text-sm text-[#8A9086]">AI-Assisted Analysis</div>
            <div className="font-extrabold text-lg text-bc-success">COLONY STATUS: HEALTHY</div>
            <div className="text-sm text-[#8A9086] mt-1.5">Confidence 94.7% · No disease detected</div>
            <div className="flex gap-2.5 mt-4">
              <button className="flex items-center gap-2 border-2 border-bc-deep-green text-bc-deep-green rounded-xl px-4 py-2.5 text-sm font-bold">
                <Upload size={15} /> Upload Image
              </button>
              <button onClick={analyze} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green shadow">
                <Sparkles size={15} /> Analyze Image
              </button>
            </div>
          </>
        )}
        {state === "loading" && (
          <div className="text-center py-6 text-[13.5px]">
            <div className="bc-spin w-6 h-6 border-[3px] border-bc-light-honey border-t-bc-amber rounded-full mx-auto mb-3" />
            Analyzing hive image... scanning colony patterns...
          </div>
        )}
        {state === "done" && result && (
          <div>
            <div className={`font-extrabold text-lg ${result.status === "HEALTHY" ? "text-bc-success" : "text-bc-critical"}`}>
              {result.status === "HEALTHY" ? "COLONY STATUS: HEALTHY" : `Potential Disease — ${result.label}`}
            </div>
            <div className="text-sm text-[#8A9086] mt-1.5">Confidence {result.confidence}% · {result.recommendation}</div>
            <div className="inline-block bg-bc-light-honey text-bc-amber text-xs font-bold px-2.5 py-1 rounded-full mt-2">AI Demo Result</div>
          </div>
        )}
      </div>
    </div>
  );
}
