/*
  Warnings:

  - You are about to drop the column `medical_history_type_id` on the `ChronicConditionHistory` table. All the data in the column will be lost.
  - You are about to drop the column `medical_history_type_id` on the `SurgicalHistory` table. All the data in the column will be lost.
  - You are about to drop the column `medical_history_type_id` on the `VaccineHistory` table. All the data in the column will be lost.
  - You are about to drop the `MedicalHistoryType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ChronicConditionHistory" DROP CONSTRAINT "ChronicConditionHistory_medical_history_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurgicalHistory" DROP CONSTRAINT "SurgicalHistory_medical_history_type_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."VaccineHistory" DROP CONSTRAINT "VaccineHistory_medical_history_type_id_fkey";

-- AlterTable
ALTER TABLE "public"."ChronicConditionHistory" DROP COLUMN "medical_history_type_id";

-- AlterTable
ALTER TABLE "public"."SurgicalHistory" DROP COLUMN "medical_history_type_id";

-- AlterTable
ALTER TABLE "public"."VaccineHistory" DROP COLUMN "medical_history_type_id";

-- DropTable
DROP TABLE "public"."MedicalHistoryType";
