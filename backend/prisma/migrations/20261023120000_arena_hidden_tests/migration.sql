-- AlterTable
ALTER TABLE "ArenaProblem" ADD COLUMN     "bruteForceSolution" TEXT,
ADD COLUMN     "referenceSolution" TEXT,
ADD COLUMN     "validationError" TEXT,
ADD COLUMN     "validationStatus" TEXT NOT NULL DEFAULT 'unvalidated';

-- CreateTable
CREATE TABLE "ArenaTestCase" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'edge',
    "input" TEXT NOT NULL,
    "expectedOutput" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArenaTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArenaTestCase_problemId_order_idx" ON "ArenaTestCase"("problemId", "order");

-- AddForeignKey
ALTER TABLE "ArenaTestCase" ADD CONSTRAINT "ArenaTestCase_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "ArenaProblem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

