export interface RecoveryToken {
  token: string;
  userId: string;
  expiresAt: Date;
  deliveredTo: string;
}
