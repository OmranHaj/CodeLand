import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LearningService } from './learning.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CompleteLessonDto } from './dto/complete-lesson.dto.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  /**
   * Endpoint: GET /learning/levels/:levelId
   * Retrieves all published lessons and challenges for a specific level from the database.
   */
  @Get('levels/:levelId')
  @HttpCode(HttpStatus.OK)
  async getLevelContent(@Param('levelId') levelId: string) {
    return this.learningService.getLevelContent(levelId);
  }

  /**
   * Endpoint: GET /learning/levels
   * Retrieves all available levels in the curriculum.
   */
  @Get('levels')
  @HttpCode(HttpStatus.OK)
  async getAllLevels() {
    return this.learningService.getAllLevels();
  }

  /**
   * Endpoint: POST /learning/complete-lesson
   * Records lesson completion for authenticated student, updates XP and daily activity.
   */
  @UseGuards(JwtAuthGuard)
  @Post('complete-lesson')
  @HttpCode(HttpStatus.OK)
  async completeLesson(
    @Request() req: RequestWithUser,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.learningService.completeLesson(
      req.user.id,
      dto.levelId,
      dto.lessonId,
      dto.xpEarned ?? 25,
      dto.unitType,
    );
  }

  /**
   * Endpoint: GET /learning/progress/me
   * Retrieves all progress records for authenticated student.
   */
  @UseGuards(JwtAuthGuard)
  @Get('progress/me')
  @HttpCode(HttpStatus.OK)
  async getMyProgress(@Request() req: RequestWithUser) {
    return this.learningService.getStudentProgress(req.user.id);
  }
}
