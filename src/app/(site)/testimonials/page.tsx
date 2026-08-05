import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Reveal } from "@/components/shared/reveal";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { getApprovedTestimonials } from "@/features/content/queries";
import { TestimonialFilter } from "@/features/content/testimonial-filter";

export const metadata: Metadata = {
  title: "Testimonials — What Clients & Candidates Say",
  description:
    "Reviews from hiring managers and candidates placed by Mavira Solutions — real placements across BFSI, broking and FinTech.",
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
