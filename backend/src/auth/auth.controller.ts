import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterParentDto } from './dto/register-parent.dto.js';
import { RegisterChildDto } from './dto/register-child.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { GithubLoginDto } from './dto/github-login.dto.js';
import { DiscordLoginDto } from './dto/discord-login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint: POST /auth/register/parent
   * Registers a new Parent and returns user info with parentCode and JWT.
   */
  @Post('register/parent')
  @HttpCode(HttpStatus.CREATED)
  async registerParent(@Body() dto: RegisterParentDto) {
    return this.authService.registerParent(dto);
  }

  /**
   * Endpoint: POST /auth/register/child
   * Registers a new student account (no code needed) and returns user info with JWT.
   * Students join an organization later from their settings (see OrganizationController).
   */
  @Post('register/child')
  @HttpCode(HttpStatus.CREATED)
  async registerChild(@Body() dto: RegisterChildDto) {
    return this.authService.registerChild(dto);
  }

  /**
   * Endpoint: POST /auth/register/student
   * Alias for registerChild to support frontend student terminology.
   */
  @Post('register/student')
  @HttpCode(HttpStatus.CREATED)
  async registerStudent(@Body() dto: RegisterChildDto) {
    return this.authService.registerChild(dto);
  }

  /**
   * Endpoint: POST /auth/login
   * Standard login for both Parents and Children.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Request() req: any) {
    // req.ip is the connection address (not the client-controlled X-Forwarded-For header).
    return this.authService.login(dto, req.ip || req.socket?.remoteAddress || 'unknown');
  }

  /**
   * Endpoint: POST /auth/google
   * Verifies Google token and logs in or creates user account.
   */
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.credential, dto.role);
  }

  /**
   * Endpoint: POST /auth/github
   * Verifies GitHub OAuth code and logs in or creates user account.
   */
  @Post('github')
  @HttpCode(HttpStatus.OK)
  async githubLogin(@Body() dto: GithubLoginDto) {
    return this.authService.githubLogin(dto.code, dto.role);
  }

  /**
   * Endpoint: POST /auth/discord
   * Verifies Discord OAuth code and logs in or creates user account.
   */
  @Post('discord')
  @HttpCode(HttpStatus.OK)
  async discordLogin(@Body() dto: DiscordLoginDto) {
    return this.authService.discordLogin(dto.code, dto.role, dto.redirectUri);
  }

  /**
   * Endpoint: POST /auth/forgot-password
   * Initiates secure password reset flow. Responds generically to prevent user enumeration.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Request() req: any) {
    const clientIp = req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    return this.authService.forgotPassword(dto, Array.isArray(clientIp) ? clientIp[0] : String(clientIp));
  }

  /**
   * Endpoint: GET /auth/reset-password/validate
   * Validates if a password reset token is active, unused, and unexpired.
   */
  @Get('reset-password/validate')
  @HttpCode(HttpStatus.OK)
  async validateResetToken(@Query('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  /**
   * Endpoint: POST /auth/reset-password
   * Resets the user's password using the verified token.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * Endpoint: GET /auth/me
   * Protected route to retrieve the current authenticated user's profile.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Request() req: { user: unknown }) {
    return req.user;
  }
}
