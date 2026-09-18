import apiClient from './apiClient';
import storageService from '../services/storageService.js';

export const authApi = {
  async login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password });
    if (data.token) {
      await storageService.setToken(data.token);
    }
    return data;
  },

  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await storageService.removeToken();
    }
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async register(registrationData) {
    return apiClient.post('/auth/register', registrationData);
  },

  async requestOtp(email, purpose = 'VERIFY_EMAIL') {
    return apiClient.post('/auth/request-otp', { email, purpose });
  },

  async verifyOtp(email, otp, purpose = 'VERIFY_EMAIL') {
    return apiClient.post('/auth/verify-otp', { email, otp, purpose });
  },
};

export default authApi;
