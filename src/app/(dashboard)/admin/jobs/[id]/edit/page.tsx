import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { JobForm, type JobFormValues } from "@/features/jobs/job-form";
import { istDateOnly } from "@/features/jobs/admin-schemas";
import { getAdminJob, getJobOptions } from "@/features/admin/queries";
import { formatLpa } from "@/lib/format";
import { jsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit job — Admin", robots: { index: false } };

export default async function AdminEditJobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [job, options] = await Promise.all([getAdminJob(id), getJobOptions()]);
  if (!job) notFound();

  const defaults: Partial<JobFormValues> = {
    title: job.title,
    departmentId: job.departmentId,
    industryId: job.industryId ?? "",
    companyId: job.companyId,
    confidential: job.confidential,
    confidentialLabel: job.confidentialLabel ?? "",
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceMin: String(job.experienceMin),
    experienceMax: String(job.experienceMax),
    salaryMinLpa: job.salaryMin ? formatLpa(job.salaryMin) : "",
    salaryMaxLpa: job.salaryMax ? formatLpa(job.salaryMax) : "",
    salaryVisible: job.salaryVisible,
    featured: job.featured,
    urgent: job.urgent,
    validThrough: job.validThrough ? istDateOnly(job.validThrough) : "",
    description: job.description,
    responsibilities: jsonArray(job.responsibilities).join("\n"),
    requirements: jsonArray(job.requirements).join("\n"),
    benefits: jsonArray(job.benefits).join("\n"),
    skills: jsonArray(job.skills).join(", "),
    seoTitle: job.seoTitle ?? "",
    seoDescription: job.seoDescription ?? "",
    status: job.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  };

  return (
    <>
      <PageHeader title={`Edit: ${job.title}`} description={`/jobs/${job.slug} — the URL stays the same when you rename the job.`} actions={<JobStatusBadge status={job.status} />} />
      <div className="max-w-3xl rounded-card border border-line bg-surface p-6 shadow-soft">
        <JobForm options={options} jobId={job.id} currentStatus={job.status} defaults={defaults} />
      </div>
    </>
  );
}
