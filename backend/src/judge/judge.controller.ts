import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { JudgeService } from './judge.service.js';
import { RunCustomDto } from './dto/run-custom.dto.js';
import { RunTestsDto } from './dto/run-tests.dto.js';
import { SubmitCodeDto } from './dto/submit-code.dto.js';
import { CreateTestCaseDto } from './dto/create-testcase.dto.js';
import { JwtService } from '@nestjs/jwt';

@Controller('judge')
export class JudgeController {
  constructor(
    private readonly judgeService: JudgeService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Helper to extract userId from Authorization Bearer token if present
   */
  private extractUserId(req: any): string | null {
    if (req.user?.id) {
      return req.user.id;
    }
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      try {
        const payload: any = this.jwtService.decode(token);
        return payload?.sub || payload?.id || payload?.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * 1. POST /judge/run-custom
   * Free console run with custom input, without querying the database.
   */
  @Post('run-custom')
  @HttpCode(HttpStatus.OK)
  async runCustom(@Body() dto: RunCustomDto) {
    return this.judgeService.runCustom(dto);
  }

  /**
   * 2. POST /judge/run-tests/:challengeId
   * Run code against sample test cases (isHidden: false) for this challenge.
   */
  @Post('run-tests/:challengeId')
  @HttpCode(HttpStatus.OK)
  async runTests(
    @Param('challengeId') challengeId: string,
    @Body() dto: RunTestsDto,
  ) {
    return this.judgeService.runTests(challengeId, dto);
  }

  /**
   * Alternative without param in URL: POST /judge/run-tests
   */
  @Post('run-tests')
  @HttpCode(HttpStatus.OK)
  async runTestsBody(@Body() dto: RunTestsDto) {
    const id = dto.challengeId;
    if (!id) {
      return this.judgeService.runCustom({
        code: dto.code,
        language: dto.language || 'cpp',
      });
    }
    return this.judgeService.runTests(id, dto);
  }

  /**
   * 3. POST /judge/submit/:challengeId
   * Submit challenge: runs against ALL test cases, grades, records submission in DB, awards XP.
   */
  @Post('submit/:challengeId')
  @HttpCode(HttpStatus.OK)
  async submitChallenge(
    @Param('challengeId') challengeId: string,
    @Body() dto: SubmitCodeDto,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req);
    return this.judgeService.submitChallenge(userId, challengeId, dto);
  }

  /**
   * Alternative without param in URL: POST /judge/submit
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitChallengeBody(
    @Body() dto: SubmitCodeDto,
    @Req() req: any,
  ) {
    const id = dto.challengeId;
    if (!id) {
      return this.judgeService.runCustom({
        code: dto.code,
        language: dto.language || 'cpp',
      });
    }
    const userId = this.extractUserId(req);
    return this.judgeService.submitChallenge(userId, id, dto);
  }

  /**
   * GET /judge/challenge/:challengeId
   * Get challenge information along with public test cases.
   */
  @Get('challenge/:challengeId')
  @HttpCode(HttpStatus.OK)
  async getChallenge(@Param('challengeId') challengeId: string) {
    return this.judgeService.getChallenge(challengeId);
  }

  /**
   * GET /judge/submissions/:challengeId
   * Retrieve submissions history for this challenge.
   */
  @Get('submissions/:challengeId')
  @HttpCode(HttpStatus.OK)
  async getSubmissions(
    @Param('challengeId') challengeId: string,
    @Req() req: any,
  ) {
    const userId = this.extractUserId(req);
    if (!userId) {
      return [];
    }
    return this.judgeService.getSubmissions(userId, challengeId);
  }

  /**
   * POST /judge/testcases/:challengeId
   * Add a testcase to a challenge.
   */
  @Post('testcases/:challengeId')
  @HttpCode(HttpStatus.CREATED)
  async createTestCase(
    @Param('challengeId') challengeId: string,
    @Body() dto: CreateTestCaseDto,
  ) {
    return this.judgeService.createTestCase(challengeId, dto);
  }
}
