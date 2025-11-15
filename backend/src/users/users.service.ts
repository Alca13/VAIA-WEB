import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RecoveryToken } from './entities/recovery-token.entity';
import { RecoveryContact, User, UserRole } from './entities/user.entity';

const RECOVERY_TOKEN_TTL_MINUTES = 15;

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  private readonly recoveryTokens: RecoveryToken[] = [];

  async create(createUserDto: CreateUserDto): Promise<User> {
    const now = new Date();
    const user: User = {
      id: uuid(),
      email: createUserDto.email.toLowerCase(),
      passwordHash: await bcrypt.hash(createUserDto.password, 10),
      role: createUserDto.role || 'usuario',
      isBlocked: false,
      twoFactorEnabled: false,
      recovery: this.buildRecoveryContact(createUserDto.recoveryEmail, createUserDto.recoveryPhone),
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User | undefined> {
    const user = await this.findById(userId);
    if (!user) {
      return undefined;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email.toLowerCase();
    }
    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }
    user.recovery = this.buildRecoveryContact(updateUserDto.recoveryEmail, updateUserDto.recoveryPhone, user.recovery);
    user.updatedAt = new Date();
    return user;
  }

  async remove(userId: string): Promise<void> {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email.toLowerCase());
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async setTwoFactorSecret(userId: string, secret: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.twoFactorSecret = secret;
    user.updatedAt = new Date();
  }

  async enableTwoFactor(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.twoFactorEnabled = true;
    user.updatedAt = new Date();
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.twoFactorEnabled = false;
    delete user.twoFactorSecret;
    user.updatedAt = new Date();
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
  }

  async setBlocked(userId: string, blocked: boolean): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;
    user.isBlocked = blocked;
    user.updatedAt = new Date();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async createRecoveryToken(userId: string, deliveredTo: string): Promise<RecoveryToken> {
    const token: RecoveryToken = {
      token: uuid(),
      userId,
      deliveredTo,
      expiresAt: new Date(Date.now() + RECOVERY_TOKEN_TTL_MINUTES * 60000),
    };
    this.recoveryTokens.push(token);
    return token;
  }

  async validateRecoveryToken(userId: string, token: string): Promise<boolean> {
    const now = new Date();
    const stored = this.recoveryTokens.find((item) => item.userId === userId && item.token === token);
    if (!stored) return false;
    if (stored.expiresAt < now) return false;
    this.recoveryTokens.splice(this.recoveryTokens.indexOf(stored), 1);
    return true;
  }

  private buildRecoveryContact(
    email?: string,
    phone?: string,
    fallback: RecoveryContact = {},
  ): RecoveryContact {
    return {
      email: email ?? fallback.email,
      phone: phone ?? fallback.phone,
    };
  }

  async ensureSeededAdmin(): Promise<User> {
    let admin = this.users.find((user) => user.role === 'admin');
    if (!admin) {
      admin = {
        id: uuid(),
        email: 'admin@vaia.local',
        passwordHash: await bcrypt.hash('Admin1234', 10),
        role: 'admin',
        isBlocked: false,
        twoFactorEnabled: false,
        recovery: { email: 'admin@vaia.local' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.push(admin);
    }
    return admin;
  }

  async getSafeUser(user: User): Promise<Omit<User, 'passwordHash' | 'twoFactorSecret'>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return safe;
  }

  async listSafeUsers(): Promise<Array<Omit<User, 'passwordHash' | 'twoFactorSecret'>>> {
    return Promise.all(this.users.map((user) => this.getSafeUser(user)));
  }
}
