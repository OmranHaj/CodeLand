-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('LOCKED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PARENT', 'CHILD', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badgeUrl" TEXT,
    "criteria" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Challenge" (
    "id" TEXT NOT NULL,
    "slug" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "xp" INTEGER NOT NULL DEFAULT 100,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 15,
    "status" TEXT NOT NULL DEFAULT 'published',
    "tasks" JSONB NOT NULL DEFAULT '[]',
    "starterCode" TEXT,
    "solutionCode" TEXT,
    "hints" JSONB NOT NULL DEFAULT '[]',
    "levelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChallengeSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "submittedCode" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "lessonsCompleted" INTEGER NOT NULL DEFAULT 0,
    "challengesCompleted" INTEGER NOT NULL DEFAULT 0,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "completedLessonIds" JSONB NOT NULL DEFAULT '[]',
    "completedChallengeIds" JSONB NOT NULL DEFAULT '[]',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'LOCKED',
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "xp" INTEGER NOT NULL DEFAULT 50,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'published',
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "levelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Level" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'published',
    "accent" TEXT,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 60,
    "order" INTEGER NOT NULL DEFAULT 0,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentCheer" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentCheer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "reviewChecks" JSONB NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Track" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "themeColor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'PARENT',
    "parentCode" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "googleId" TEXT,
    "avatar" TEXT,
    "githubId" TEXT,
    "discordId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "avatarTheme" TEXT NOT NULL DEFAULT 'violet',
    "dailyGoal" INTEGER NOT NULL DEFAULT 3,
    "weeklyGoalHours" DOUBLE PRECISION NOT NULL DEFAULT 6.0,
    "soundEffects" BOOLEAN NOT NULL DEFAULT true,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "fontSize" TEXT NOT NULL DEFAULT 'md',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Challenge_levelId_idx" ON "public"."Challenge"("levelId" ASC);

-- CreateIndex
CREATE INDEX "ChallengeSubmission_userId_challengeId_idx" ON "public"."ChallengeSubmission"("userId" ASC, "challengeId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "public"."DailyActivity"("userId" ASC, "date" ASC);

-- CreateIndex
CREATE INDEX "DailyActivity_userId_idx" ON "public"."DailyActivity"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_levelId_key" ON "public"."LearningProgress"("userId" ASC, "levelId" ASC);

-- CreateIndex
CREATE INDEX "LearningProgress_userId_trackId_idx" ON "public"."LearningProgress"("userId" ASC, "trackId" ASC);

-- CreateIndex
CREATE INDEX "Lesson_levelId_idx" ON "public"."Lesson"("levelId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_levelId_slug_key" ON "public"."Lesson"("levelId" ASC, "slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Level_slug_key" ON "public"."Level"("slug" ASC);

-- CreateIndex
CREATE INDEX "Level_trackId_idx" ON "public"."Level"("trackId" ASC);

-- CreateIndex
CREATE INDEX "ParentCheer_childId_readAt_idx" ON "public"."ParentCheer"("childId" ASC, "readAt" ASC);

-- CreateIndex
CREATE INDEX "ParentCheer_parentId_idx" ON "public"."ParentCheer"("parentId" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "public"."PasswordResetToken"("expiresAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "public"."PasswordResetToken"("tokenHash" ASC);

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "public"."PasswordResetToken"("userId" ASC);

-- CreateIndex
CREATE INDEX "ProjectSubmission_userId_levelId_idx" ON "public"."ProjectSubmission"("userId" ASC, "levelId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Track_slug_key" ON "public"."Track"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "public"."User"("discordId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "public"."User"("githubId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "User_parentCode_key" ON "public"."User"("parentCode" ASC);

-- CreateIndex
CREATE INDEX "User_parentId_idx" ON "public"."User"("parentId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId" ASC, "achievementId" ASC);

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "public"."UserAchievement"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Challenge" ADD CONSTRAINT "Challenge_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Level" ADD CONSTRAINT "Level_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentCheer" ADD CONSTRAINT "ParentCheer_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentCheer" ADD CONSTRAINT "ParentCheer_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectSubmission" ADD CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

