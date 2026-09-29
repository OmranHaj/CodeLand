import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  /**
   * Endpoint: GET /achievements
   * Lists all available badges across the curriculum.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllAchievements() {
    return this.achievementsService.getAllAchievements();
  }

  /**
   * Endpoint: GET /achievements/me
   * Lists all unlocked/earned badges for the current authenticated user.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyAchievements(@Request() req: RequestWithUser) {
    return this.achievementsService.getMyAchievements(req.user.id);
  }
}
