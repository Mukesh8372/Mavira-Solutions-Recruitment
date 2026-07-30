import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Video } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { getCandidateOverview, computeProfileCompletion } from "@/features/candidates/queries";
import { formatDateTime, formatRelativeDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function CandidateOverviewPage() {
  const session = await auth();
  const data = await getCandidateOverview(session!.user.id);
  if (!data) return <EmptyState title="Profile not found" body="Contact support to restore your candidate profile." />;

  const { profile, applicationCount, savedCount, upcomingInterviews, recentApplications } = data;
  const completion = computeProfileCompletion(profile);
  const firstName = profile.user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hi ${firstName} 👋`}
        description="Here's where your search stands today."
        actions={
          <Link
            href="/jobs"
            className="inline-flex h-10 items-center gap-1.5 rounded-btn bg-primary px-4 text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-strong"
          >
            Browse jobs
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={applicationCount} icon="file-text" tone="primary" />
        <StatCard label="Saved jobs" value={savedCount} icon="heart" tone="secondary" />
        <StatCard label="Upcoming interviews" value={upcomingInterviews.length} icon="calendar" tone="accent" />
        <StatCard label="Profile completion" value={`${completion.score}%`} icon="user" tone="warning" hint={completion.score < 100 ? "Complete it to get matched faster" : "All set"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="recent-apps-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recent-apps-heading" className="text-[16px] font-bold">
              Recent applications
            </h2>
            <Link href="/dashboard/applications" className="text-[13px] font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentApplications.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="No applications yet"
              body="When you apply to a role, you'll track its status here — screening, shortlist, interview, offer."
              cta={{ label: "Browse open roles", href: "/jobs" }}
            />
          ) : (
            <TableShell>
              <Table>
                <THead>
                  <TH>Role</TH>
                  <TH>Company</TH>
                  <TH>Status</TH>
                  <TH>Updated</TH>
                </THead>
                <TBody>
                  {recentApplications.map((app) => (
                    <TR key={app.id}>
                      <TD className="font-semibold text-foreground">
                        <Link href={`/jobs/${app.job.slug}`} className="hover:text-primary">
                          {app.job.title}
                        </Link>
                      </TD>
                      <TD>{app.job.company.name}</TD>
                      <TD>
                        <ApplicationStatusBadge status={app.status} />
                      </TD>
                      <TD>{formatRelativeDate(app.updatedAt)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          )}
        </section>

        <div className="space-y-6">
          {/* Profile completion */}
          <section aria-labelledby="completion-heading" className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <h2 id="completion-heading" className="text-[16px] font-bold">
              Profile strength
            </h2>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-background-alt" role="progressbar" aria-valuenow={completion.score} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion">
              <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${completion.score}%` }} />
            </div>
            <p className="mt-2 text-[13px] text-body">
              <span className="font-bold text-foreground">{completion.score}%</span> complete
            </p>
            <ul className="mt-3 space-y-1.5">
              {completion.checks
                .filter((c) => !c.done)
                .slice(0, 3)
                .map((c) => (
                  <li key={c.label} className="text-[13px] text-body">
                    ○ {c.label}
                  </li>
                ))}
            </ul>
            {completion.score < 100 && (
              <Link href="/dashboard/profile" className="mt-3 inline-block text-[13px] font-semibold text-primary hover:underline">
                Complete profile →
              </Link>
            )}
          </section>

          {/* Upcoming interviews */}
          <section aria-labelledby="upcoming-heading" className="rounded-card border border-line bg-surface p-5 shadow-soft">
            <h2 id="upcoming-heading" className="text-[16px] font-bold">
              Upcoming interviews
            </h2>
            {upcomingInterviews.length === 0 ? (
              <p className="mt-2 text-[13.5px] text-body">Nothing scheduled. Keep applying — we&apos;ll list interviews here.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {upcomingInterviews.map((iv) => (
                  <li key={iv.id} className="rounded-lg border border-line p-3">
                    <p className="text-[14px] font-bold text-foreground">{iv.application.job.title}</p>
                    <p className="text-[12.5px] text-faint">
                      {iv.application.job.company.name} · {formatDateTime(iv.scheduledAt)}
                    </p>
                    {iv.meetingUrl && (
                      <a
                        href={iv.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary hover:underline"
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
        </div>
      </div>
    </>
  );
}
