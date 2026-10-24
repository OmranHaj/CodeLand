import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OrganizationService } from './organization.service.js';
import { JoinOrganizationDto } from './dto/join-organization.dto.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@Controller('organization')
@UseGuards(JwtAuthGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  private assertStudent(req: RequestWithUser) {
    if (req.user.role !== Role.CHILD) {
      throw new ForbiddenException('Only student accounts can join an organization.');
    }
  }

  private assertOrganization(req: RequestWithUser) {
    if (req.user.role !== Role.PARENT) {
      throw new ForbiddenException('Only organization accounts can manage join requests.');
    }
  }

  /**
   * Endpoint: GET /organization/membership
   * The signed-in student's organization and latest join request.
   */
  @Get('membership')
  @HttpCode(HttpStatus.OK)
  async getMembership(@Request() req: RequestWithUser) {
    this.assertStudent(req);
    return this.organizationService.getMembership(req.user.id);
  }

  /**
   * Endpoint: POST /organization/join-requests
   * The signed-in student asks to join the organization that owns the code.
   */
  @Post('join-requests')
  @HttpCode(HttpStatus.CREATED)
  async requestToJoin(@Request() req: RequestWithUser, @Body() dto: JoinOrganizationDto) {
    this.assertStudent(req);
    return this.organizationService.requestToJoin(req.user.id, dto.code);
  }

  /**
   * Endpoint: GET /organization/join-requests
   * Pending requests for the signed-in organization.
   */
  @Get('join-requests')
  @HttpCode(HttpStatus.OK)
  async listRequests(@Request() req: RequestWithUser) {
    this.assertOrganization(req);
    return this.organizationService.listPendingRequests(req.user.id);
  }

  /**
   * Endpoint: POST /organization/join-requests/:id/accept
   */
  @Post('join-requests/:id/accept')
  @HttpCode(HttpStatus.OK)
  async accept(@Request() req: RequestWithUser, @Param('id', ParseUUIDPipe) id: string) {
    this.assertOrganization(req);
    return this.organizationService.decide(req.user.id, id, true);
  }

  /**
   * Endpoint: POST /organization/join-requests/:id/reject
   */
  @Post('join-requests/:id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(@Request() req: RequestWithUser, @Param('id', ParseUUIDPipe) id: string) {
    this.assertOrganization(req);
    return this.organizationService.decide(req.user.id, id, false);
  }
}
