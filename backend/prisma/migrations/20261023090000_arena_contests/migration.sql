-- CreateEnum
CREATE TYPE "ArenaContestStatus" AS ENUM ('CURRENT', 'ARCHIVED');

-- AlterTable
ALTER TABLE "ArenaProblemAttempt" ADD COLUMN     "failedCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DailyActivity" ALTER COLUMN "xpEarned" SET DEFAULT 0,
ALTER COLUMN "xpEarned" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ArenaContest" (
    "id" TEXT NOT NULL,
    "edition" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "status" "ArenaContestStatus" NOT NULL DEFAULT 'CURRENT',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "finalizedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaRegistration" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaMedal" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "medalType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "solvedCount" INTEGER NOT NULL,
    "participants" INTEGER NOT NULL,
    "bonusXp" INTEGER NOT NULL,
    "certificateCode" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaMedal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArenaContest_edition_key" ON "ArenaContest"("edition");

-- CreateIndex
CREATE INDEX "ArenaContest_status_idx" ON "ArenaContest"("status");

-- CreateIndex
CREATE INDEX "ArenaRegistration_userId_idx" ON "ArenaRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaRegistration_contestId_userId_key" ON "ArenaRegistration"("contestId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMedal_certificateCode_key" ON "ArenaMedal"("certificateCode");

-- CreateIndex
CREATE INDEX "ArenaMedal_userId_idx" ON "ArenaMedal"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaMedal_contestId_userId_key" ON "ArenaMedal"("contestId", "userId");

-- Backfill: every existing problem set becomes a contest (problems without a set get their own).
UPDATE "ArenaProblem" SET "batchId" = "id" WHERE "batchId" IS NULL;

INSERT INTO "ArenaContest" ("id", "title", "story", "status", "startsAt", "endsAt", "createdById", "createdAt", "updatedAt")
SELECT
  p."batchId",
  'Sunday Arena',
  MIN(p."sourceDescription"),
  'CURRENT',
  CASE WHEN bool_or(p."status" = 'PUBLISHED') THEN now() END,
  CASE WHEN bool_or(p."status" = 'PUBLISHED') THEN now() + interval '7 days' END,
  MIN(p."createdById"),
  MIN(p."createdAt"),
  now()
FROM "ArenaProblem" p
GROUP BY p."batchId"
ORDER BY MIN(p."createdAt");

-- Only the newest set stays current; older ones become history.
UPDATE "ArenaContest" SET "status" = 'ARCHIVED', "archivedAt" = now()
WHERE "id" <> (SELECT "id" FROM "ArenaContest" ORDER BY "createdAt" DESC LIMIT 1);

-- AddForeignKey
ALTER TABLE "ArenaProblem" ADD CONSTRAINT "ArenaProblem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ArenaContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaContest" ADD CONSTRAINT "ArenaContest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRegistration" ADD CONSTRAINT "ArenaRegistration_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "ArenaContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaRegistration" ADD CONSTRAINT "ArenaRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMedal" ADD CONSTRAINT "ArenaMedal_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "ArenaContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaMedal" ADD CONSTRAINT "ArenaMedal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

