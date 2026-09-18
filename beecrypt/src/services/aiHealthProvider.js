/**
 * aiHealthProvider.js — Modular AI Hive Health Computer Vision Architecture.
 * Implements HC-009: Strict Truthfulness in AI Diagnostics.
 *
 * Provides clean architectural separation between:
 * 1. SimulationProvider — Prototype demonstration algorithm (deterministic illustrative simulation).
 * 2. RealVisionProvider — Production seam for genuine TensorFlow.js / ONNX / edge computer vision models.
 */

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class SimulationProvider {
  static async analyzeFrame(hiveId, imageFile) {
    const fileName = imageFile?.name || (typeof imageFile === "string" ? imageFile : "honeycomb_frame.jpg");
    const fileSize = imageFile?.size || 1024 * 450;
    const seed = hashString(`${hiveId}-${fileName}-${fileSize}`);

    // Deterministic simulation based on hive ID + file characteristics
    const isHighRisk = (seed % 10) >= 7 || hiveId === "H-1030";
    const isModerateRisk = !isHighRisk && ((seed % 10) >= 5 || hiveId === "H-1026");

    const result = isHighRisk
      ? {
          status: "CRITICAL",
          label: "Varroa Destructor Mite Infestation Detected",
          simulationConfidence: +(88.5 + (seed % 80) / 10).toFixed(1),
          recommendation: "Immediate oxalic acid vapor treatment recommended. Check brood nest within 24 hours.",
        }
      : isModerateRisk
      ? {
          status: "WARNING",
          label: "Irregular Brood Comb Pattern / Spotty Brood",
          simulationConfidence: +(84.2 + (seed % 70) / 10).toFixed(1),
          recommendation: "Inspect queen laying vigor and evaluate frame for early chalkbrood symptoms.",
        }
      : {
          status: "HEALTHY",
          label: "Healthy Comb Architecture — No Disease Detected",
          simulationConfidence: +(93.0 + (seed % 60) / 10).toFixed(1),
          recommendation: "Colony density and brood capping appear normal. Continue standard 14-day inspection cycle.",
        };

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...result,
          confidence: result.simulationConfidence, // backward compatibility
          hiveId,
          fileName,
          fileSize,
          analyzedAt: new Date().toISOString(),
          isSimulated: true,
          modelProvider: "SimulationProvider (Rule-Based Heuristic Prototype)",
          confidenceLabel: "Simulation confidence",
          disclaimer: "Simulated AI Model (Demonstration) — Prototype Simulation — Not certified by veterinary laboratory. Do not use for clinical agricultural decisions.",
        });
      }, 1000);
    });
  }
}

export class RealVisionProvider {
  static async analyzeFrame(hiveId, imageFile) {
    // Seam ready for future TensorFlow.js or cloud-hosted ONNX model
    throw new Error("RealVisionProvider model endpoint is not configured. Falling back to SimulationProvider.");
  }
}

export class AIHealthProvider {
  static getProvider(type = "simulation") {
    if (type === "vision") {
      return RealVisionProvider;
    }
    return SimulationProvider;
  }

  static async analyze(hiveId, imageFile, options = {}) {
    const provider = this.getProvider(options.provider || "simulation");
    try {
      return await provider.analyzeFrame(hiveId, imageFile);
    } catch {
      return await SimulationProvider.analyzeFrame(hiveId, imageFile);
    }
  }
}

export default AIHealthProvider;
