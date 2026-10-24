import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

describe('AuthService.login rate limiting', () => {
  let service: AuthService;
  let prisma: any;
  const email = 'student@codeland.test';

  beforeEach(async () => {
    const password = await bcrypt.hash('RightPass1!', 4);
    prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'u1',
          email,
          name: 'Student',
          role: 'CHILD',
          password,
          status: 'ACTIVE',
          tokenVersion: 0,
          createdAt: new Date(),
        }),
      },
    };
    const jwt = { signAsync: vi.fn().mockResolvedValue('token') };
    service = new AuthService(prisma, jwt as any, {} as any);
  });

  const attempt = (password: string, ip = '10.0.0.1') => service.login({ email, password } as any, ip);

  it('blocks an account after 5 wrong passwords, even when the 6th is correct', async () => {
    for (let i = 0; i < 5; i++) {
      await expect(attempt('wrong')).rejects.toBeInstanceOf(UnauthorizedException);
    }
    const blocked = await attempt('RightPass1!').catch((e) => e);
    expect(blocked).toBeInstanceOf(HttpException);
    expect(blocked.getStatus()).toBe(429);
  });

  it('the account block applies from any IP', async () => {
    for (let i = 0; i < 5; i++) {
      await attempt('wrong', `10.0.0.${i}`).catch(() => {});
    }
    const blocked = await attempt('RightPass1!', '192.168.1.50').catch((e) => e);
    expect(blocked.getStatus()).toBe(429);
  });

  it('a successful login resets the failed count', async () => {
    for (let i = 0; i < 4; i++) await attempt('wrong').catch(() => {});
    await expect(attempt('RightPass1!')).resolves.toHaveProperty('accessToken', 'token');
    for (let i = 0; i < 4; i++) await attempt('wrong').catch(() => {});
    await expect(attempt('RightPass1!')).resolves.toHaveProperty('accessToken', 'token');
  });

  it('blocks an IP that guesses across many accounts', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 20; i++) {
      await service.login({ email: `victim${i}@x.com`, password: 'guess' } as any, '6.6.6.6').catch(() => {});
    }
    const blocked = await service.login({ email: 'new@x.com', password: 'guess' } as any, '6.6.6.6').catch((e) => e);
    expect(blocked.getStatus()).toBe(429);
  });
});
