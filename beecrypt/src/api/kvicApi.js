import apiClient from './apiClient';

export const kvicApi = {
  async listApplications() {
    return apiClient.get('/kvic/applications');
  },

  async reviewApplication(id, status) {
    return apiClient.patch(`/kvic/applications/${encodeURIComponent(id)}`, { status });
  },

  async listUsers() {
    return apiClient.get('/kvic/users');
  },

  async listOrganizations() {
    return apiClient.get('/kvic/organizations');
  },
};

export default kvicApi;
