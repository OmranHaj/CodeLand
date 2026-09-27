import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { LearningController } from './learning.controller.js';
import { LearningService } from './learning.service.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
