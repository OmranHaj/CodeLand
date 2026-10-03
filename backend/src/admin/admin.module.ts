import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminUsersController } from './admin-users.controller.js';
import { AdminUsersService } from './admin-users.service.js';
import { AdminGuard } from './guards/admin.guard.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminGuard],
  exports: [AdminUsersService, AdminGuard],
})
export class AdminModule {}
