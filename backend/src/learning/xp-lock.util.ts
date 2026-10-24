import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

/**
 * Runs `work` in a transaction holding a per-student advisory lock, so parallel duplicate
 * requests cannot each see a unit as "not completed yet" and award its XP more than once.
 * Every XP-awarding path (lessons, practice challenges, judge) uses the same lock key.
 */
export function withStudentXpLock<T>(
  prisma: PrismaService,
  userId: string,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`xp:${userId}`}))`;
    return work(tx);
  });
}
