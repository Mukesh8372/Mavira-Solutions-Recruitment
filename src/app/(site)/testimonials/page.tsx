import type { Metadata } from "next";
import { Star } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/shared/reveal";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getApprovedTestimonials } from "@/features/content/queries";
import { TestimonialFilter } from "@/features/content/testimonial-filter";

export const metadata: Metadata = {
  title: "Testimonials — 4.9★ from Employers & Candidates",
  description:
    "Verified reviews from HR heads who stopped chasing agencies and candidates who finally got answers — 4.9★ across 830+ reviews.",
  alternates: { canonical: "/testimonials" },
};

const crumbs = [{ label: "Testimonials", href: "/testimonials" }];

export default async function TestimonialsPage() {
  const testimonials = await getApprovedTestimonials();

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Aggregate rating header */}
      <section className="container-site pb-12 pt-4 md:pb-14" aria-labelledby="testimonials-heading">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Social proof</span>
          <h1 id="testimonials-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            The reviews we&apos;re <span className="text-gradient">rated on</span>
          </h1>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-3 shadow-soft">
            <span className="flex gap-0.5 text-warning" aria-label="4.9 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4.5 fill-current" aria-hidden />
              ))}
            </span>
            <span className="text-[15px] font-bold text-foreground">4.9</span>
            <span aria-hidden className="h-4 w-px bg-line" />
            <span className="text-[14px] font-medium text-body">830+ reviews on Google</span>
          </div>
          <p className="mt-5 text-[15.5px] leading-relaxed text-body">
            Every quote below is from a verified client or a candidate we placed — approved, never edited.
          </p>
        </Reveal>
      </section>

      {/* Filterable grid */}
      <section className="bg-background-alt py-16 md:py-24" aria-label="All testimonials">
        <div className="container-site">
          <TestimonialFilter
            items={testimonials.map((t) => ({
              id: t.id,
              quote: t.quote,
              authorName: t.authorName,
              authorRole: t.authorRole,
              company: t.company,
              rating: t.rating,
              kind: t.kind,
            }))}
          />
        </div>
      </section>

      <CtaBand
        title="Add your review to this page."
        lead="The fastest way is to work with us — hiring or job hunting, we're one call away."
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
    </>
  );
}
