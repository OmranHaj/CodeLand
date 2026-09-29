import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AchievementsController } from './achievements.controller.js';
import { AchievementsService } from './achievements.service.js';

describe('AchievementsController', () => {
  let controller: AchievementsController;
  let service: AchievementsService;

  const mockAchievements = [
    {
      id: 'first-step',
      title: 'First Step into CodeLand',
      description: 'Completed your very first interactive programming lesson.',
      badgeUrl: '/badges/badge-first-step.svg',
      criteria: 'Complete 1 lesson in any track',
      xpReward: 50,
      createdAt: new Date(),
    },
    {
      id: 'xp-1000',
      title: 'XP Grandmaster',
      description: 'Reached a massive milestone of 1,000 total experience points.',
      badgeUrl: '/badges/badge-xp.svg',
      criteria: 'Reach 1,000 total XP',
      xpReward: 200,
      createdAt: new Date(),
    },
  ];

  const mockMyAchievements = [
    {
      id: 'ua-1',
      userId: 'user-123',
      achievementId: 'first-step',
      unlockedAt: new Date(),
      title: 'First Step into CodeLand',
      description: 'Completed your very first interactive programming lesson.',
      badgeUrl: '/badges/badge-first-step.svg',
      criteria: 'Complete 1 lesson in any track',
      xpReward: 50,
      achievement: mockAchievements[0],
    },
  ];

  beforeEach(() => {
    service = {
      getAllAchievements: vi.fn().mockResolvedValue(mockAchievements),
      getMyAchievements: vi.fn().mockResolvedValue(mockMyAchievements),
      ensureDefaultAchievements: vi.fn().mockResolvedValue(undefined),
    } as unknown as AchievementsService;

    controller = new AchievementsController(service);
  });

  it('GET /achievements should return all badges', async () => {
    const result = await controller.getAllAchievements();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('first-step');
    expect(result[1].id).toBe('xp-1000');
    expect(service.getAllAchievements).toHaveBeenCalledTimes(1);
  });

  it('GET /achievements/me should return earned badges for current user', async () => {
    const req = {
      user: {
        id: 'user-123',
        email: 'student@example.com',
        role: 'CHILD',
      },
    };

    const result = await controller.getMyAchievements(req);
    expect(result).toHaveLength(1);
    expect(result[0].achievementId).toBe('first-step');
    expect(service.getMyAchievements).toHaveBeenCalledWith('user-123');
  });
});
