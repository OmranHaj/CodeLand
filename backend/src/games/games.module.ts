import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { JudgeModule } from '../judge/judge.module.js';
import { LearningModule } from '../learning/learning.module.js';
import { GameVerifierService } from './game-verifier.service.js';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';

@Module({
  imports: [PrismaModule, AuthModule, JudgeModule, LearningModule],
  controllers: [GamesController],
  providers: [GamesService, GameVerifierService],
  exports: [GamesService],
})
export class GamesModule {}
