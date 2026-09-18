import apiClient from './apiClient';

export const eventApi = {
  async getBatchTimeline(batchId) {
    const query = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
    return apiClient.get(`/events${query}`);
  },

  async getPublicVerification(batchId) {
    return apiClient.get(`/events/public?batchId=${encodeURIComponent(batchId)}`);
  },

  async recordEvent(eventData) {
    return apiClient.post('/events', eventData);
  },
};

export default eventApi;
