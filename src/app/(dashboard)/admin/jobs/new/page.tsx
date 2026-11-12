import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { JobForm } from "@/features/jobs/job-form";
import { getJobOptions } from "@/features/admin/queries";

export const metadata: Metadata = { title: "Post a job — Admin", robots: { index: false } };

export default async function AdminNewJobPage() {
  const options = await getJobOptions();
  return (
    <>
      <PageHeader title="Post a job" description="Save as a draft to review it first, or publish it straight to the website." />
      <div className="max-w-3xl rounded-card border border-line bg-surface p-6 shadow-soft">
        <JobForm options={options} />
      </div>
    </>
  );
}
