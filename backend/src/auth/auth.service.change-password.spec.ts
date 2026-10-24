import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException, HttpException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';

describe('AuthService.changePassword', () => {
  let service: AuthService;
  let prisma: any;
  let email: { sendPasswordChangedEmail: ReturnType<typeof vi.fn> };
  let currentHash: string;

  const dto = (currentPassword: string, newPassword = 'BrandNew99!', confirmPassword = newPassword) => ({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  beforeEach(async () => {
    currentHash = await bcrypt.hash('OldPass123!', 4);
    prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CHILD', password: currentHash }),
        update: vi.fn().mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CHILD', tokenVersion: 3 }),
      },
      passwordResetToken: { updateMany: vi.fn() },
    };
    prisma.$transaction = vi.fn(async (work: (tx: any) => Promise<unknown>) => work(prisma));
    email = { sendPasswordChangedEmail: vi.fn().mockResolvedValue(true) };
    const jwt = { signAsync: vi.fn().mockResolvedValue('fresh-token') };
    service = new AuthService(prisma, jwt as any, email as any);
  });

  it('changes the password, signs out other devices and returns a fresh token', async () => {
    const res = await service.changePassword('u1', dto('OldPass123!'));

    const data = prisma.user.update.mock.calls[0][0].data;
    expect(await bcrypt.compare('BrandNew99!', data.password)).toBe(true);
    expect(data.tokenVersion).toEqual({ increment: 1 });
    expect(prisma.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', usedAt: null },
      data: { usedAt: expect.any(Date) },
    });
    expect(res.accessToken).toBe('fresh-token');
    expect(email.sendPasswordChangedEmail).toHaveBeenCalledWith('a@x.com');
  });

  it('rejects a wrong current password without changing anything', async () => {
    await expect(service.changePassword('u1', dto('WrongPass1!'))).rejects.toThrow('current password is incorrect');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects mismatched confirmation', async () => {
    await expect(service.changePassword('u1', dto('OldPass123!', 'BrandNew99!', 'Different99!'))).rejects.toThrow(
      'do not match',
    );
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects reusing the current password', async () => {
    await expect(service.changePassword('u1', dto('OldPass123!', 'OldPass123!'))).rejects.toThrow('must be different');
  });

  it('explains that social-login accounts have no password to change', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@x.com', role: 'CHILD', password: null });
    await expect(service.changePassword('u1', dto('anything'))).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('blocks guessing: after 5 wrong current passwords even the right one is refused for a while', async () => {
    for (let i = 0; i < 5; i++) {
      await service.changePassword('u1', dto(`Wrong${i}xx!`)).catch(() => {});
    }
    const blocked = await service.changePassword('u1', dto('OldPass123!')).catch((e) => e);
    expect(blocked).toBeInstanceOf(HttpException);
    expect(blocked.getStatus()).toBe(429);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
