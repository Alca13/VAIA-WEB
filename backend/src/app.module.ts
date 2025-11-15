import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { AdminModule } from './admin/admin.module';
import { AppService } from './app.service';

@Module({
  imports: [UsersModule, DevicesModule, AuthModule, AdminModule],
  providers: [AppService],
})
export class AppModule {}
