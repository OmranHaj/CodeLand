import { Module } from '@nestjs/common';
import { JudgeController } from './judge.controller.js';
import { JudgeService } from './judge.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminModule } from '../admin/admin.module.js';
import { LearningModule } from '../learning/learning.module.js';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, LearningModule],
  controllers: [JudgeController],
  providers: [JudgeService],
  exports: [JudgeService],
})
export class JudgeModule {}
