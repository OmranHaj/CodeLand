import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GamesService } from './games.service.js';
import { CompleteGameDto } from './dto/complete-game.dto.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/** Students play the games; admins can open them (and preview locks) for testing. */
const ALLOWED_ROLES = ['CHILD', 'ADMIN', 'SUPERADMIN'];

@Controller('games')
@UseGuards(JwtAuthGuard)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  private viewer(req: RequestWithUser) {
    const role = (req.user.role || '').toUpperCase();
    if (!ALLOWED_ROLES.includes(role)) {
      throw new ForbiddenException('The code games are for student accounts.');
    }
    return { id: req.user.id, role };
  }

  /** previewXp is honoured for admins only (the "student view" test bar); students always see their real XP. */
  private parsePreviewXp(raw?: string) {
    if (raw === undefined || raw === '') return undefined;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || value > 1_000_000) {
      throw new BadRequestException('previewXp must be a number between 0 and 1000000.');
    }
    return value;
  }

  /**
   * Endpoint: GET /games
   * The three games with their lock state for the signed-in student.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(@Request() req: RequestWithUser, @Query('previewXp') previewXp?: string) {
    return this.gamesService.listGames(this.viewer(req), this.parsePreviewXp(previewXp));
  }

  /**
   * Endpoint: GET /games/:gameId
   * One game's state; 403 while it is locked for the student.
   */
  @Get(':gameId')
  @HttpCode(HttpStatus.OK)
  async get(
    @Request() req: RequestWithUser,
    @Param('gameId') gameId: string,
    @Query('previewXp') previewXp?: string,
  ) {
    return this.gamesService.getGame(this.viewer(req), gameId, this.parsePreviewXp(previewXp));
  }

  /**
   * Endpoint: POST /games/robot-maze/endless
   * Sends an endless run (seeds + code of every cleared level); a verified better run becomes the record.
   */
  @Post('robot-maze/endless')
  @HttpCode(HttpStatus.OK)
  async endless(@Request() req: RequestWithUser, @Body() dto: CompleteGameDto) {
    return this.gamesService.submitEndlessRun(this.viewer(req), dto.proof);
  }

  /**
   * Endpoint: POST /games/:gameId/complete
   * Sends the finished game's proof; the server re-runs it and awards XP and the badge once.
   */
  @Post(':gameId/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Request() req: RequestWithUser,
    @Param('gameId') gameId: string,
    @Body() dto: CompleteGameDto,
  ) {
    return this.gamesService.completeGame(this.viewer(req), gameId, dto.proof);
  }
}
