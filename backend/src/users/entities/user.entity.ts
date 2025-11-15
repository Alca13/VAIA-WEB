export type UserRole = 'admin' | 'usuario' | 'directivo';

export interface RecoveryContact {
  email?: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isBlocked: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  recovery: RecoveryContact;
  createdAt: Date;
  updatedAt: Date;
}
