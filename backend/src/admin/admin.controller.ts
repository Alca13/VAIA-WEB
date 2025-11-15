import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string, @Body('blocked') blocked: boolean) {
    return this.adminService.blockUser(id, blocked);
  }

  @Post('users/:id/reset')
  forceReset(@Param('id') id: string) {
    return this.adminService.forcePasswordReset(id);
  }

  @Get('devices')
  listDevices() {
    return this.adminService.listDevices();
  }

  @Post('devices/:id/authorize')
  authorizeDevice(@Param('id') id: string) {
    return this.adminService.authorizeDevice(id);
  }

  @Post('devices/:id/revoke')
  revokeDevice(@Param('id') id: string) {
    return this.adminService.revokeDevice(id);
  }
}
