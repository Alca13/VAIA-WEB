export interface Device {
  id: string;
  userId: string;
  fingerprint: string;
  token: string;
  isAuthorized: boolean;
  lastUsedAt: Date;
  createdAt: Date;
}
