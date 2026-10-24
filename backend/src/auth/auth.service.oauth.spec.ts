import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

const verifyIdToken = vi.fn();
vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdToken;
  },
}));

const { AuthService } = await import('./auth.service.js');

const json = (body: unknown, ok = true) => ({ ok, status: ok ? 200 : 400, json: async () => body }) as Response;

describe('AuthService social sign-in cannot be used to take over accounts', () => {
  let service: InstanceType<typeof AuthService>;
  let prisma: any;
  const env = { ...process.env };

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'google-client';
    process.env.GITHUB_CLIENT_ID = 'gh-client';
    process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
    process.env.DISCORD_CLIENT_ID = 'dc-client';
    process.env.DISCORD_CLIENT_SECRET = 'dc-secret';
    prisma = {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'new', tokenVersion: 0, createdAt: new Date(), ...data })),
        update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: 'u', tokenVersion: 0, ...data })),
      },
    };
    service = new AuthService(prisma, { signAsync: vi.fn().mockResolvedValue('token') } as any, {} as any);
    verifyIdToken.mockReset();
  });

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllGlobals();
  });

  describe('Google', () => {
    it('rejects a token Google does not verify (no unsigned fallback)', async () => {
      verifyIdToken.mockRejectedValue(new Error('Wrong number of segments / invalid signature'));
      await expect(service.googleLogin('forged.token.value')).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('rejects an unverified Google email', async () => {
      verifyIdToken.mockResolvedValue({ getPayload: () => ({ email: 'victim@x.com', email_verified: false, sub: '1' }) });
      await expect(service.googleLogin('t')).rejects.toThrow('not verified');
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('signs in with a verified token', async () => {
      verifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: 'student@x.com', email_verified: true, sub: 'g-1', name: 'Student' }),
      });
      const res = await service.googleLogin('t');
      expect(res.accessToken).toBe('token');
      expect(verifyIdToken).toHaveBeenCalledWith({ idToken: 't', audience: 'google-client' });
    });

    it('refuses to run without GOOGLE_CLIENT_ID instead of trusting tokens', async () => {
      delete process.env.GOOGLE_CLIENT_ID;
      await expect(service.googleLogin('t')).rejects.toThrow('not configured');
      expect(verifyIdToken).not.toHaveBeenCalled();
    });
  });

  describe('GitHub', () => {
    it('a "simulated:" code is just an invalid code now', async () => {
      const fetchMock = vi.fn().mockResolvedValue(json({ error: 'bad_verification_code', error_description: 'bad code' }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(service.githubLogin('simulated:admin@codeland.com:Hacker')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(fetchMock.mock.calls[0][0]).toBe('https://github.com/login/oauth/access_token');
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('never matches an account by an unverified GitHub email', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(json({ access_token: 'gh-token' }))
          .mockResolvedValueOnce(json({ id: 42, login: 'attacker', email: 'victim@x.com' }))
          .mockResolvedValueOnce(json([{ email: 'victim@x.com', primary: true, verified: false }])),
      );

      await service.githubLogin('real-code');
      const where = prisma.user.findFirst.mock.calls[0][0].where;
      expect(JSON.stringify(where)).not.toContain('victim@x.com');
      expect(JSON.stringify(where)).toContain('attacker@users.noreply.github.com');
    });

    it('uses the verified primary email', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(json({ access_token: 'gh-token' }))
          .mockResolvedValueOnce(json({ id: 7, login: 'student', email: null }))
          .mockResolvedValueOnce(
            json([
              { email: 'old@x.com', primary: false, verified: true },
              { email: 'student@x.com', primary: true, verified: true },
            ]),
          ),
      );

      await service.githubLogin('real-code');
      expect(JSON.stringify(prisma.user.findFirst.mock.calls[0][0].where)).toContain('student@x.com');
    });
  });

  describe('Discord', () => {
    it('a "simulated:" code is just an invalid code now', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, statusText: 'Bad', text: async () => 'invalid_grant' }));
      await expect(service.discordLogin('simulated:admin@codeland.com:Hacker')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(prisma.user.findFirst).not.toHaveBeenCalled();
    });

    it('ignores the email of an unverified Discord account', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(json({ access_token: 'dc-token' }))
          .mockResolvedValueOnce(json({ id: '99', username: 'attacker', email: 'victim@x.com', verified: false })),
      );

      await service.discordLogin('real-code');
      const where = JSON.stringify(prisma.user.findFirst.mock.calls[0][0].where);
      expect(where).not.toContain('victim@x.com');
    });

    it('uses a verified Discord email', async () => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn()
          .mockResolvedValueOnce(json({ access_token: 'dc-token' }))
          .mockResolvedValueOnce(json({ id: '5', username: 'student', email: 'student@x.com', verified: true })),
      );

      await service.discordLogin('real-code');
      expect(JSON.stringify(prisma.user.findFirst.mock.calls[0][0].where)).toContain('student@x.com');
    });
  });
});
