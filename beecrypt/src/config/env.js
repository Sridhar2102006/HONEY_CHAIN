import { Capacitor } from '@capacitor/core';

const APP_ENV = import.meta.env?.VITE_APP_ENV || 'development';
const IS_PROD = APP_ENV === 'production';
const IS_STAGING = APP_ENV === 'staging';

/**
 * Returns true if running inside native Android or iOS Capacitor container.
 */
export function isNativeMobile() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Returns current platform: 'android', 'ios', or 'web'.
 */
export function getPlatform() {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
}

/**
 * Resolves the appropriate API base URL dynamically.
 * - On Web: uses VITE_API_BASE_URL (defaults to relative '/api/v1' for Vite proxy).
 * - On Native Mobile: uses VITE_MOBILE_API_BASE_URL or absolute HTTPS URL.
 *   Never allows relative paths on native mobile as they fail inside WebView.
 */
export function getApiBaseUrl() {
  const isNative = isNativeMobile();
  const webBase = import.meta.env?.VITE_API_BASE_URL || '/api/v1';
  const mobileBase = import.meta.env?.VITE_MOBILE_API_BASE_URL;

  if (isNative) {
    if (mobileBase && mobileBase.startsWith('http')) {
      return mobileBase.replace(/\/+$/, '');
    }
    if (webBase && webBase.startsWith('http')) {
      return webBase.replace(/\/+$/, '');
    }
    // Production fallback on native mobile
    if (IS_PROD) {
      return 'https://api.honeychain.app/api/v1';
    }
    if (IS_STAGING) {
      return 'https://staging-api.honeychain.app/api/v1';
    }
    // Development mobile fallback (Android emulator host or configured LAN URL)
    return import.meta.env?.VITE_DEV_LAN_API_BASE_URL || 'http://10.0.2.2:3001/api/v1';
  }

  // Web Browser platform
  return webBase.replace(/\/+$/, '');
}

/**
 * Resolves the public consumer verification URL for QR codes.
 * Ensures HTTPS in production and rejects dead hardcoded demo domains. (HC-010)
 */
export function getPublicVerifyUrl(batchId) {
  const customBase = import.meta.env?.VITE_PUBLIC_VERIFY_URL;
  let baseUrl;
  if (customBase && customBase.trim()) {
    baseUrl = customBase.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    baseUrl = window.location.origin;
  } else {
    baseUrl = IS_PROD ? 'https://verify.honeychain.app' : 'http://localhost:5173';
  }

  if (IS_PROD && baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace(/^http:\/\//, 'https://');
  }

  return `${baseUrl}/verify/${encodeURIComponent(batchId)}`;
}

export const env = {
  appEnv: APP_ENV,
  appName: import.meta.env?.VITE_APP_NAME || 'HoneyChain',
  appIdentifier: import.meta.env?.VITE_APP_IDENTIFIER || 'com.honeychain.app',
  blockchainNetwork: import.meta.env?.VITE_BLOCKCHAIN_NETWORK || 'local-hash-chain',
  isNative: isNativeMobile(),
  platform: getPlatform(),
  apiBaseUrl: getApiBaseUrl(),
  getPublicVerifyUrl,
};

export default env;
