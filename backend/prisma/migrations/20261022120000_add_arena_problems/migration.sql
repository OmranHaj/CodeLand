-- CreateEnum
CREATE TYPE "ArenaProblemStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "totalXp" SET DEFAULT 0,
ALTER COLUMN "totalXp" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ArenaProblem" (
    "id" TEXT NOT NULL,
    "status" "ArenaProblemStatus" NOT NULL DEFAULT 'DRAFT',
    "xp" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "arabicTitle" TEXT,
    "difficulty" TEXT NOT NULL,
    "difficultyIndex" INTEGER NOT NULL DEFAULT 0,
    "difficultyColor" TEXT,
    "statement" TEXT NOT NULL,
    "taskDescription" TEXT,
    "inputSpec" TEXT NOT NULL,
    "outputSpec" TEXT NOT NULL,
    "constraints" JSONB NOT NULL DEFAULT '[]',
    "examples" JSONB NOT NULL DEFAULT '[]',
    "note" TEXT,
    "hint" TEXT NOT NULL,
    "timeLimit" TEXT,
    "memoryLimit" TEXT,
    "starterCode" JSONB NOT NULL DEFAULT '{}',
    "formattedProblem" TEXT NOT NULL,
    "imageData" BYTEA,
    "imageMimeType" TEXT,
    "imagePrompt" TEXT,
    "canBeExplainedByDiagrams" BOOLEAN NOT NULL DEFAULT false,
    "storyPart" TEXT,
    "coreIdea" TEXT,
    "sourceDescription" TEXT NOT NULL,
    "generationMode" TEXT NOT NULL DEFAULT 'single',
    "batchId" TEXT,
    "rawOutput" JSONB NOT NULL,
    "createdById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaProblem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArenaProblemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "hintUsedAt" TIMESTAMP(3),
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "solvedAt" TIMESTAMP(3),
    "earnedXp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "submissionCount" INTEGER NOT NULL DEFAULT 0,
    "lastVerdict" TEXT,
    "lastLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArenaProblemAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaProblem_status_xp_idx" ON "ArenaProblem"("status", "xp");

-- CreateIndex
CREATE INDEX "ArenaProblem_batchId_idx" ON "ArenaProblem"("batchId");

-- CreateIndex
CREATE INDEX "ArenaProblemAttempt_problemId_idx" ON "ArenaProblemAttempt"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "ArenaProblemAttempt_userId_problemId_key" ON "ArenaProblemAttempt"("userId", "problemId");

-- AddForeignKey
ALTER TABLE "ArenaProblem" ADD CONSTRAINT "ArenaProblem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaProblemAttempt" ADD CONSTRAINT "ArenaProblemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArenaProblemAttempt" ADD CONSTRAINT "ArenaProblemAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "ArenaProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Problem XP is restricted to fixed tiers; enforced in the DB as well as the API.
ALTER TABLE "ArenaProblem" ADD CONSTRAINT "ArenaProblem_xp_check" CHECK ("xp" IN (25, 50, 75, 100, 125, 150));
