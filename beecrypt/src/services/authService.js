/**
 * authService.js — MOCK. "Demo Authentication".
 * A real implementation would call a backend auth endpoint (session/JWT),
 * not compare a plain object in memory.
 */
import { DEMO_USERS } from "../data/mockData.js";

export function login(email, _password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = DEMO_USERS[email.trim().toLowerCase()];
      if (!user) {
        reject(new Error("Unrecognized demo account. Try one of the accounts listed below."));
      } else {
        resolve(user);
      }
    }, 250);
  });
}

export function submitRegistration(_formData) {
  // Real version: POST to /api/registrations, KVIC reviews server-side.
  return new Promise((resolve) => {
    setTimeout(() => resolve({ status: "PENDING", message: "Registration submitted for KVIC verification." }), 400);
  });
}
