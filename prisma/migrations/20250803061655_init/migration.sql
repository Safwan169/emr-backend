-- CreateEnum
CREATE TYPE "public"."AllergyCondition" AS ENUM ('severe', 'moderate', 'mild');

-- CreateEnum
CREATE TYPE "public"."AllergyStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hashed" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT,
    "role_id" INTEGER NOT NULL,
    "age" TEXT,
    "blood_group" TEXT,
    "height_cm" DOUBLE PRECISION,
    "weight_lbs" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmergencyContact" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "license_number" TEXT,
    "specialization" TEXT,
    "fee" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION DEFAULT 0.0,
    "years_of_experience" DOUBLE PRECISION,
    "phone" TEXT,
    "hospital" TEXT,
    "image_file_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorProfileEducationAndQualification" (
    "id" SERIAL NOT NULL,
    "doctor_profile_id" INTEGER NOT NULL,
    "title" TEXT,
    "institution" TEXT,
    "achievement" TEXT,
    "timeline" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfileEducationAndQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorCertification" (
    "id" SERIAL NOT NULL,
    "doctor_profile_id" INTEGER NOT NULL,
    "name" TEXT,
    "certified_year" INTEGER,
    "validation_year" INTEGER,
    "institution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DoctorResearchAndPublication" (
    "id" SERIAL NOT NULL,
    "doctor_profile_id" INTEGER NOT NULL,
    "research_name" TEXT,
    "publication_year" INTEGER,
    "published_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorResearchAndPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_URL" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_extension" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'upload',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Otp" (
    "id" SERIAL NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChronicConditionHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "diagnosed" TIMESTAMP(3) NOT NULL,
    "treating_physician" TEXT NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChronicConditionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurgicalHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "procedure" TEXT NOT NULL,
    "surgery_date" TIMESTAMP(3) NOT NULL,
    "surgeon_name" TEXT NOT NULL,
    "hospital_name" TEXT NOT NULL,
    "complications" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurgicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VaccineHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vaccine_name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "dose_name" TEXT NOT NULL,
    "vaccine_provider" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaccineHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Prescription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "previousLabReportId" INTEGER,
    "latestLabReportId" INTEGER,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreviousPrescription" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreviousPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LatestPrescription" (
    "id" SERIAL NOT NULL,
    "prescription_id" INTEGER NOT NULL,
    "prescribed_by_user_id" INTEGER NOT NULL,
    "prescribed_medicine_name" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "refills_left" INTEGER,
    "instruction" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabReport" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreviousLabReport" (
    "id" SERIAL NOT NULL,
    "lab_report_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreviousLabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LatestLabReport" (
    "id" SERIAL NOT NULL,
    "lab_report_id" INTEGER NOT NULL,
    "file_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LatestLabReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Allergy" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "allergy_name" TEXT NOT NULL,
    "allergy_type" TEXT NOT NULL,
    "condition" "public"."AllergyCondition" NOT NULL,
    "reactions" TEXT NOT NULL,
    "note" TEXT,
    "status" "public"."AllergyStatus" NOT NULL DEFAULT 'active',
    "date_modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SoapNote" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "file_id" INTEGER,
    "subjective" TEXT,
    "objective" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoapNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_role_id_user_id_key" ON "public"."User"("role_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyContact_user_id_key" ON "public"."EmergencyContact"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "public"."Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_user_id_key" ON "public"."DoctorProfile"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "LatestPrescription_prescription_id_key" ON "public"."LatestPrescription"("prescription_id");

-- CreateIndex
CREATE UNIQUE INDEX "PreviousLabReport_lab_report_id_key" ON "public"."PreviousLabReport"("lab_report_id");

-- CreateIndex
CREATE UNIQUE INDEX "LatestLabReport_lab_report_id_key" ON "public"."LatestLabReport"("lab_report_id");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmergencyContact" ADD CONSTRAINT "EmergencyContact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorProfile" ADD CONSTRAINT "DoctorProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorProfile" ADD CONSTRAINT "DoctorProfile_image_file_id_fkey" FOREIGN KEY ("image_file_id") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorProfileEducationAndQualification" ADD CONSTRAINT "DoctorProfileEducationAndQualification_doctor_profile_id_fkey" FOREIGN KEY ("doctor_profile_id") REFERENCES "public"."DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorCertification" ADD CONSTRAINT "DoctorCertification_doctor_profile_id_fkey" FOREIGN KEY ("doctor_profile_id") REFERENCES "public"."DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DoctorResearchAndPublication" ADD CONSTRAINT "DoctorResearchAndPublication_doctor_profile_id_fkey" FOREIGN KEY ("doctor_profile_id") REFERENCES "public"."DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Otp" ADD CONSTRAINT "Otp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChronicConditionHistory" ADD CONSTRAINT "ChronicConditionHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurgicalHistory" ADD CONSTRAINT "SurgicalHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VaccineHistory" ADD CONSTRAINT "VaccineHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_previousLabReportId_fkey" FOREIGN KEY ("previousLabReportId") REFERENCES "public"."PreviousLabReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_latestLabReportId_fkey" FOREIGN KEY ("latestLabReportId") REFERENCES "public"."LatestLabReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreviousPrescription" ADD CONSTRAINT "PreviousPrescription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatestPrescription" ADD CONSTRAINT "LatestPrescription_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "public"."Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatestPrescription" ADD CONSTRAINT "LatestPrescription_prescribed_by_user_id_fkey" FOREIGN KEY ("prescribed_by_user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabReport" ADD CONSTRAINT "LabReport_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreviousLabReport" ADD CONSTRAINT "PreviousLabReport_lab_report_id_fkey" FOREIGN KEY ("lab_report_id") REFERENCES "public"."LabReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreviousLabReport" ADD CONSTRAINT "PreviousLabReport_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatestLabReport" ADD CONSTRAINT "LatestLabReport_lab_report_id_fkey" FOREIGN KEY ("lab_report_id") REFERENCES "public"."LabReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LatestLabReport" ADD CONSTRAINT "LatestLabReport_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Allergy" ADD CONSTRAINT "Allergy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SoapNote" ADD CONSTRAINT "SoapNote_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SoapNote" ADD CONSTRAINT "SoapNote_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SoapNote" ADD CONSTRAINT "SoapNote_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "public"."File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
