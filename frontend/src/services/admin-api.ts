import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = import.meta.env.VITE_ADMIN_TOKEN;

if (token) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export const adminApi = {
  async getUsers() {
    const { data } = await api.get('/admin/users');
    return data;
  },
  async getDevices() {
    const { data } = await api.get('/admin/devices');
    return data;
  },
  async blockUser(userId: string, blocked: boolean) {
    const { data } = await api.patch(`/admin/users/${userId}/block`, { blocked });
    return data;
  },
  async forceReset(userId: string) {
    const { data } = await api.post(`/admin/users/${userId}/reset`);
    return data;
  },
  async authorizeDevice(deviceId: string) {
    const { data } = await api.post(`/admin/devices/${deviceId}/authorize`);
    return data;
  },
  async revokeDevice(deviceId: string) {
    await api.post(`/admin/devices/${deviceId}/revoke`);
  },
  async sendRecovery(email: string) {
    const { data } = await api.post('/auth/recovery', { email });
    return data;
  },
};
