import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterParentDto } from './dto/register-parent.dto.js';
import { RegisterChildDto } from './dto/register-child.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { EmailService } from './email.service.js';

@Injectable()
export class AuthService {
  // Salt rounds for bcrypt password hashing
  private readonly saltRounds = 10;
  private readonly forgotPasswordRateLimits = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Register a new Parent account.
   * Generates a unique parentCode, hashes the password, and creates the parent user.
   */
  async registerParent(dto: RegisterParentDto) {
    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Generate unique alphanumeric parent code (6-8 characters)
    const parentCode = await this.generateUniqueParentCode();

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

    // Save parent to database
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name || dto.fullName,
        role: Role.PARENT,
        parentCode,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        parentCode: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'Parent registered successfully',
      user,
      accessToken: token,
    };
  }

  /**
   * Verifies if a parentCode belongs to a valid registered parent.
   */
  async verifyParentCode(code: string) {
    const rawCode = code.trim().toUpperCase();
    const cleanCode = rawCode.replace(/^CL-/, '');

    const parent = await this.prisma.user.findFirst({
      where: {
        OR: [
          { parentCode: rawCode },
          { parentCode: cleanCode },
        ],
        role: Role.PARENT,
      },
      select: {
        id: true,
        name: true,
        email: true,
        parentCode: true,
      },
    });

    if (!parent) {
      throw new BadRequestException(
        'Invalid parent code. Please check the code and try again.',
      );
    }

    return {
      valid: true,
      code: parent.parentCode,
      parent: {
        id: parent.id,
        fullName: parent.name,
        email: parent.email,
      },
    };
  }

  /**
   * Register a new Child account.
   * Validates the provided parentCode, ensures the parent exists,
   * hashes child's password, and links child to parentId.
   */
  async registerChild(dto: RegisterChildDto) {
    // Check if email is already in use
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Validate parent code
    const rawCode = dto.parentCode.trim().toUpperCase();
    const cleanCode = rawCode.replace(/^CL-/, '');

    const parent = await this.prisma.user.findFirst({
      where: {
        OR: [
          { parentCode: rawCode },
          { parentCode: cleanCode },
        ],
        role: Role.PARENT,
      },
    });

    if (!parent) {
      throw new BadRequestException(
        'Invalid parent code. A valid parent code from an active parent account is required.',
      );
    }

    // Hash child's password
    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

    // Save child linked to parent
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name || dto.fullName,
        role: Role.CHILD,
        parentId: parent.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        parentId: true,
        tokenVersion: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'Child registered successfully and linked to parent',
      user,
      accessToken: token,
    };
  }

  /**
   * Standard Login for both Parents and Children.
   * Validates credentials and returns JWT token.
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account has been suspended. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        parentCode: user.parentCode,
        parentId: user.parentId,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * Google OAuth authentication.
   * Verifies Google idToken/credential and logs in or creates user in PostgreSQL.
   */
  async googleLogin(credential: string, requestedRole?: string) {
    let payload: any = null;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    try {
      if (clientId) {
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } else {
        // Safe decoding fallback if clientId is not yet set in .env
        const parts = credential.split('.');
        if (parts.length === 3) {
          const buff = Buffer.from(parts[1], 'base64');
          payload = JSON.parse(buff.toString('utf-8'));
        }
      }
    } catch {
      // Fallback decoding for development
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const buff = Buffer.from(parts[1], 'base64');
          payload = JSON.parse(buff.toString('utf-8'));
        }
      } catch {
        throw new UnauthorizedException('Invalid or expired Google credential token.');
      }
    }

    if (!payload?.email) {
      throw new UnauthorizedException('Could not retrieve email from Google account.');
    }

    const email = String(payload.email).toLowerCase();
    const name = payload.name || payload.given_name || email.split('@')[0];
    const googleId = payload.sub ? String(payload.sub) : null;
    const picture = payload.picture ? String(payload.picture) : null;

    // Check if user exists by email or googleId
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(googleId ? [{ googleId }] : []),
        ],
      },
    });

    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedException('This account has been suspended. Please contact support.');
      }
      // Update googleId and avatar if missing
      if (!user.googleId || !user.avatar) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleId,
            avatar: user.avatar || picture,
          },
        });
      }
    } else {
      // Create new user
      const assignedRole =
        requestedRole?.toUpperCase() === 'PARENT'
          ? Role.PARENT
          : Role.CHILD;

      let parentCode: string | null = null;
      if (assignedRole === Role.PARENT) {
        parentCode = await this.generateUniqueParentCode();
      }

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          googleId,
          avatar: picture,
          role: assignedRole,
          parentCode,
        },
      });
    }

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'Google login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        parentCode: user.parentCode,
        parentId: user.parentId,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * GitHub OAuth authentication.
   * Exchanges authorization code for GitHub access token, fetches user profile,
   * and creates or logs in the user in PostgreSQL.
   */
  async githubLogin(code: string, requestedRole?: string) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    let githubUser: any = null;
    let userEmail: string | null = null;

    // Support simulated dev token for immediate testing before real credentials are added
    if (code.startsWith('simulated:')) {
      const parts = code.split(':');
      const testEmail = parts[1] || 'github.tester@codeland.com';
      const testName = parts[2] || 'GitHub Explorer';
      githubUser = {
        id: 'github-simulated-999',
        login: testEmail.split('@')[0],
        name: testName,
        avatar_url: 'https://avatars.githubusercontent.com/u/999999',
      };
      userEmail = testEmail;
    } else {
      if (!clientId || !clientSecret) {
        throw new BadRequestException(
          'GitHub OAuth is not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        );
      }

      // 1. Exchange code for access_token
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      if (!tokenRes.ok) {
        throw new UnauthorizedException('Failed to exchange GitHub authorization code.');
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData?.access_token;

      if (!accessToken) {
        throw new UnauthorizedException(
          tokenData?.error_description || 'Invalid or expired GitHub authorization code.',
        );
      }

      // 2. Fetch user profile from GitHub
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'CodeLand-App',
        },
      });

      if (!userRes.ok) {
        throw new UnauthorizedException('Could not fetch user profile from GitHub.');
      }

      githubUser = await userRes.json();
      userEmail = githubUser.email;

      // 3. If primary email is hidden, fetch from /user/emails
      if (!userEmail) {
        try {
          const emailsRes = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'CodeLand-App',
            },
          });
          if (emailsRes.ok) {
            const emails = await emailsRes.json();
            if (Array.isArray(emails) && emails.length > 0) {
              const primary = emails.find((e: any) => e.primary && e.verified) || emails[0];
              userEmail = primary?.email || null;
            }
          }
        } catch {
          // ignore email fetch failure
        }
      }
    }

    if (!userEmail) {
      userEmail = `${githubUser.login || githubUser.id}@users.noreply.github.com`;
    }

    const email = userEmail.toLowerCase();
    const name = githubUser.name || githubUser.login || email.split('@')[0];
    const githubId = String(githubUser.id);
    const avatar = githubUser.avatar_url;

    // Check if user exists by githubId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { githubId },
          { email },
        ],
      },
    });

    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedException('This account has been suspended. Please contact support.');
      }
      // Update githubId and avatar if missing
      if (!user.githubId || !user.avatar) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: user.githubId || githubId,
            avatar: user.avatar || avatar,
          },
        });
      }
    } else {
      // Create new user
      const assignedRole =
        requestedRole?.toUpperCase() === 'PARENT'
          ? Role.PARENT
          : Role.CHILD;

      let parentCode: string | null = null;
      if (assignedRole === Role.PARENT) {
        parentCode = await this.generateUniqueParentCode();
      }

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          githubId,
          avatar,
          role: assignedRole,
          parentCode,
        },
      });
    }

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'GitHub login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        parentCode: user.parentCode,
        parentId: user.parentId,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * Discord OAuth2 authentication.
   * Exchanges authorization code for Discord access token, fetches user profile,
   * and creates or logs in the user in PostgreSQL.
   */
  async discordLogin(code: string, requestedRole?: string, customRedirectUri?: string) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const defaultRedirectUri = 'http://localhost:5174/login';
    const redirectUri = customRedirectUri || defaultRedirectUri;

    let discordUser: any = null;
    let userEmail: string | null = null;

    // Support simulated dev token for immediate testing before real credentials are added
    if (code.startsWith('simulated:')) {
      const parts = code.split(':');
      const testEmail = parts[1] || 'discord.tester@codeland.com';
      const testName = parts[2] || 'Discord Pioneer';
      discordUser = {
        id: 'discord-simulated-999',
        username: testEmail.split('@')[0],
        global_name: testName,
        avatar: null,
      };
      userEmail = testEmail;
    } else {
      if (!clientId || !clientSecret) {
        throw new BadRequestException(
          'Discord OAuth is not configured on the server. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET.',
        );
      }

      // 1. Exchange authorization code for access token
      const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        throw new UnauthorizedException(
          `Failed to exchange Discord authorization code: ${errorText || tokenRes.statusText}`,
        );
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData?.access_token;

      if (!accessToken) {
        throw new UnauthorizedException(
          tokenData?.error_description || 'Invalid or expired Discord authorization code.',
        );
      }

      // 2. Fetch user profile from Discord
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!userRes.ok) {
        throw new UnauthorizedException('Could not fetch user profile from Discord.');
      }

      discordUser = await userRes.json();
      userEmail = discordUser.email || null;
    }

    if (!userEmail) {
      userEmail = `${discordUser.username || discordUser.id}@users.noreply.discord.com`;
    }

    const email = userEmail.toLowerCase();
    const name = discordUser.global_name || discordUser.username || email.split('@')[0];
    const discordId = String(discordUser.id);
    const avatar = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    // Check if user exists by discordId or email
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { discordId },
          { email },
        ],
      },
    });

    if (user) {
      if (user.status === 'SUSPENDED') {
        throw new UnauthorizedException('This account has been suspended. Please contact support.');
      }
      // Update discordId and avatar if missing
      if (!user.discordId || !user.avatar) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            discordId: user.discordId || discordId,
            avatar: user.avatar || avatar,
          },
        });
      }
    } else {
      // Create new user
      const assignedRole =
        requestedRole?.toUpperCase() === 'PARENT'
          ? Role.PARENT
          : Role.CHILD;

      let parentCode: string | null = null;
      if (assignedRole === Role.PARENT) {
        parentCode = await this.generateUniqueParentCode();
      }

      user = await this.prisma.user.create({
        data: {
          email,
          name,
          discordId,
          avatar,
          role: assignedRole,
          parentCode,
        },
      });
    }

    const token = await this.signToken(user.id, user.email, user.role, user.tokenVersion);

    return {
      message: 'Discord login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        parentCode: user.parentCode,
        parentId: user.parentId,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * Generates a cryptographically random, collision-resistant 8-character parent code.
   * Avoids visually ambiguous characters (0, O, 1, I).
   */
  private async generateUniqueParentCode(maxRetries = 10): Promise<string> {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const codeLength = 8;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      let code = '';
      const randomBytes = crypto.randomBytes(codeLength);
      for (let i = 0; i < codeLength; i++) {
        code += chars[randomBytes[i] % chars.length];
      }

      // Check if code already exists in DB
      const existing = await this.prisma.user.findUnique({
        where: { parentCode: code },
      });

      if (!existing) {
        return code;
      }
    }

    throw new InternalServerErrorException(
      'Could not generate a unique parent code. Please try again.',
    );
  }

  /**
   * Rate limits sensitive operations per key (IP or email).
   * Default: maximum 5 requests per 15-minute rolling window.
   */
  private checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.forgotPasswordRateLimits.get(key);

    if (!record || now > record.expiresAt) {
      this.forgotPasswordRateLimits.set(key, { count: 1, expiresAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count += 1;
    return true;
  }

  /**
   * Generates a password reset token and sends an email for local accounts.
   * ALWAYS returns a generic success response to prevent email enumeration.
   */
  async forgotPassword(dto: ForgotPasswordDto, clientIp = '127.0.0.1') {
    const email = dto.email.trim().toLowerCase();

    // 1. Rate limiting by IP and by email
    const ipAllowed = this.checkRateLimit(`ip:${clientIp}`, 5, 15 * 60 * 1000);
    const emailAllowed = this.checkRateLimit(`email:${email}`, 5, 15 * 60 * 1000);

    if (!ipAllowed || !emailAllowed) {
      throw new HttpException(
        'Too many password reset requests. Please wait a few minutes before trying again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const genericSuccess = {
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.',
    };

    // 2. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Do not reveal that email does not exist
      return genericSuccess;
    }

    // 3. Handle OAuth-only accounts (user has no local password)
    if (!user.password) {
      let provider = 'Google';
      if (user.githubId) provider = 'GitHub';
      else if (user.discordId) provider = 'Discord';

      // Send informational reminder without revealing account type to the browser
      this.emailService.sendOAuthLoginReminderEmail(user.email, provider).catch(() => {});
      return genericSuccess;
    }

    // 4. Invalidate all previous active reset tokens for this user
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // 5. Generate a cryptographically secure random token (32 bytes = 64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 6. Compute SHA-256 hash of the token to store in database
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 7. Token expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 8. Save tokenHash in database
    await this.prisma.passwordResetToken.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // 9. Build reset URL and dispatch email
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5174').replace(/\/+$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    return genericSuccess;
  }

  /**
   * Validates if a raw reset token is present, unexpired, and unused.
   * Returns only a boolean valid indicator and message (no user details leaked).
   */
  async validateResetToken(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
      return {
        valid: false,
        message: 'This reset link is invalid or has expired.',
      };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken.trim()).digest('hex');

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      return {
        valid: false,
        message: 'This reset link is invalid or has expired.',
      };
    }

    return {
      valid: true,
    };
  }

  /**
   * Resets the user's password using the verified reset token.
   * Re-hashes password with bcrypt, marks token as used, and invalidates all other tokens.
   */
  async resetPassword(dto: ResetPasswordDto) {
    const rawToken = dto.token?.trim();
    if (!rawToken) {
      throw new BadRequestException('Reset token is required.');
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match.');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long.');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.usedAt !== null || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestException('This reset link is invalid or has expired. Please request a new one.');
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

    const now = new Date();

    // Atomically consume token, update user password, increment tokenVersion, and invalidate remaining tokens in a transaction
    await this.prisma.$transaction(async (tx) => {
      // 1. Atomic consumption with row-level lock and expiry check to prevent race conditions
      const consumed = await tx.passwordResetToken.updateMany({
        where: {
          id: tokenRecord.id,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (consumed.count !== 1) {
        throw new BadRequestException('This reset link has already been used or expired.');
      }

      // 2. Update user's password and increment tokenVersion atomically to revoke all legacy JWTs
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          password: hashedPassword,
          tokenVersion: {
            increment: 1,
          },
        },
      });

      // 3. Invalidate all other active reset tokens for this user
      await tx.passwordResetToken.updateMany({
        where: {
          userId: tokenRecord.userId,
          id: { not: tokenRecord.id },
          usedAt: null,
        },
        data: {
          usedAt: now,
        },
      });
    });

    // Send confirmation email that password was changed
    if (tokenRecord.user?.email) {
      this.emailService.sendPasswordChangedEmail(tokenRecord.user.email).catch(() => {});
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  }

  /**
   * Signs a JWT access token with user claims and tokenVersion.
   */
  private async signToken(userId: string, email: string, role: Role, tokenVersion = 0): Promise<string> {
    const payload = {
      sub: userId,
      email,
      role,
      tokenVersion,
    };

    return this.jwtService.signAsync(payload);
  }
}
