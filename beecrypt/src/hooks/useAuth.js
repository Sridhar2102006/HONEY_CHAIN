import { useApp } from "./useApp.js";

export function useAuth() {
  const { currentUser, workspace, currentActorId, login, loginWithGoogle, logout, switchWorkspace, updateUserProfile, submitRegistration } = useApp();
  return { currentUser, workspace, currentActorId, login, loginWithGoogle, logout, switchWorkspace, updateUserProfile, submitRegistration };
}
