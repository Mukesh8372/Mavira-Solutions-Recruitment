-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "confidential" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confidentialLabel" TEXT;

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantName" TEXT NOT NULL,
    "applicantEmail" TEXT NOT NULL,
    "applicantPhone" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "qualification" TEXT NOT NULL,
    "currentCity" TEXT NOT NULL,
    "currentCompany" TEXT,
    "currentDesignation" TEXT,
    "experienceYears" INTEGER NOT NULL,
    "currentCtcLpa" DOUBLE PRECISION,
    "expectedCtcLpa" DOUBLE PRECISION NOT NULL,
    "noticePeriodDays" INTEGER NOT NULL,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "linkedinUrl" TEXT,
    "coverNote" TEXT,
    "resumeKey" TEXT NOT NULL,
    "resumeFileName" TEXT NOT NULL,
    "resumeMimeType" TEXT NOT NULL,
    "resumeSizeBytes" INTEGER NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "adminNote" TEXT,
    "source" TEXT NOT NULL DEFAULT 'website',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemIncident" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "SystemIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_resumeKey_key" ON "JobApplication"("resumeKey");

-- CreateIndex
CREATE INDEX "JobApplication_status_createdAt_idx" ON "JobApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_createdAt_idx" ON "JobApplication"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_dateOfBirth_idx" ON "JobApplication"("dateOfBirth");

-- CreateIndex
CREATE INDEX "JobApplication_experienceYears_idx" ON "JobApplication"("experienceYears");

-- CreateIndex
CREATE INDEX "JobApplication_currentCity_idx" ON "JobApplication"("currentCity");

-- CreateIndex
CREATE INDEX "JobApplication_expectedCtcLpa_idx" ON "JobApplication"("expectedCtcLpa");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_applicantEmail_key" ON "JobApplication"("jobId", "applicantEmail");

-- CreateIndex
CREATE INDEX "SystemIncident_resolvedAt_createdAt_idx" ON "SystemIncident"("resolvedAt", "createdAt");

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

