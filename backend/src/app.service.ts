import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users/users.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    await this.usersService.ensureSeededAdmin();
  }
}
