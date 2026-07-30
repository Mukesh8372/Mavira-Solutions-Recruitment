import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { JobForm } from "@/features/employers/job-form";
import { getEmployerContext, getDepartments } from "@/features/employers/queries";

export const metadata: Metadata = { title: "Post a job", robots: { index: false } };

export default async function NewJobPage() {
  const session = await auth();
  const [ctx, departments] = await Promise.all([getEmployerContext(session!.user.id), getDepartments()]);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  return (
    <>
      <PageHeader title="Post a job" description={`Opens a new role at ${ctx.company.name}. Submitted jobs are reviewed before they go live.`} />
      <div className="max-w-3xl rounded-card border border-line bg-surface p-6 shadow-soft">
        <JobForm departments={departments.map((d) => ({ id: d.id, name: d.name }))} />
      </div>
    </>
  );
}
