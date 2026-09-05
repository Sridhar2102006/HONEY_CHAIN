import { useApp } from "./useApp.js";

export function useToast() {
  const { toast, showToast, clearToast } = useApp();
  return { toast, showToast, clearToast };
}
