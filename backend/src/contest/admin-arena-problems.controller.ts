import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ArenaProblemStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../admin/guards/admin.guard.js';
import { ArenaProblemsService } from './arena-problems.service.js';
import { ArenaContestsService } from './arena-contests.service.js';
import { ScheduleArenaContestDto } from './dto/schedule-arena-contest.dto.js';
import {
  GenerateArenaContestDto,
  RegenerateArenaContestDto,
  SetArenaProblemXpDto,
} from './dto/generate-arena-problem.dto.js';
import { UpdateArenaProblemDto } from './dto/update-arena-problem.dto.js';

@Controller('admin/arena')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminArenaProblemsController {
  constructor(
    private readonly arenaProblemsService: ArenaProblemsService,
    private readonly arenaContestsService: ArenaContestsService,
  ) {}

  // ---------------------------------------------------------------------------
  // CONTEST SETS (6 problems generated together)
  // ---------------------------------------------------------------------------

  /**
   * Endpoint: POST /admin/arena/contests/generate
   * Runs ai/generate_contest.py and stores the 6 problems as one DRAFT set for preview.
   */
  @Post('contests/generate')
  @HttpCode(HttpStatus.CREATED)
  async generate(@Request() req: any, @Body() dto: GenerateArenaContestDto) {
    return this.arenaProblemsService.generate(req.user.id, dto);
  }

  /**
   * Endpoint: POST /admin/arena/contests/:batchId/regenerate
   * Replaces the content of all 6 problems of the set in place.
   */
  @Post('contests/:batchId/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerate(
    @Request() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: RegenerateArenaContestDto,
  ) {
    return this.arenaProblemsService.regenerateBatch(req.user.id, batchId, dto);
  }

  /**
   * Endpoint: POST /admin/arena/contests/:batchId/publish
   * Publishes all 6 problems of the set.
   */
  @Post('contests/:batchId/publish')
  @HttpCode(HttpStatus.OK)
  async publishSet(
    @Request() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: ScheduleArenaContestDto,
  ) {
    return this.arenaContestsService.publish(req.user.id, batchId, dto.startsAt, dto.endsAt);
  }

  /**
   * Endpoint: PATCH /admin/arena/contests/:batchId/schedule
   * Sets the live window (server-enforced). Locked once medals were awarded.
   */
  @Patch('contests/:batchId/schedule')
  @HttpCode(HttpStatus.OK)
  async schedule(
    @Request() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: ScheduleArenaContestDto,
  ) {
    return this.arenaContestsService.schedule(req.user.id, batchId, dto.startsAt, dto.endsAt);
  }

  /**
   * Endpoint: GET /admin/arena/contests
   * All contests (current and archived) with schedule, stage and participants.
   */
  @Get('contests')
  @HttpCode(HttpStatus.OK)
  async listContests() {
    return this.arenaContestsService.listForAdmin();
  }

  /**
   * Endpoint: POST /admin/arena/contests/:batchId/unpublish
   * Moves all 6 problems of the set back to DRAFT.
   */
  @Post('contests/:batchId/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublishSet(@Request() req: any, @Param('batchId', ParseUUIDPipe) batchId: string) {
    return this.arenaContestsService.unpublish(req.user.id, batchId);
  }

  /**
   * Endpoint: DELETE /admin/arena/contests/:batchId
   * Deletes / discards the whole set (problems, registrations, attempts and medals).
   */
  @Delete('contests/:batchId')
  @HttpCode(HttpStatus.OK)
  async removeSet(@Request() req: any, @Param('batchId', ParseUUIDPipe) batchId: string) {
    return this.arenaContestsService.remove(req.user.id, batchId);
  }

  // ---------------------------------------------------------------------------
  // INDIVIDUAL PROBLEMS
  // ---------------------------------------------------------------------------

  /**
   * Endpoint: GET /admin/arena/problems?status=DRAFT|PUBLISHED
   * Lists generated problems (drafts and published) without image payloads.
   */
  @Get('problems')
  @HttpCode(HttpStatus.OK)
  async list(@Query('status') status?: string) {
    return this.arenaProblemsService.listForAdmin(status);
  }

  /**
   * Endpoint: GET /admin/arena/problems/:id
   * Full preview of a problem, including hint, image and generation metadata.
   */
  @Get('problems/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.getForAdmin(id);
  }

  /**
   * Endpoint: PATCH /admin/arena/problems/:id
   * Edits problem content and/or XP.
   */
  @Patch('problems/:id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateArenaProblemDto) {
    return this.arenaProblemsService.update(id, dto);
  }

  /**
   * Endpoint: PATCH /admin/arena/problems/:id/xp
   * Sets the problem XP (25, 50, 75, 100, 125 or 150).
   */
  @Patch('problems/:id/xp')
  @HttpCode(HttpStatus.OK)
  async setXp(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetArenaProblemXpDto) {
    return this.arenaProblemsService.setXp(id, dto.xp);
  }

  /**
   * Endpoint: POST /admin/arena/problems/:id/publish
   * Makes one problem visible to students.
   */
  @Post('problems/:id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.setStatus(req.user.id, id, ArenaProblemStatus.PUBLISHED);
  }

  /**
   * Endpoint: POST /admin/arena/problems/:id/unpublish
   * Hides one problem from students (moves it back to DRAFT).
   */
  @Post('problems/:id/unpublish')
  @HttpCode(HttpStatus.OK)
  async unpublish(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.setStatus(req.user.id, id, ArenaProblemStatus.DRAFT);
  }

  /**
   * Endpoint: DELETE /admin/arena/problems/:id
   * Deletes a single problem of a set together with its attempt records.
   */
  @Delete('problems/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.remove(req.user.id, id);
  }
}
