import apiClient from './apiClient';

export const notificationApi = {
  async listNotifications() {
    return apiClient.get('/notifications');
  },

  async markNotificationRead(id) {
    return apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
  },

  async listAlerts() {
    return apiClient.get('/notifications/alerts');
  },
};

export default notificationApi;
