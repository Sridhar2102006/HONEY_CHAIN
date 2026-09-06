import apiClient from './apiClient';

export const batchApi = {
  async listBatches(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.producerId) searchParams.append('producerId', params.producerId);
    if (params.processorId) searchParams.append('processorId', params.processorId);
    if (params.stage) searchParams.append('stage', params.stage);
    if (params.certStatus) searchParams.append('certStatus', params.certStatus);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get(`/batches${query}`);
  },

  async getBatch(batchId) {
    return apiClient.get(`/batches/${encodeURIComponent(batchId)}`);
  },

  async createBatch(batchData) {
    return apiClient.post('/batches', batchData);
  },

  async updateBatch(batchId, updates) {
    return apiClient.patch(`/batches/${encodeURIComponent(batchId)}`, updates);
  },

  async splitBatch(batchId, splits, reason) {
    return apiClient.post(`/batches/${encodeURIComponent(batchId)}/split`, { splits, reason });
  },
};

export default batchApi;
