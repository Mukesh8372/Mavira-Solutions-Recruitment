import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Award, Newspaper } from "lucide-react";
import { Hero } from "@/features/home/hero";
import { LogoMarquee } from "@/features/home/logo-marquee";
import { StatsBand } from "@/features/home/stats-band";
import { ServicesSection } from "@/features/home/services-section";
import { IndustriesSection } from "@/features/home/industries-section";
import { ProcessSection } from "@/features/home/process-section";
import { FeaturedJobsSection } from "@/features/home/featured-jobs-section";
import { WhyUsSection } from "@/features/home/why-us-section";
import { TestimonialsCarousel } from "@/features/home/testimonials-carousel";
import { BlogCard } from "@/features/blog/blog-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { getFeaturedTestimonials, getFaqs, getSiteStats } from "@/features/content/queries";
import { getHeroContent, getAchievements } from "@/features/site-content/queries";
import { getPublishedPosts } from "@/features/blog/queries";

import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Recruitment & Placement Agency | ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [testimonials, faqs, stats, posts, hero, { items: achievements }] = await Promise.all([
    getFeaturedTestimonials(6),
    getFaqs(),
    getSiteStats(),
    getPublishedPosts({ take: 3 }),
    getHeroContent(),
    getAchievements(),
  ]);
  const topFaqs = faqs.slice(0, 6);

  return (
    <>
      <Hero content={hero} />
      <LogoMarquee />
      <StatsBand stats={stats} />
      <ServicesSection />
      <IndustriesSection />
      <ProcessSection />
      <FeaturedJobsSection />
      <WhyUsSection />

      {/* Testimonials */}
      <section className="container-site py-20 md:py-28" aria-labelledby="testimonials-heading">
        <SectionHeading
          eyebrow="Social proof"
          title="What clients and candidates say"
          lead="Real placements, real people — from HR heads closing critical roles to candidates landing their next chapter."
        />
        <Reveal>
          <TestimonialsCarousel
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
        </Reveal>
      </section>

      {/* Achievements */}
      <section className="bg-background-alt py-16 md:py-20" aria-labelledby="achievements-heading">
        <div className="container-site">
          <h2 id="achievements-heading" className="sr-only">
            Awards and recognition
          </h2>
          <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((a) => (
              <RevealItem as="li" key={a.title} className="flex items-start gap-3 rounded-card border border-line bg-surface p-5 shadow-soft">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-warning/12 text-warning">
                  <Award className="size-4.5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[14px] font-bold text-foreground">{a.title}</span>
                  <span className="block text-[12.5px] text-faint">
                    {a.org} · {a.year}
                  </span>
                </span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Latest blog */}
      {posts.length > 0 && (
        <section className="container-site py-20 md:py-28" aria-labelledby="blog-heading">
          <SectionHeading
            eyebrow="Insights"
            title="Latest from the placement desk"
            lead="Career advice for candidates, hiring playbooks for employers — written by people who place people."
          />
          <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <RevealItem as="li" key={post.id}>
                <BlogCard post={post} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="mt-10 text-center">
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
              <Newspaper className="size-4" aria-hidden />
              All articles
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </section>
      )}

      {/* FAQ */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="faq-heading">
        <div className="container-site max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions, answered honestly"
            lead="The things employers and candidates actually ask us."
          />
          <Reveal>
            <Accordion defaultOpen={topFaqs[0]?.id}>
              {topFaqs.map((faq) => (
                <AccordionItem key={faq.id} id={faq.id} title={faq.question}>
                  {faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
          <Reveal className="mt-8 text-center">
            <Link href="/faq" className="text-[14.5px] font-semibold text-primary hover:underline">
              See all FAQs →
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand />

      <JsonLd data={websiteJsonLd()} />
      <JsonLd data={faqJsonLd(topFaqs)} />
    </>
  );
}
