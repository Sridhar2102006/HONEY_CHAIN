import { useApp } from "./useApp.js";

export function useAuth() {
  const { currentUser, workspace, currentActorId, login, logout, switchWorkspace, submitRegistration } = useApp();
  return { currentUser, workspace, currentActorId, login, logout, switchWorkspace, submitRegistration };
}
