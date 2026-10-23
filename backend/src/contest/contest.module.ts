import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminModule } from '../admin/admin.module.js';
import { JudgeModule } from '../judge/judge.module.js';
import { LearningModule } from '../learning/learning.module.js';
import { AdminArenaProblemsController } from './admin-arena-problems.controller.js';
import { ArenaProblemsController } from './arena-problems.controller.js';
import { ArenaProblemsService } from './arena-problems.service.js';
import { ArenaContestsService } from './arena-contests.service.js';
import { ArenaProblemGeneratorService } from './arena-problem-generator.service.js';
import { ArenaStudentGuard } from './guards/arena-student.guard.js';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, JudgeModule, LearningModule],
  controllers: [AdminArenaProblemsController, ArenaProblemsController],
  providers: [ArenaProblemsService, ArenaContestsService, ArenaProblemGeneratorService, ArenaStudentGuard],
})
export class ContestModule {}
