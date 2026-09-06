import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

/**
 * OnboardingContext — shared multi-step onboarding state.
 * Persists to sessionStorage so back-navigation preserves data.
 * Passwords are intentionally NOT persisted.
 */

const STORAGE_KEY = "bc_onboarding";

const initialState = {
  // Step 2 — Role
  role: null,
  // Step 3 — Personal
  fullName: "",
  email: "",
  phone: "",
  // Step 4 — Organization (role-specific)
  organization: {},
  // Step 5 — Security (never persisted)
  // Step meta
  currentStep: 1,
  totalSteps: 6,
};

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Never restore passwords from storage
        delete parsed.password;
        delete parsed.confirmPassword;
        return { ...initialState, ...parsed };
      }
    } catch (_) {}
    return initialState;
  });

  // Sync non-sensitive fields to sessionStorage
  useEffect(() => {
    const toSave = { ...data };
    delete toSave.password;
    delete toSave.confirmPassword;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (_) {}
  }, [data]);

  const setField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const setOrgField = useCallback((field, value) => {
    setData(prev => ({
      ...prev,
      organization: { ...prev.organization, [field]: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setData(initialState);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  return (
    <OnboardingContext.Provider value={{ data, setField, setOrgField, reset }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
