import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParentService } from './parent.service.js';
import { Role } from '@prisma/client';

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
}
