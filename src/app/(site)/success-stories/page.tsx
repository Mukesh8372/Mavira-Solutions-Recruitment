import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getSuccessStories } from "@/features/content/queries";
import { jsonValue } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Success Stories — Client Case Studies",
  description:
    "Real hiring problems, measurable outcomes: engineering scale-ups, 200-hire fulfilment ramps and confidential CXO searches — with the numbers each one delivered.",
  alternates: { canonical: "/success-stories" },
};

type Metric = { label: string; value: string };

const crumbs = [{ label: "Success Stories", href: "/success-stories" }];

export default async function SuccessStoriesPage() {
  const stories = await getSuccessStories();

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Intro */}
      <section className="container-site pb-14 pt-4 md:pb-16" aria-labelledby="stories-heading">
        <Reveal className="max-w-3xl">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Case studies</span>
          <h1 id="stories-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            Proof, with <span className="text-gradient">numbers attached</span>
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">
            Every engagement below started as a hiring problem someone had lived with for too long. Here&apos;s what we
            did, what it delivered, and the metrics the client signed off on.
          </p>
        </Reveal>
      </section>

      {/* Stories */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="All success stories">
        <div className="container-site">
          <RevealGroup as="ul" className="space-y-6">
            {stories.map((story) => {
              const metrics = jsonValue<Metric[]>(story.metrics, []);
              return (
                <RevealItem as="li" key={story.id}>
                  <Link
                    href={`/success-stories/${story.slug}`}
                    className="group block rounded-card border border-line bg-surface p-7 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift md:p-9"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body">
                        <Building2 className="size-4 text-faint" aria-hidden />
                        {story.clientName}
                      </span>
                      <Badge variant="blue">{story.industry}</Badge>
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight group-hover:text-primary md:text-2xl">
                      {story.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-body">{story.challenge}</p>
                    {metrics.length > 0 && (
                      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
                        {metrics.map((m) => (
                          <div key={m.label}>
                            <dd className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{m.value}</dd>
                            <dt className="mt-0.5 text-[12.5px] font-medium text-faint">{m.label}</dt>
                          </div>
                        ))}
                      </dl>
                    )}
                    <span className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                      Read the full story
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </section>

      <CtaBand
        title="Your role could be the next case study."
        lead="Bring us the brief — we'll bring the numbers."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
