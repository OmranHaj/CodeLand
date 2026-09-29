import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ProfileService } from './profile.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Endpoint: GET /profile
   * Retrieves the current authenticated user's profile and settings.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: RequestWithUser) {
    return this.profileService.getProfile(req.user.id);
  }

  /**
   * Endpoint: PUT /profile
   * Updates the current authenticated user's profile settings.
   */
  @Put()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(req.user.id, dto);
  }
}
