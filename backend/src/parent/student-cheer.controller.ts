import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ParentService } from './parent.service.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentCheerController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * Endpoint: GET /student/cheers
   * Retrieves all unread cheer messages for the authenticated student.
   */
  @Get('cheers')
  @HttpCode(HttpStatus.OK)
  async getMyCheers(@Request() req: RequestWithUser) {
    return this.parentService.getStudentCheers(req.user.id);
  }

  /**
   * Endpoint: PATCH /student/cheers/:id/read
   * Marks a specific cheer message as read.
   */
  @Patch('cheers/:id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Request() req: RequestWithUser,
    @Param('id') cheerId: string,
  ) {
    return this.parentService.markCheerAsRead(req.user.id, cheerId);
  }
}
