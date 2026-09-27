import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ParentController } from './parent.controller.js';
import { ParentService } from './parent.service.js';
import { AuthModule } from '../auth/auth.module.js';
@Module({
  imports: [PrismaModule , AuthModule],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
