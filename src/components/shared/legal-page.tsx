import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";

export type LegalSection = {
  id: string;
  title: string;
  body: React.ReactNode;
};

/** Shared template for prose legal pages (privacy policy, terms). */
export function LegalPage({
  title,
  intro,
  lastUpdated,
  crumb,
  sections,
}: {
  title: string;
  intro: string;
  lastUpdated: Date;
  crumb: { label: string; href: string };
  sections: LegalSection[];
}) {
  const crumbs = [crumb];
  return (
    <>
      <div className="container-site pt-8">
        <div className="mx-auto max-w-3xl">
          <Breadcrumb items={crumbs} />
        </div>
      </div>

      <article className="container-site pb-20 pt-4 md:pb-28">
        <div className="mx-auto max-w-3xl">
          <header>
            <h1 className="text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">{title}</h1>
            <p className="mt-3 text-[13.5px] font-semibold uppercase tracking-[0.08em] text-faint">
              Last updated: {formatDate(lastUpdated)}
            </p>
            <p className="mt-5 text-[16px] leading-relaxed text-body">{intro}</p>
          </header>

          {/* Table of contents */}
          <nav aria-label="Table of contents" className="mt-8 rounded-card border border-line bg-surface p-6 shadow-soft">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">On this page</h2>
            <ol className="mt-3 grid gap-2 sm:grid-cols-2">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[14px] font-medium text-primary hover:underline">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="mt-10 space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24" aria-labelledby={`${s.id}-heading`}>
                <h2 id={`${s.id}-heading`} className="text-2xl font-bold tracking-tight">
                  {i + 1}. {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-body [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-semibold [&_strong]:text-foreground">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </article>

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
