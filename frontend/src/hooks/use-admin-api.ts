import { useCallback } from 'react';
import { adminApi } from '../services/admin-api';

export const useAdminApi = () => {
  const fetchUsers = useCallback(() => adminApi.getUsers(), []);
  const fetchDevices = useCallback(() => adminApi.getDevices(), []);
  const blockUser = useCallback((userId: string, blocked: boolean) => adminApi.blockUser(userId, blocked), []);
  const authorizeDevice = useCallback((deviceId: string) => adminApi.authorizeDevice(deviceId), []);
  const revokeDevice = useCallback((deviceId: string) => adminApi.revokeDevice(deviceId), []);
  const forceReset = useCallback((userId: string) => adminApi.forceReset(userId), []);
  const sendRecovery = useCallback((email: string) => adminApi.sendRecovery(email), []);

  return { fetchUsers, fetchDevices, blockUser, authorizeDevice, revokeDevice, forceReset, sendRecovery };
};
