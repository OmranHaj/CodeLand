import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminUsersService } from './admin-users.service.js';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto.js';
import { UpdateUserRoleDto } from './dto/update-user-role.dto.js';
import { UpdateUserStatusDto } from './dto/update-user-status.dto.js';
import { AdminGuard } from './guards/admin.guard.js';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * Endpoint: GET /admin/users/stats
   * Retrieves summary statistics for the user management dashboard.
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.adminUsersService.getStats();
  }

  /**
   * Endpoint: GET /admin/users/audit-logs
   * Retrieves recent administrator security audit events.
   */
  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.adminUsersService.getAuditLogs(limit ? Number(limit) : 30);
  }

  /**
   * Endpoint: GET /admin/users
   * Retrieves paginated, filtered, and searchable user list.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.adminUsersService.getUsers(query);
  }

  /**
   * Endpoint: GET /admin/users/:id
   * Retrieves safe, detailed information for a specific user.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserDetails(@Param('id') id: string) {
    return this.adminUsersService.getUserDetails(id);
  }

  /**
   * Endpoint: PATCH /admin/users/:id/status
   * Suspends or reactivates a user account.
   */
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateUserStatus(req.user.id, id, dto);
  }

  /**
   * Endpoint: PATCH /admin/users/:id/role
   * Promotes, demotes, or changes the role of an eligible user.
   */
  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminUsersService.updateUserRole(req.user.id, id, dto);
  }
}
