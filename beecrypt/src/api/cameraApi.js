import apiClient from './apiClient';
import { getApiBaseUrl } from '../config/env.js';

export const cameraApi = {
  /**
   * Probe ESP32-CAM online status and latency.
   */
  async getStatus() {
    return apiClient.get('/camera/status');
  },

  /**
   * Dispatch trigger to ESP32-CAM, stream frame into MongoDB GridFS,
   * and receive capture metadata.
   */
  async capture(hiveId) {
    return apiClient.post('/camera/capture', { hiveId });
  },

  /**
   * Fetch structured metadata for a specific capture ID.
   */
  async getCapture(captureId) {
    return apiClient.get(`/camera/captures/${encodeURIComponent(captureId)}`);
  },

  /**
   * Fetch recent captures, optionally filtered by hiveId.
   */
  async getCaptures(hiveId) {
    const query = hiveId ? `?hiveId=${encodeURIComponent(hiveId)}` : '';
    return apiClient.get(`/camera/captures${query}`);
  },

  /**
   * Resolve direct image URL for an <img> tag with token authorization.
   */
  getCaptureImageUrl(captureId) {
    const baseUrl = getApiBaseUrl();
    const token = localStorage.getItem('beecrypt_token');
    const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${baseUrl}/camera/captures/${encodeURIComponent(captureId)}/image${tokenParam}`;
  },

  /**
   * Download image binary as Blob for client processing (e.g. AI analysis).
   */
  async getCaptureImageBlob(captureId) {
    const baseUrl = getApiBaseUrl();
    const token = localStorage.getItem('beecrypt_token');
    const response = await fetch(`${baseUrl}/camera/captures/${encodeURIComponent(captureId)}/image`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      let message = `Failed to fetch captured image (HTTP ${response.status})`;
      try {
        const data = await response.json();
        message = data.error || message;
      } catch {}
      throw new Error(message);
    }

    const blob = await response.blob();
    return {
      blob,
      url: URL.createObjectURL(blob),
      fileName: `${captureId}.jpg`,
    };
  },

  /**
   * Backward-compatibility helper for latest image.
   */
  async getLatestImage() {
    const baseUrl = getApiBaseUrl();
    const token = localStorage.getItem('beecrypt_token');
    const response = await fetch(`${baseUrl}/camera/latest-image`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
    });

    if (!response.ok) {
      let message = `Camera image request failed with status ${response.status}`;
      try {
        const body = await response.json();
        message = body.error || message;
      } catch {}
      throw new Error(message);
    }

    const blob = await response.blob();
    return {
      blob,
      url: URL.createObjectURL(blob),
      fileName: `esp32_frame_${Date.now()}.jpg`,
    };
  },
};

export default cameraApi;