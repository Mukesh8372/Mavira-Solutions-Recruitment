import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Building2, CircleCheckBig, Lightbulb, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getSuccessStories, getSuccessStory } from "@/features/content/queries";
import { jsonArray, jsonValue } from "@/lib/utils";

type Metric = { label: string; value: string };

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const story = await getSuccessStory(slug);
  if (!story || story.status !== "PUBLISHED") return {};
  return {
    title: `${story.title} — Success Story`,
    description: story.challenge,
    alternates: { canonical: `/success-stories/${story.slug}` },
  };
}

export default async function SuccessStoryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const story = await getSuccessStory(slug);
  if (!story || story.status !== "PUBLISHED") notFound();

  const metrics = jsonValue<Metric[]>(story.metrics, []);
  const results = jsonArray(story.results);
  const related = (await getSuccessStories()).filter((s) => s.slug !== story.slug).slice(0, 2);

  const crumbs = [
    { label: "Success Stories", href: "/success-stories" },
    { label: story.clientName, href: `/success-stories/${story.slug}` },
  ];

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero */}
      <section className="container-site pb-14 pt-4 md:pb-16" aria-labelledby="story-heading">
        <Reveal className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-body">
              <Building2 className="size-4 text-faint" aria-hidden />
              {story.clientName}
            </span>
            <Badge variant="blue">{story.industry}</Badge>
          </div>
          <h1 id="story-heading" className="mt-4 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            {story.title}
          </h1>
        </Reveal>

        {metrics.length > 0 && (
          <Reveal className="mt-10">
            <dl className="grid gap-5 rounded-card border border-line bg-surface p-6 shadow-soft sm:grid-cols-3 md:p-8">
              {metrics.map((m) => (
                <div key={m.label} className="text-center sm:text-left">
                  <dd className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">{m.value}</dd>
                  <dt className="mt-1 text-[13px] font-medium text-body">{m.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </section>

      {/* Challenge / Solution / Results */}
      <section className="bg-background-alt py-20 md:py-28" aria-label="Case study detail">
        <div className="container-site max-w-4xl space-y-10">
          <Reveal>
            <div className="rounded-card border border-line bg-surface p-7 shadow-soft md:p-9">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive">
                  <Target className="size-4.5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">The challenge</h2>
              </div>
              <p className="mt-4 text-[15.5px] leading-relaxed text-body">{story.challenge}</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-card border border-line bg-surface p-7 shadow-soft md:p-9">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Lightbulb className="size-4.5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">What we did</h2>
              </div>
              <p className="mt-4 text-[15.5px] leading-relaxed text-body">{story.solution}</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-card border border-accent/30 bg-surface p-7 shadow-soft md:p-9">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-accent-soft text-accent">
                  <CircleCheckBig className="size-4.5" aria-hidden />
                </span>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">The results</h2>
              </div>
              <ul className="mt-5 space-y-3">
                {results.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-body">
                    <CircleCheckBig className="mt-0.5 size-4.5 shrink-0 text-accent" aria-hidden />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Related stories */}
      {related.length > 0 && (
        <section className="container-site py-20 md:py-24" aria-label="More success stories">
          <Reveal className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">More stories like this</h2>
          </Reveal>
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-2">
            {related.map((s) => (
              <RevealItem as="li" key={s.id}>
                <Link
                  href={`/success-stories/${s.slug}`}
                  className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card"
                >
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[13px] font-semibold text-body">{s.clientName}</span>
                    <Badge variant="blue">{s.industry}</Badge>
                  </div>
                  <h3 className="mt-2.5 flex-1 text-[16.5px] font-bold leading-snug group-hover:text-primary">{s.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                    Read the story
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}

      <CtaBand
        title="Facing something similar?"
        lead="Tell us the problem — we've probably solved it before, and we'll show you how."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
