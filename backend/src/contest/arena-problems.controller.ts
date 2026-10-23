import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ArenaStudentGuard } from './guards/arena-student.guard.js';
import { ArenaProblemsService } from './arena-problems.service.js';
import { ArenaContestsService } from './arena-contests.service.js';
import { ArenaSolutionDto } from './dto/arena-solution.dto.js';

@Controller('arena')
@UseGuards(JwtAuthGuard, ArenaStudentGuard)
export class ArenaProblemsController {
  constructor(
    private readonly arenaProblemsService: ArenaProblemsService,
    private readonly arenaContestsService: ArenaContestsService,
  ) {}

  // ---------------------------------------------------------------------------
  // CONTEST
  // ---------------------------------------------------------------------------

  /**
   * Endpoint: GET /arena/contest/current
   * The current contest, its server-computed stage, and the student's registration.
   */
  @Get('contest/current')
  @HttpCode(HttpStatus.OK)
  async currentContest(@Request() req: any) {
    return this.arenaContestsService.getCurrentForStudent(req.user.id);
  }

  /**
   * Endpoint: POST /arena/contests/:contestId/registration
   * Registers the student (open until the contest ends).
   */
  @Post('contests/:contestId/registration')
  @HttpCode(HttpStatus.OK)
  async register(@Request() req: any, @Param('contestId', ParseUUIDPipe) contestId: string) {
    return this.arenaContestsService.register(req.user.id, contestId);
  }

  /**
   * Endpoint: DELETE /arena/contests/:contestId/registration
   * Leaves the contest (only before it starts).
   */
  @Delete('contests/:contestId/registration')
  @HttpCode(HttpStatus.OK)
  async unregister(@Request() req: any, @Param('contestId', ParseUUIDPipe) contestId: string) {
    return this.arenaContestsService.unregister(req.user.id, contestId);
  }

  /**
   * Endpoint: GET /arena/contests/:contestId/standings
   * Leaderboard: XP, then solved count, then time of last solve, then failed submissions.
   */
  @Get('contests/:contestId/standings')
  @HttpCode(HttpStatus.OK)
  async standings(@Request() req: any, @Param('contestId', ParseUUIDPipe) contestId: string) {
    return this.arenaContestsService.getStandings(contestId, req.user.id);
  }

  /**
   * Endpoint: GET /arena/contests/history
   * Past contests with their podium and the student's own result.
   */
  @Get('contests/history')
  @HttpCode(HttpStatus.OK)
  async history(@Request() req: any) {
    return this.arenaContestsService.getHistory(req.user.id);
  }

  /**
   * Endpoint: GET /arena/me/medals
   * Medals awarded by the server to this student.
   */
  @Get('me/medals')
  @HttpCode(HttpStatus.OK)
  async myMedals(@Request() req: any) {
    return this.arenaContestsService.getMyMedals(req.user.id);
  }

  /**
   * Endpoint: GET /arena/me/xp
   * XP the student earned in the arena (after hint penalties).
   */
  @Get('me/xp')
  @HttpCode(HttpStatus.OK)
  async myXp(@Request() req: any) {
    return this.arenaProblemsService.getMyXp(req.user.id);
  }

  // ---------------------------------------------------------------------------
  // PROBLEMS
  // ---------------------------------------------------------------------------

  /**
   * Endpoint: GET /arena/problems?contestId=
   * Published problems of the current (or given) contest, once its window opened.
   */
  @Get('problems')
  @HttpCode(HttpStatus.OK)
  async list(@Request() req: any, @Query('contestId') contestId?: string) {
    return this.arenaProblemsService.listPublished(req.user.id, contestId || undefined);
  }

  /**
   * Endpoint: GET /arena/problems/:id
   * Full problem for the student. The hint is only included once revealed.
   */
  @Get('problems/:id')
  @HttpCode(HttpStatus.OK)
  async getOne(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.getPublished(req.user.id, id);
  }

  /**
   * Endpoint: POST /arena/problems/:id/hint
   * Live contest: reveals the hint with the one-time 25% XP penalty.
   * Ended/archived contest: the hint is free practice material.
   */
  @Post('problems/:id/hint')
  @HttpCode(HttpStatus.OK)
  async useHint(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.arenaProblemsService.useHint(req.user.id, id);
  }

  /**
   * Endpoint: POST /arena/problems/:id/run
   * Runs the code against the examples without recording anything.
   */
  @Post('problems/:id/run')
  @HttpCode(HttpStatus.OK)
  async run(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ArenaSolutionDto) {
    return this.arenaProblemsService.runExamples(id, dto);
  }

  /**
   * Endpoint: POST /arena/problems/:id/submit
   * Judges the solution and awards XP (computed server-side) on first accept.
   * Only while the contest is live, and only for registered students.
   */
  @Post('problems/:id/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ArenaSolutionDto,
  ) {
    return this.arenaProblemsService.submit(req.user.id, id, dto);
  }
}
