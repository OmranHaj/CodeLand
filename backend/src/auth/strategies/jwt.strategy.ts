import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key-for-codeland-platform',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        parentCode: true,
        parentId: true,
        tokenVersion: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists or session is invalid');
    }

    // Check account status: reject suspended users immediately
    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedException('This account has been suspended.');
    }

    // Strict security: Reject legacy tokens without tokenVersion or tokens whose version is outdated
    if (payload.tokenVersion === undefined || user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException('Session expired or invalid. Please log in again.');
    }

    return user;
  }
}
