import apiClient from './apiClient';

export const hiveApi = {
  async listHives(producerId) {
    const query = producerId ? `?producerId=${encodeURIComponent(producerId)}` : '';
    return apiClient.get(`/hives${query}`);
  },

  async getHive(hiveId) {
    return apiClient.get(`/hives/${encodeURIComponent(hiveId)}`);
  },

  async createHive(hiveData) {
    return apiClient.post('/hives', hiveData);
  },

  async updateHive(hiveId, updates) {
    return apiClient.patch(`/hives/${encodeURIComponent(hiveId)}`, updates);
  },
};

export default hiveApi;
