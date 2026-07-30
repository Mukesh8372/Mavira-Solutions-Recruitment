import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonArray } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobStatusBadge } from "@/components/dashboard/status-badge";
import { JobForm } from "@/features/employers/job-form";
import { getEmployerContext, getDepartments } from "@/features/employers/queries";

export const metadata: Metadata = { title: "Edit job", robots: { index: false } };

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  const [ctx, departments, job] = await Promise.all([
    getEmployerContext(session!.user.id),
    getDepartments(),
    prisma.job.findUnique({ where: { id } }),
  ]);
  if (!ctx || !job || job.companyId !== ctx.companyId) notFound();

  const defaults = {
    title: job.title,
    departmentId: job.departmentId,
    location: job.location,
    workMode: job.workMode,
    employmentType: job.employmentType,
    experienceMin: job.experienceMin,
    experienceMax: job.experienceMax,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryVisible: job.salaryVisible,
    description: job.description,
    responsibilities: jsonArray(job.responsibilities).join("\n"),
    requirements: jsonArray(job.requirements).join("\n"),
    benefits: jsonArray(job.benefits).join("\n"),
    skills: jsonArray(job.skills).join(", "),
    urgent: job.urgent,
  };

  return (
    <>
      <PageHeader
        title={`Edit: ${job.title}`}
        description="Update the role details below."
        actions={<JobStatusBadge status={job.status} />}
      />
      <div className="max-w-3xl rounded-card border border-line bg-surface p-6 shadow-soft">
        <JobForm departments={departments.map((d) => ({ id: d.id, name: d.name }))} jobId={job.id} jobStatus={job.status} defaults={defaults} />
      </div>
    </>
  );
}
