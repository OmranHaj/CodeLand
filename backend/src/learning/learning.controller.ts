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
import { SubmitChallengeDto } from './dto/submit-challenge.dto.js';
import { SubmitProjectDto } from './dto/submit-project.dto.js';

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

  /**
   * Endpoint: POST /learning/challenges/submit
   * Records code challenge submission and awards XP if completed successfully.
   */
  @UseGuards(JwtAuthGuard)
  @Post('challenges/submit')
  @HttpCode(HttpStatus.OK)
  async submitChallenge(
    @Request() req: RequestWithUser,
    @Body() dto: SubmitChallengeDto,
  ) {
    return this.learningService.submitChallenge(
      req.user.id,
      dto.challengeId,
      dto.submittedCode,
      dto.passed,
      dto.xpEarned ?? 50,
    );
  }

  /**
   * Endpoint: GET /learning/challenges/my-submissions
   * Retrieves all challenge submissions for the authenticated student.
   */
  @UseGuards(JwtAuthGuard)
  @Get('challenges/my-submissions')
  @HttpCode(HttpStatus.OK)
  async getMySubmissions(@Request() req: RequestWithUser) {
    return this.learningService.getMyChallengeSubmissions(req.user.id);
  }

  /**
   * Endpoint: POST /learning/projects/submit
   * Records a student project submission and awards relevant milestone achievements.
   */
  @UseGuards(JwtAuthGuard)
  @Post('projects/submit')
  @HttpCode(HttpStatus.OK)
  async submitProject(
    @Request() req: RequestWithUser,
    @Body() dto: SubmitProjectDto,
  ) {
    return this.learningService.submitProject(
      req.user.id,
      dto.levelId,
      dto.sourceCode,
      dto.reviewChecks,
      dto.score,
      dto.passed,
    );
  }

  /**
   * Endpoint: POST /learning/milestones/evaluate
   * Manually triggers milestone evaluation for current student.
   */
  @UseGuards(JwtAuthGuard)
  @Post('milestones/evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateMilestones(@Request() req: RequestWithUser) {
    const newlyAwarded = await this.learningService.checkAndAwardMilestones(req.user.id);
    return {
      success: true,
      newlyAwarded,
    };
  }
}
