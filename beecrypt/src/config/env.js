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
    // Development local LAN fallback
    return 'http://10.131.229.86:3001/api/v1';
  }

  // Web Browser platform
  return webBase.replace(/\/+$/, '');
}

export const env = {
  appEnv: APP_ENV,
  appName: import.meta.env?.VITE_APP_NAME || 'HoneyChain',
  appIdentifier: import.meta.env?.VITE_APP_IDENTIFIER || 'com.honeychain.app',
  blockchainNetwork: import.meta.env?.VITE_BLOCKCHAIN_NETWORK || 'local-simulated',
  isNative: isNativeMobile(),
  platform: getPlatform(),
  apiBaseUrl: getApiBaseUrl(),
};

export default env;
