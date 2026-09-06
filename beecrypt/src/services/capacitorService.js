import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNativeMobile } from '../config/env.js';

// Global network listener callbacks
const networkListeners = new Set();
let isAppOnline = true;

/**
 * Native Capacitor bridge service.
 */
export const capacitorService = {
  /**
   * Initializes native presentation (Status bar, Splash screen, Hardware back button).
   * Safe to call on all platforms (no-ops gracefully on web).
   */
  async initNativeApp(navigate) {
    if (!isNativeMobile()) {
      // On web, listen to standard browser online/offline events
      window.addEventListener('online', () => this.notifyNetworkChange(true));
      window.addEventListener('offline', () => this.notifyNetworkChange(false));
      return;
    }

    try {
      // 1. Configure Native Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#17201A' });
    } catch (err) {
      console.warn('[Capacitor] StatusBar configuration note:', err.message);
    }

    try {
      // 2. Hide Native Splash Screen smoothly after React mounts
      await this.hideSplashScreen();
    } catch (err) {
      console.warn('[Capacitor] SplashScreen note:', err.message);
    }

    try {
      // 3. Android Hardware Back Button Handler
      App.addListener('backButton', ({ canGoBack }) => {
        // Check if any open modal / backdrop exists
        const openModalCloseBtn = document.querySelector('[data-modal-close], button[aria-label="Close"]');
        if (openModalCloseBtn) {
          openModalCloseBtn.click();
          return;
        }

        const currentPath = window.location.pathname;
        const isRootScreen =
          currentPath === '/' ||
          currentPath === '/welcome' ||
          currentPath === '/login' ||
          currentPath === '/app' ||
          currentPath === '/app/beekeeper' ||
          currentPath === '/app/processor' ||
          currentPath === '/app/laboratory' ||
          currentPath === '/app/retailer' ||
          currentPath === '/app/kvic';

        if (!isRootScreen && canGoBack && navigate) {
          navigate(-1);
        } else {
          // At root screen, minimize app instead of killing
          App.minimizeApp().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('[Capacitor] App backButton listener note:', err.message);
    }

    try {
      // 4. Real-time Native Network Status Listener
      const status = await Network.getStatus();
      isAppOnline = status.connected;

      Network.addListener('networkStatusChange', (netStatus) => {
        this.notifyNetworkChange(netStatus.connected);
      });
    } catch (err) {
      console.warn('[Capacitor] Network listener note:', err.message);
    }
  },

  /**
   * Register a subscriber for network status changes.
   */
  onNetworkChange(callback) {
    networkListeners.add(callback);
    callback(isAppOnline);
    return () => networkListeners.delete(callback);
  },

  notifyNetworkChange(connected) {
    isAppOnline = connected;
    for (const cb of networkListeners) {
      try {
        cb(connected);
      } catch {}
    }
  },

  getIsOnline() {
    return isAppOnline;
  },

  /**
   * Dismiss the native splash screen smoothly.
   */
  async hideSplashScreen() {
    if (!isNativeMobile()) return;
    try {
      await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (err) {
      console.warn('[Capacitor] SplashScreen hide note:', err.message);
    }
  },

  /**
   * Tactile haptic feedback on user action.
   */
  async hapticTap(style = ImpactStyle.Light) {
    if (!isNativeMobile()) return;
    try {
      await Haptics.impact({ style });
    } catch {}
  },

  async hapticNotification(type = NotificationType.Success) {
    if (!isNativeMobile()) return;
    try {
      await Haptics.notification({ type });
    } catch {}
  },
};

export default capacitorService;
