-- Jobs no longer pick a client or a confidential switch.
-- Each job has one public "employer label" instead.

-- 1. Keep the existing label text by renaming the column.
ALTER TABLE "Job" RENAME COLUMN "confidentialLabel" TO "employerLabel";

-- 2. Jobs that showed the client name keep showing it.
UPDATE "Job" AS j
SET "employerLabel" = c."name"
FROM "Company" AS c
WHERE j."companyId" = c."id" AND j."confidential" = false;

-- 3. Any job still without a label gets the old fallback text.
UPDATE "Job"
SET "employerLabel" = 'Confidential client'
WHERE "employerLabel" IS NULL OR btrim("employerLabel") = '';

ALTER TABLE "Job" ALTER COLUMN "employerLabel" SET NOT NULL;

-- 4. The confidential switch is no longer used.
ALTER TABLE "Job" DROP COLUMN "confidential";

-- 5. The client link becomes optional. Existing links are kept.
ALTER TABLE "Job" DROP CONSTRAINT "Job_companyId_fkey";
ALTER TABLE "Job" ALTER COLUMN "companyId" DROP NOT NULL;
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
