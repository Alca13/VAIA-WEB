import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as speakeasy from 'speakeasy';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';

const JWT_EXPIRATION = '1h';
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const matches = await this.usersService.validatePassword(user, password);
    if (!matches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.isBlocked) {
      throw new ForbiddenException('La cuenta está bloqueada');
    }
    return user;
  }

  async login(payload: LoginDto): Promise<{
    accessToken?: string;
    deviceToken?: string;
    twoFactorRequired?: boolean;
    deviceAuthorizationRequired?: boolean;
    userId: string;
  }> {
    const user = await this.validateUser(payload.email, payload.password);

    const { valid, device } = await this.devicesService.validateAccess(user, payload.fingerprint);
    if (!valid) {
      const registered = await this.devicesService.registerDevice(user, payload.fingerprint);
      return {
        userId: user.id,
        deviceToken: registered.token,
        deviceAuthorizationRequired: true,
      };
    }

    if (user.twoFactorEnabled) {
      if (!payload.totp) {
        return {
          userId: user.id,
          twoFactorRequired: true,
        };
      }
      const ok = speakeasy.totp.verify({
        secret: user.twoFactorSecret!,
        encoding: 'base32',
        token: payload.totp,
      });
      if (!ok) {
        throw new UnauthorizedException('Código TOTP inválido');
      }
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      { secret: JWT_SECRET, expiresIn: JWT_EXPIRATION },
    );

    let currentDevice: Device | undefined = device;
    if (!currentDevice) {
      currentDevice = await this.devicesService.registerDevice(user, payload.fingerprint);
    }

    return {
      userId: user.id,
      accessToken,
      deviceToken: currentDevice.token,
    };
  }

  async generateTwoFactorSecret(user: User): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `VAIA (${user.email})`,
    });
    await this.usersService.setTwoFactorSecret(user.id, secret.base32);
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url ?? '' };
  }

  async verifyTwoFactor(user: User, code: string): Promise<boolean> {
    if (!user.twoFactorSecret) {
      throw new ForbiddenException('Aún no se generó un secreto 2FA');
    }
    const ok = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });
    if (ok) {
      await this.usersService.enableTwoFactor(user.id);
    }
    return ok;
  }

  async disableTwoFactor(userId: string): Promise<void> {
    await this.usersService.disableTwoFactor(userId);
  }

  async buildTokenPayload(user: User): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      { secret: JWT_SECRET, expiresIn: JWT_EXPIRATION },
    );
    return { accessToken };
  }
}
