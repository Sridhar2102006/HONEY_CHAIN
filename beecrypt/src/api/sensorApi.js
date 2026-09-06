import apiClient from './apiClient';
import { getApiBaseUrl } from '../config/env';

export const sensorApi = {
  /**
   * Fetch the latest sensor reading from MongoDB.
   * Useful for initializing the dashboard instantly on page load.
   */
  async getLatest({ hiveId, deviceId } = {}) {
    const params = new URLSearchParams();
    if (hiveId) params.append('hiveId', hiveId);
    if (deviceId) params.append('deviceId', deviceId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/sensors/latest${query}`);
  },

  /**
   * Fetch historical sensor readings for charts and analytics.
   */
  async getHistory({ hiveId, deviceId, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (hiveId) params.append('hiveId', hiveId);
    if (deviceId) params.append('deviceId', deviceId);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/sensors/history${query}`);
  },

  /**
   * Subscribe to real-time telemetry stream via Server-Sent Events (SSE).
   * Native browser EventSource reconnects automatically on network drops.
   *
   * @param {Object} options
   * @param {string} [options.hiveId] - Target hive filter
   * @param {string} [options.deviceId] - Target device filter
   * @param {Function} options.onReading - Callback when a new reading arrives
   * @param {Function} [options.onConnected] - Callback when SSE stream connects
   * @param {Function} [options.onError] - Callback on stream connection error
   * @returns {Function} Unsubscribe function to cleanly close the stream
   */
  subscribeToStream({ hiveId, deviceId, onReading, onConnected, onError } = {}) {
    const params = new URLSearchParams();
    if (hiveId) params.append('hiveId', hiveId);
    if (deviceId) params.append('deviceId', deviceId);
    const query = params.toString() ? `?${params.toString()}` : '';

    const streamUrl = `${getApiBaseUrl()}/sensors/stream${query}`;
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener('connected', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onConnected) onConnected(data);
      } catch (err) {
        console.warn('[SSE] Failed to parse connected event:', err);
      }
    });

    eventSource.addEventListener('sensor.telemetry', (event) => {
      try {
        const reading = JSON.parse(event.data);
        if (onReading) onReading(reading);
      } catch (err) {
        console.warn('[SSE] Failed to parse sensor.telemetry event:', err);
      }
    });

    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };

    return () => {
      eventSource.close();
    };
  },
};

export default sensorApi;
