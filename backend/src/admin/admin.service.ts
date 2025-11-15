import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly devicesService: DevicesService,
  ) {}

  async listUsers() {
    return this.usersService.listSafeUsers();
  }

  async blockUser(userId: string, blocked: boolean) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.usersService.setBlocked(userId, blocked);
    return this.usersService.getSafeUser({ ...user, isBlocked: blocked });
  }

  async forcePasswordReset(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const contact = user.recovery.email ?? user.recovery.phone;
    if (!contact) {
      throw new NotFoundException('No hay contacto de recuperación configurado');
    }
    const token = await this.usersService.createRecoveryToken(userId, contact);
    // eslint-disable-next-line no-console
    console.log(`Token de restablecimiento forzado (${contact}): ${token.token}`);
    return { deliveredTo: contact };
  }

  async listDevices() {
    return this.devicesService.listAll();
  }

  async authorizeDevice(deviceId: string) {
    const device = await this.devicesService.authorizeDevice(deviceId);
    if (!device) {
      throw new NotFoundException('Dispositivo no encontrado');
    }
    return device;
  }

  async revokeDevice(deviceId: string) {
    await this.devicesService.revokeDevice(deviceId);
  }
}
