import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { Device } from './entities/device.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DevicesService {
  private readonly devices: Device[] = [];

  async registerDevice(user: User, fingerprint: string): Promise<Device> {
    let device = this.devices.find((item) => item.userId === user.id && item.fingerprint === fingerprint);
    if (!device) {
      device = {
        id: uuid(),
        userId: user.id,
        fingerprint,
        token: uuid(),
        isAuthorized: user.role !== 'usuario' ? false : true,
        createdAt: new Date(),
        lastUsedAt: new Date(),
      };
      this.enforceRolePolicies(user, device);
      this.devices.push(device);
    } else {
      device.token = uuid();
      device.lastUsedAt = new Date();
    }
    return device;
  }

  async authorizeDevice(deviceId: string): Promise<Device | undefined> {
    const device = this.devices.find((item) => item.id === deviceId);
    if (device) {
      device.isAuthorized = true;
      device.lastUsedAt = new Date();
    }
    return device;
  }

  async revokeDevice(deviceId: string): Promise<void> {
    const index = this.devices.findIndex((item) => item.id === deviceId);
    if (index >= 0) {
      this.devices.splice(index, 1);
    }
  }

  async listUserDevices(userId: string): Promise<Device[]> {
    return this.devices.filter((device) => device.userId === userId);
  }

  async listAll(): Promise<Device[]> {
    return [...this.devices];
  }

  async validateAccess(user: User, fingerprint: string): Promise<{ valid: boolean; device?: Device }> {
    const device = this.devices.find((item) => item.userId === user.id && item.fingerprint === fingerprint);
    if (!device) {
      return { valid: user.role === 'usuario', device: undefined };
    }
    if (!device.isAuthorized && user.role !== 'usuario') {
      return { valid: false, device };
    }
    device.lastUsedAt = new Date();
    return { valid: true, device };
  }

  private enforceRolePolicies(user: User, currentDevice: Device): void {
    if (user.role === 'directivo') {
      const existing = this.devices.filter((device) => device.userId === user.id && device.id !== currentDevice.id);
      for (const device of existing) {
        device.isAuthorized = false;
      }
      currentDevice.isAuthorized = false;
    }
    if (user.role === 'admin') {
      currentDevice.isAuthorized = true;
    }
  }
}
