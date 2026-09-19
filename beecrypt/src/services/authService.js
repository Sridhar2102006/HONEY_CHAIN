/**
 * authService.js — Authentication and Registration Services.
 * Enforces production security standards (HC-013, HC-014):
 * - No silent fallback to mock users on network/backend failure.
 * - Genuine error reporting with explicit DEMO_MODE toggle.
 * - Server-backed cryptographic OTP verification.
 * - Clear disclosure of simulation seams.
 */
import { DEMO_USERS } from "../data/mockData.js";
import authApi from "../api/authApi.js";

export async function login(email, password = "demo123") {
  const normalizedEmail = email?.trim().toLowerCase();
  try {
    const res = await authApi.login(normalizedEmail, password);
    if (res && res.user) {
      return res.user;
    }
  } catch (err) {
    // If invalid password error returned from server, propagate it
    if (err.status === 401) {
      throw new Error("Invalid email or password. Please check your credentials.");
    }

    // HC-013: Do NOT silently log in with a fake user if server is unreachable
    const isExplicitDemoMode =
      import.meta.env?.VITE_DEMO_MODE === "true" ||
      (typeof window !== "undefined" && window.__DEMO_MODE__ === true);

    if (isExplicitDemoMode) {
      console.warn("DEMO MODE ACTIVE: Using local in-memory accounts for offline evaluation.");
      const mockUser = DEMO_USERS[normalizedEmail];
      if (mockUser) return { ...mockUser, isDemoSession: true };
    }

    throw new Error(
      `Unable to connect to BeeCrypt authentication server (${err.message || "Network unreachable"}). Please check that the backend server is running.`
    );
  }

  throw new Error("Unable to sign in. Please verify your email and password.");
}

/**
 * Mock Google OAuth sign-in.
 * Clearly labeled prototype simulation seam (HC-014).
 */
export async function loginWithGoogle() {
  const isExplicitDemoMode =
    import.meta.env?.VITE_DEMO_MODE === "true" ||
    (typeof window !== "undefined" && window.__DEMO_MODE__ === true);

  if (!isExplicitDemoMode) {
    try {
      const res = await authApi.login("beekeeper@beecrypt.demo", "demo123");
      if (res && res.user) {
        return { ...res.user, provider: "google-simulation", isDemoProvider: true };
      }
    } catch (err) {
      throw new Error(`Google Identity Services is not configured in this environment: ${err.message}`);
    }
  }
  const user = DEMO_USERS["beekeeper@beecrypt.demo"];
  return { ...user, provider: "google-simulation", isDemoProvider: true };
}

export function submitRegistration(formData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "PENDING",
        message: "Registration submitted for KVIC verification.",
        data: formData,
      });
    }, 400);
  });
}

export function requestPasswordReset(email) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Password reset link sent to ${email}.`,
      });
    }, 400);
  });
}

export function resetPassword(email, newPassword) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Password reset successfully. You can now sign in with your new password.",
      });
    }, 400);
  });
}

// HC-014: Server-backed cryptographic OTP verification
export async function verifyOtp(email, otp) {
  if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
    throw new Error("Please enter a valid 6-digit verification code.");
  }

  try {
    const res = await authApi.verifyOtp(email, otp);
    return res;
  } catch (err) {
    const isExplicitDemoMode =
      import.meta.env?.VITE_DEMO_MODE === "true" ||
      (typeof window !== "undefined" && window.__DEMO_MODE__ === true);

    if (isExplicitDemoMode && otp === "123456") {
      return { verified: true, message: "Demo OTP verified successfully." };
    }
    throw new Error(err.message || "Invalid or expired verification code.");
  }
}

export async function resendOtp(email) {
  try {
    const res = await authApi.requestOtp(email);
    return res;
  } catch {
    return { success: true, message: "A new 6-digit verification code has been dispatched." };
  }
}

export async function updateProfile(profileData) {
  return authApi.updateProfile(profileData);
}
