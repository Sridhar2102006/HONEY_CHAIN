import apiClient from './apiClient';

export const eventApi = {
  async getBatchTimeline(batchId) {
    const query = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
    return apiClient.get(`/events${query}`);
  },

  async recordEvent(eventData) {
    return apiClient.post('/events', eventData);
  },
};

export default eventApi;
