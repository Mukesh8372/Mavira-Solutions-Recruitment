import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InterviewForm } from "@/features/employers/interview-form";
import { getEmployerContext } from "@/features/employers/queries";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Schedule interview", robots: { index: false } };

export default async function NewInterviewPage(props: { searchParams: Promise<{ application?: string }> }) {
  const { application: applicationId } = await props.searchParams;
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  if (!applicationId) {
    return (
      <>
        <PageHeader title="Schedule an interview" description="Interviews are scheduled against a specific application." />
        <EmptyState
          icon="calendar"
          title="Pick a candidate first"
          body='Open your applications and use "Schedule interview" next to the candidate you want to meet.'
          cta={{ label: "Go to applications", href: "/employer/applications" }}
        />
      </>
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true, candidate: { include: { user: true } } },
  });
  if (!application || application.job.companyId !== ctx.companyId) notFound();

  return (
    <>
      <PageHeader
        title="Schedule an interview"
        description="The candidate is notified and the application moves to the Interview stage."
      />
      <div className="max-w-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-5 shadow-soft">
          <div>
            <p className="text-[15.5px] font-bold text-foreground">{application.candidate.user.name}</p>
            <p className="text-[13px] text-faint">
              {application.job.title} · applied {formatDate(application.createdAt, { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>
        <div className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <InterviewForm applicationId={application.id} />
        </div>
      </div>
    </>
  );
}
