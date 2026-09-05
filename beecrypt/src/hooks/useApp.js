import { useContext } from "react";
import { AppContext } from "../context/AppContext.jsx";

// Single hook for reading/acting on the shared app state.
// (auth + toast are both thin wrappers around this same context so every
// page has one consistent import to reach for.)
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
