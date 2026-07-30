import type { Metadata } from "next";
import { Building2, Globe } from "lucide-react";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CompanyForm } from "@/features/employers/company-form";
import { getEmployerContext } from "@/features/employers/queries";

export const metadata: Metadata = { title: "Company profile", robots: { index: false } };

export default async function CompanyProfilePage() {
  const session = await auth();
  const ctx = await getEmployerContext(session!.user.id);
  if (!ctx) return <EmptyState title="Company not found" body="Your account isn't linked to a company yet. Contact support to get set up." />;

  const { company } = ctx;

  return (
    <>
      <PageHeader title="Company profile" description="What candidates see about your company on job listings." />
      <div className="max-w-3xl space-y-6">
        <section aria-labelledby="company-card-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <div className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 id="company-card-heading" className="text-[17px] font-bold text-foreground">
                {company.name}
              </h2>
              <p className="text-[13px] text-faint">Slug: {company.slug}</p>
              <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[13.5px]">
                <div>
                  <dt className="text-faint">Industry</dt>
                  <dd className="font-semibold text-foreground">{company.industry ?? "Not set"}</dd>
                </div>
                <div>
                  <dt className="text-faint">Size</dt>
                  <dd className="font-semibold text-foreground">{company.size ?? "Not set"}</dd>
                </div>
                {company.website && (
                  <div>
                    <dt className="text-faint">Website</dt>
                    <dd>
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Globe className="size-3.5" aria-hidden />
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </section>

        <section aria-labelledby="company-form-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="company-form-heading" className="mb-4 text-[16px] font-bold">
            Edit details
          </h2>
          <CompanyForm
            defaults={{
              about: company.about ?? "",
              website: company.website ?? "",
              size: company.size ?? "",
              industry: company.industry ?? "",
            }}
          />
        </section>
      </div>
    </>
  );
}
