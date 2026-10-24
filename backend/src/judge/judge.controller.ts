import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JudgeService } from './judge.service.js';
import { RunCustomDto } from './dto/run-custom.dto.js';
import { RunTestsDto } from './dto/run-tests.dto.js';
import { SubmitCodeDto } from './dto/submit-code.dto.js';
import { CreateTestCaseDto } from './dto/create-testcase.dto.js';
import { AiJudgeDto } from './dto/ai-judge.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../admin/guards/admin.guard.js';

interface RequestWithUser {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Every judge route needs a verified login: running code costs judge/AI quota,
 * and submissions award XP to the signed-in student only.
 */
@Controller('judge')
@UseGuards(JwtAuthGuard)
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

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
    @Request() req: RequestWithUser,
  ) {
    return this.judgeService.submitChallenge(req.user.id, challengeId, dto);
  }

  /**
   * Alternative without param in URL: POST /judge/submit
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitChallengeBody(
    @Body() dto: SubmitCodeDto,
    @Request() req: RequestWithUser,
  ) {
    const id = dto.challengeId;
    if (!id) {
      return this.judgeService.runCustom({
        code: dto.code,
        language: dto.language || 'cpp',
      });
    }
    return this.judgeService.submitChallenge(req.user.id, id, dto);
  }

  /**
   * POST /judge/ai-submit
   * Evaluate student code using AI judge (ai/check_submit.py)
   */
  @Post('ai-submit')
  @HttpCode(HttpStatus.OK)
  async aiSubmit(@Body() dto: AiJudgeDto) {
    return this.judgeService.evaluateAiSubmission(dto);
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
   * Retrieve the signed-in student's submissions history for this challenge.
   */
  @Get('submissions/:challengeId')
  @HttpCode(HttpStatus.OK)
  async getSubmissions(
    @Param('challengeId') challengeId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.judgeService.getSubmissions(req.user.id, challengeId);
  }

  /**
   * POST /judge/testcases/:challengeId
   * Add a testcase to a challenge (admins only).
   */
  @Post('testcases/:challengeId')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTestCase(
    @Param('challengeId') challengeId: string,
    @Body() dto: CreateTestCaseDto,
  ) {
    return this.judgeService.createTestCase(challengeId, dto);
  }
}
