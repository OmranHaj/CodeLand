-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastStreakAt" TIMESTAMP(3);

-- Initialize lastStreakAt for existing users with active streak
UPDATE "User" SET "lastStreakAt" = "lastActiveAt" WHERE "streakDays" > 0;
