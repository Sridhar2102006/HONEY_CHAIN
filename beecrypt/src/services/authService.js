/**
 * authService.js — Authentication and Registration Services.
 * Preserves existing demo authentication contracts while supporting
 * OTP verification, password reset, and session initialization.
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
    console.warn("Backend API login unreachable, falling back to mock:", err.message);
  }

  // Fallback to local demo mock if offline
  const mockUser = DEMO_USERS[normalizedEmail];
  if (!mockUser) {
    throw new Error("Unable to sign in. Please check your email and password or select a demo account.");
  }
  return mockUser;
}

/**
 * Mock Google OAuth sign-in.
 * Simulates the Google popup flow (800ms delay) and resolves
 * with the beekeeper demo account as the "signed-in Google user".
 */
export async function loginWithGoogle() {
  try {
    const res = await authApi.login("beekeeper@beecrypt.demo", "demo123");
    if (res && res.user) {
      return { ...res.user, provider: "google" };
    }
  } catch (err) {
    console.warn("Backend Google login error, using demo user:", err.message);
  }
  const user = DEMO_USERS["beekeeper@beecrypt.demo"];
  return { ...user, provider: "google" };
}

export function submitRegistration(formData) {
  // Real implementation: POST /api/registrations
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
  // Real implementation: POST /api/auth/forgot-password
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
  // Real implementation: POST /api/auth/reset-password
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Password reset successfully. You can now sign in with your new password.",
      });
    }, 400);
  });
}

export function verifyOtp(email, otp) {
  // Real implementation: POST /api/auth/verify-otp
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp.length === 6) {
        resolve({
          verified: true,
          message: "Email verified successfully.",
        });
      } else {
        reject(new Error("Invalid 6-digit verification code. Please try again."));
      }
    }, 350);
  });
}

export function resendOtp(email) {
  // Real implementation: POST /api/auth/resend-otp
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "A new 6-digit verification code has been dispatched.",
      });
    }, 300);
  });
}
