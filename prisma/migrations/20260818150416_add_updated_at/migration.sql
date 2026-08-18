/*
  Warnings:

  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InterviewRound` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SkillGap` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("createdAt", "id", "name", "role", "status") SELECT "createdAt", "id", "name", "role", "status" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_InterviewRound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "interviewer" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InterviewRound_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InterviewRound" ("companyId", "date", "id", "interviewer", "notes", "type") SELECT "companyId", "date", "id", "interviewer", "notes", "type" FROM "InterviewRound";
DROP TABLE "InterviewRound";
ALTER TABLE "new_InterviewRound" RENAME TO "InterviewRound";
CREATE TABLE "new_SkillGap" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "roundId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SkillGap_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "InterviewRound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SkillGap" ("createdAt", "id", "name", "notes", "roundId") SELECT "createdAt", "id", "name", "notes", "roundId" FROM "SkillGap";
DROP TABLE "SkillGap";
ALTER TABLE "new_SkillGap" RENAME TO "SkillGap";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
