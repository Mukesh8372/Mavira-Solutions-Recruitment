import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { ApplicationStatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TableShell, Table, THead, TH, TBody, TR, TD } from "@/components/dashboard/data-table";
import { Pagination } from "@/components/ui/pagination";
import { ApplicantFilterBar } from "@/features/jobs/applicant-filter-bar";
import { ApplicationNoteEditor, ApplicationStatusSelect, DeleteApplicationButton } from "@/features/jobs/application-admin-actions";
import { APPLICATIONS_PER_PAGE, applicantsHref, parseApplicantFilters } from "@/features/jobs/applicant-filters";
import { ageOn, noticePeriodLabel } from "@/features/jobs/options";
import { getAdminApplications, getApplicantCities, getApplicationJobOptions } from "@/features/admin/queries";
import { getDepartments } from "@/features/jobs/queries";
import { formatDateTime } from "@/lib/format";
import { jsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications — Admin", robots: { index: false } };

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminApplicationsPage(props: { searchParams: Promise<SearchParams> }) {
  const filters = parseApplicantFilters(await props.searchParams);
  const [{ rows, total, page, pages }, jobs, departments, cities] = await Promise.all([
    getAdminApplications(filters),
    getApplicationJobOptions(),
    getDepartments(),
    getApplicantCities(),
  ]);
  const today = new Date();
  const from = total === 0 ? 0 : (page - 1) * APPLICATIONS_PER_PAGE + 1;
  const to = Math.min(page * APPLICATIONS_PER_PAGE, total);

  return (
    <>
      <PageHeader title="Applications" description="Every application from the website. Filter, screen, download resumes and move candidates through the pipeline." />
      <ApplicantFilterBar filters={filters} jobs={jobs} categories={departments.map((d) => ({ id: d.id, name: d.name }))} cities={cities} />

      <p className="mb-3 text-[13.5px] text-faint" aria-live="polite">
        {total === 0 ? "No applications match" : `Showing ${from}–${to} of ${total} application${total === 1 ? "" : "s"}`}
      </p>

      {rows.length === 0 ? (
        <EmptyState icon="inbox" title="No applications found" body="Applications from the website appear here. Try clearing a filter." />
      ) : (
        <TableShell>
          <Table className="min-w-[1180px]">
            <THead>
              <TH>Candidate</TH>
              <TH>Age · City</TH>
              <TH>Experience</TH>
              <TH>Expected CTC</TH>
              <TH>Notice</TH>
              <TH>Job</TH>
              <TH>Status</TH>
              <TH>Applied</TH>
              <TH className="text-right">Actions</TH>
            </THead>
            <TBody>
              {rows.map((a) => {
                const skills = jsonArray(a.skills);
                return (
                  <TR key={a.id}>
                    <TD className="align-top">
                      <span className="font-semibold text-foreground">{a.applicantName}</span>
                      <span className="block text-[12px] text-faint">
                        <a href={`mailto:${a.applicantEmail}`} className="hover:underline">
                          {a.applicantEmail}
                        </a>
                        {" · "}
                        <a href={`tel:${a.applicantPhone}`} className="hover:underline">
                          {a.applicantPhone}
                        </a>
                      </span>
                      <span className="block text-[12px] text-faint">{a.qualification}</span>
                      <details className="mt-1.5">
                        <summary className="cursor-pointer text-[12.5px] font-semibold text-primary">Details &amp; note</summary>
                        <dl className="mt-2 space-y-1 text-[12.5px] text-body">
                          {a.currentCompany && (
                            <div>
                              <dt className="inline text-faint">Company: </dt>
                              <dd className="inline">{a.currentCompany}</dd>
                            </div>
                          )}
                          {a.currentDesignation && (
                            <div>
                              <dt className="inline text-faint">Designation: </dt>
                              <dd className="inline">{a.currentDesignation}</dd>
                            </div>
                          )}
                          {a.currentCtcLpa !== null && (
                            <div>
                              <dt className="inline text-faint">Current CTC: </dt>
                              <dd className="inline">{a.currentCtcLpa} LPA</dd>
                            </div>
                          )}
                          {skills.length > 0 && (
                            <div>
                              <dt className="inline text-faint">Skills: </dt>
                              <dd className="inline">{skills.join(", ")}</dd>
                            </div>
                          )}
                          {a.linkedinUrl && (
                            <div>
                              <dt className="inline text-faint">LinkedIn: </dt>
                              <dd className="inline">
                                <a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {a.linkedinUrl}
                                </a>
                              </dd>
                            </div>
                          )}
                          {a.coverNote && (
                            <div>
                              <dt className="text-faint">Cover note:</dt>
                              <dd className="whitespace-pre-line">{a.coverNote}</dd>
                            </div>
                          )}
                          <div>
                            <dt className="inline text-faint">Consent: </dt>
                            <dd className="inline">{formatDateTime(a.consentAt)}</dd>
                          </div>
                        </dl>
                        <div className="mt-3 max-w-md">
                          <ApplicationNoteEditor applicationId={a.id} note={a.adminNote ?? ""} />
                        </div>
                      </details>
                    </TD>
                    <TD className="align-top">
                      {ageOn(a.dateOfBirth, today)}
                      <span className="block text-[12px] text-faint">{a.currentCity}</span>
                    </TD>
                    <TD className="align-top">{a.experienceYears} yrs</TD>
                    <TD className="align-top">{a.expectedCtcLpa} LPA</TD>
                    <TD className="align-top">{noticePeriodLabel(a.noticePeriodDays)}</TD>
                    <TD className="align-top">
                      <Link href={`/admin/jobs/${a.job.id}/edit`} className="font-semibold text-foreground hover:underline">
                        {a.job.title}
                      </Link>
                      <span className="block text-[12px] text-faint">
                        {a.job.employerLabel} · {a.job.department.name}
                      </span>
                    </TD>
                    <TD className="align-top">
                      <ApplicationStatusBadge status={a.status} />
                      <div className="mt-2">
                        <ApplicationStatusSelect applicationId={a.id} status={a.status} />
                      </div>
                    </TD>
                    <TD className="align-top">{formatDateTime(a.createdAt)}</TD>
                    <TD className="text-right align-top">
                      <span className="inline-flex flex-col items-end gap-2">
                        <a href={`/api/v1/resumes/${a.id}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
                          <Download className="size-3.5" aria-hidden />
                          Resume
                        </a>
                        <DeleteApplicationButton applicationId={a.id} applicantName={a.applicantName} />
                      </span>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </TableShell>
      )}

      <Pagination current={page} total={pages} hrefFor={(p) => applicantsHref(filters, p)} />
    </>
  );
}
