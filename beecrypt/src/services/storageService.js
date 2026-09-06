import { Preferences } from '@capacitor/preferences';
import { isNativeMobile } from '../config/env.js';

// In-memory token cache for synchronous authorization header injection
let memoryToken = null;
try {
  memoryToken = localStorage.getItem('beecrypt_token');
} catch {}

/**
 * Storage Service: Unified persistent storage adapter.
 * Uses Capacitor Preferences (SharedPreferences on Android, UserDefaults/Keychain on iOS)
 * on native mobile devices, with automatic localStorage fallback for web browsers.
 */
export const storageService = {
  /**
   * Synchronously retrieve cached token for zero-latency HTTP header injection.
   */
  getTokenSync() {
    if (memoryToken) return memoryToken;
    try {
      return localStorage.getItem('beecrypt_token');
    } catch {
      return null;
    }
  },

  /**
   * Asynchronously retrieve auth token from native Preferences or localStorage.
   */
  async getToken() {
    if (isNativeMobile()) {
      try {
        const { value } = await Preferences.get({ key: 'beecrypt_token' });
        if (value) {
          memoryToken = value;
          return value;
        }
      } catch (err) {
        console.warn('[Storage] Preferences.get token error, falling back:', err);
      }
    }
    return this.getTokenSync();
  },

  /**
   * Persist auth token to storage and in-memory cache.
   */
  async setToken(token) {
    memoryToken = token;
    try {
      localStorage.setItem('beecrypt_token', token);
    } catch {}

    if (isNativeMobile()) {
      try {
        await Preferences.set({ key: 'beecrypt_token', value: token });
      } catch (err) {
        console.warn('[Storage] Preferences.set token error:', err);
      }
    }
  },

  /**
   * Clear auth token from storage and memory.
   */
  async removeToken() {
    memoryToken = null;
    try {
      localStorage.removeItem('beecrypt_token');
    } catch {}

    if (isNativeMobile()) {
      try {
        await Preferences.remove({ key: 'beecrypt_token' });
      } catch (err) {
        console.warn('[Storage] Preferences.remove token error:', err);
      }
    }
  },

  /**
   * Generic key-value get.
   */
  async getItem(key) {
    if (isNativeMobile()) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null && value !== undefined) return value;
      } catch {}
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * Generic key-value set.
   */
  async setItem(key, value) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    } catch {}

    if (isNativeMobile()) {
      try {
        await Preferences.set({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value),
        });
      } catch {}
    }
  },

  /**
   * Generic key-value remove.
   */
  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch {}

    if (isNativeMobile()) {
      try {
        await Preferences.remove({ key });
      } catch {}
    }
  },
};

export default storageService;
