import apiClient from './apiClient';

export const labApi = {
  async listTestRequests(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.labId) searchParams.append('labId', params.labId);
    if (params.batchId) searchParams.append('batchId', params.batchId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/lab/test-requests${query}`);
  },

  async submitSampleRequest(payload) {
    return apiClient.post('/lab/test-requests', payload);
  },

  async listQualityResults(batchId) {
    const query = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
    return apiClient.get(`/lab/quality-results${query}`);
  },

  async saveAnalysis(payload) {
    return apiClient.post('/lab/quality-results', payload);
  },

  async listCertificates(batchId) {
    const query = batchId ? `?batchId=${encodeURIComponent(batchId)}` : '';
    return apiClient.get(`/lab/certificates${query}`);
  },

  async issueCertificate(payload) {
    return apiClient.post('/lab/certificates', payload);
  },
};

export default labApi;
