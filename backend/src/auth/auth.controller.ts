import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { VerifyTwoFactorDto } from './dto/verify-twofa.dto';
import { Request } from 'express';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestRecoveryDto } from './dto/request-recovery.dto';
import { DevicesService } from '../devices/devices.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return this.usersService.getSafeUser(user);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  async generateTwoFactor(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new Error('Usuario no encontrado');
    return this.authService.generateTwoFactorSecret(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactor(@Req() req: AuthenticatedRequest, @Body() dto: VerifyTwoFactorDto) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new Error('Usuario no encontrado');
    const ok = await this.authService.verifyTwoFactor(user, dto.code);
    if (!ok) {
      throw new Error('Código inválido');
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('2fa/disable')
  async disableTwoFactor(@Req() req: AuthenticatedRequest) {
    await this.authService.disableTwoFactor(req.user.userId);
    return { success: true };
  }

  @Post('recovery')
  async requestRecovery(@Body() dto: RequestRecoveryDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { success: true };
    }
    const contact = user.recovery.email ?? user.recovery.phone;
    if (!contact) {
      return { success: false, message: 'No hay contacto de recuperación configurado' };
    }
    const token = await this.usersService.createRecoveryToken(user.id, contact);
    // eslint-disable-next-line no-console
    console.log(`Token de recuperación (${contact}): ${token.token}`);
    return { success: true, deliveredTo: contact };
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const user = await this.usersService.findById(dto.userId);
    if (!user) {
      return { success: false };
    }
    const valid = await this.usersService.validateRecoveryToken(user.id, dto.token);
    if (!valid) {
      return { success: false };
    }
    await this.usersService.changePassword(user.id, dto.newPassword);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async listDevices(@Req() req: AuthenticatedRequest) {
    return this.devicesService.listUserDevices(req.user.userId);
  }
}
