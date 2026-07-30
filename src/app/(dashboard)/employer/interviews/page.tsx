import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Video, Phone, CalendarPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { InterviewStatusBadge } from "@/components/dashboard/status-badge";
import { getEmployerContext, getEmployerInterviews } from "@/features/employers/queries";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Interviews", robots: { index: false } };

export default async function EmployerInterviewsPage() {
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const interviews = await getEmployerInterviews(ctx.companyId);
  const upcoming = interviews
    .filter((iv) => iv.status === "SCHEDULED" && iv.scheduledAt > new Date())
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const past = interviews.filter((iv) => !(iv.status === "SCHEDULED" && iv.scheduledAt > new Date()));

  const scheduleAction = (
    <Link
      href="/employer/applications"
      className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
    >
      <CalendarPlus className="size-3.5" aria-hidden />
      Schedule interview
    </Link>
  );

  return (
    <>
      <PageHeader title="Interviews" description="Every round you've scheduled — upcoming and past." actions={scheduleAction} />
      {interviews.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No interviews yet"
          body="Pick a candidate from your applications and schedule the first round — they get notified automatically."
          cta={{ label: "Review applications", href: "/employer/applications" }}
        />
      ) : (
        <div className="space-y-8">
          <section aria-labelledby="upcoming-ivs">
            <h2 id="upcoming-ivs" className="mb-3 text-[16px] font-bold">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-[14px] text-body">Nothing scheduled right now.</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {upcoming.map((iv) => (
                  <li key={iv.id} className="rounded-card border border-line bg-surface p-5 shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15.5px] font-bold text-foreground">{iv.application.candidate.user.name}</p>
                        <p className="text-[13px] text-faint">{iv.application.job.title}</p>
                      </div>
                      <InterviewStatusBadge status={iv.status} />
                    </div>
                    <dl className="mt-4 space-y-1.5 text-[13.5px] text-body">
                      <div className="flex justify-between">
                        <dt className="text-faint">When</dt>
                        <dd className="font-semibold text-foreground">{formatDateTime(iv.scheduledAt)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-faint">Mode</dt>
                        <dd className="inline-flex items-center gap-1.5">
                          {iv.mode === "VIDEO" ? <Video className="size-3.5" aria-hidden /> : iv.mode === "CALL" ? <Phone className="size-3.5" aria-hidden /> : <MapPin className="size-3.5" aria-hidden />}
                          {iv.mode === "VIDEO" ? "Video call" : iv.mode === "CALL" ? "Phone call" : "In person"}
                        </dd>
                      </div>
                      {iv.interviewer && (
                        <div className="flex justify-between">
                          <dt className="text-faint">Interviewer</dt>
                          <dd>{iv.interviewer}</dd>
                        </div>
                      )}
                      {iv.location && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-faint">Where</dt>
                          <dd className="text-right">{iv.location}</dd>
                        </div>
                      )}
                    </dl>
                    {iv.meetingUrl && (
                      <a
                        href={iv.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13px] font-semibold text-white transition-colors hover:bg-primary-strong"
                      >
                        <Video className="size-3.5" aria-hidden />
                        Join meeting
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past-ivs">
              <h2 id="past-ivs" className="mb-3 text-[16px] font-bold">
                Past
              </h2>
              <ul className="space-y-2.5">
                {past.map((iv) => (
                  <li key={iv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-line bg-surface px-4 py-3">
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{iv.application.candidate.user.name}</p>
                      <p className="text-[12.5px] text-faint">
                        {iv.application.job.title} · {formatDateTime(iv.scheduledAt)}
                      </p>
                    </div>
                    <InterviewStatusBadge status={iv.status} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </>
  );
}
