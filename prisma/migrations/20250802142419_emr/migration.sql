/*
  Warnings:

  - You are about to drop the column `userId` on the `MedicalHistoryType` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MedicalHistoryType" DROP CONSTRAINT "MedicalHistoryType_userId_fkey";

-- AlterTable
ALTER TABLE "public"."MedicalHistoryType" DROP COLUMN "userId";
