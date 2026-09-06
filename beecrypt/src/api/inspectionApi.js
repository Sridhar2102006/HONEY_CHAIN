import apiClient from './apiClient';

export const inspectionApi = {
  async listInspections(hiveId) {
    const query = hiveId ? `?hiveId=${encodeURIComponent(hiveId)}` : '';
    return apiClient.get(`/inspections${query}`);
  },

  async recordInspection(inspectionData) {
    return apiClient.post('/inspections', inspectionData);
  },
};

export default inspectionApi;
