import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ParentModule } from './parent/parent.module.js';
import { LearningModule } from './learning/learning.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { AchievementsModule } from './achievements/achievements.module.js';
import { AdminModule } from './admin/admin.module.js';
import { JudgeModule } from './judge/judge.module.js';
import { ContestModule } from './contest/contest.module.js';
import { OrganizationModule } from './organization/organization.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ParentModule,
    LearningModule,
    ProfileModule,
    AchievementsModule,
    AdminModule,
    JudgeModule,
    ContestModule,
    OrganizationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

