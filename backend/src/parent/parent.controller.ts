import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParentService } from './parent.service.js';
import { Role } from '@prisma/client';
import { SendCheerDto } from './dto/send-cheer.dto.js';
import { LinkChildDto } from './dto/link-child.dto.js';
import { UpdateChildGoalDto } from './dto/update-child-goal.dto.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    parentCode: string | null;
    parentId: string | null;
  };
}

@Controller('parent')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * Endpoint: GET /parent/children
   * Returns all children registered and linked under the authenticated parent account.
   */
  @Get('children')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Request() req: RequestWithUser) {
    if (req.user.role !== Role.PARENT) {
      throw new ForbiddenException('Only parent accounts can access this resource.');
    }

    const children = await this.parentService.getChildren(req.user.id);

    return {
      success: true,
      count: children.length,
      children,
    };
  }

  /**
   * Endpoint: POST /parent/cheer
   * Sends an encouraging cheer message to a linked child account.
   */
  @Post('cheer')
  @HttpCode(HttpStatus.CREATED)
  async sendCheer(@Request() req: RequestWithUser, @Body() dto: SendCheerDto) {
    if (req.user.role !== Role.PARENT) {
      throw new ForbiddenException('Only parent accounts can send cheer messages.');
    }

    return this.parentService.sendCheer(req.user.id, dto.childId, dto.message);
  }

  /**
   * Endpoint: POST /parent/link-child
   * Links a student to the authenticated parent account.
   */
  @Post('link-child')
  @HttpCode(HttpStatus.OK)
  async linkChild(@Request() req: RequestWithUser, @Body() dto: LinkChildDto) {
    if (req.user.role !== Role.PARENT) {
      throw new ForbiddenException('Only parent accounts can link student accounts.');
    }

    return this.parentService.linkChild(req.user.id, dto.studentIdentifier);
  }

  /**
   * Endpoint: PATCH /parent/children/:childId/goal
   * Updates weekly goal hours for a linked child.
   */
  @Patch('children/:childId/goal')
  @HttpCode(HttpStatus.OK)
  async updateGoal(
    @Request() req: RequestWithUser,
    @Param('childId') childId: string,
    @Body() dto: UpdateChildGoalDto,
  ) {
    if (req.user.role !== Role.PARENT) {
      throw new ForbiddenException('Only parent accounts can update student goals.');
    }

    return this.parentService.updateChildGoal(
      req.user.id,
      childId,
      dto.weeklyGoalHours,
    );
  }
}
