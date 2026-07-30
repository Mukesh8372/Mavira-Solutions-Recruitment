import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheckBig } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { SectionHeading } from "@/components/shared/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon, IconChip } from "@/components/shared/icon";
import { CtaBand } from "@/components/shared/cta-band";
import { JsonLd } from "@/components/shared/json-ld";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { servicesContent, getService } from "@/content/services";
import { getProcessContent } from "@/features/site-content/queries";

export function generateStaticParams() {
  return servicesContent.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.title} — ${service.headline}`,
    description: service.short,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const { steps: processSteps } = await getProcessContent();
  const related = servicesContent.filter((s) => s.slug !== service.slug).slice(0, 3);
  const crumbs = [
    { label: "Services", href: "/services" },
    { label: service.title, href: `/services/${service.slug}` },
  ];

  return (
    <>
      <div className="container-site pt-8">
        <Breadcrumb items={crumbs} />
      </div>

      {/* Hero */}
      <section className="container-site pb-16 pt-4 md:pb-20" aria-labelledby="service-heading">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">
            <Icon name={service.icon} className="size-4" />
            {service.title}
          </span>
          <h1 id="service-heading" className="mt-3 text-4xl font-extrabold tracking-[-0.025em] md:text-5xl">
            {service.headline}
          </h1>
          <p className="mt-5 text-[17px] leading-relaxed text-body md:text-lg">{service.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/employers#request-talent"
              className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-7 text-base font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
            >
              Request Talent
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-btn border border-line bg-surface px-7 text-base font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
            >
              Ask a question
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Feature rows + best-for */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="features-heading">
        <div className="container-site grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <h2 id="features-heading" className="sr-only">
              What&apos;s included
            </h2>
            <RevealGroup as="ul" className="space-y-5">
              {service.bullets.map((bullet, i) => (
                <RevealItem as="li" key={bullet.title}>
                  <div className="flex items-start gap-4 rounded-card border border-line bg-surface p-6 shadow-soft">
                    <IconChip
                      name={service.icon}
                      tone={i % 3 === 0 ? "primary" : i % 3 === 1 ? "secondary" : "accent"}
                    />
                    <div>
                      <h3 className="text-[16.5px] font-bold">{bullet.title}</h3>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-body">{bullet.body}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border border-line bg-surface p-7 shadow-card">
              <h2 className="text-lg font-bold">Best for</h2>
              <ul className="mt-4 space-y-3">
                {service.bestFor.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14.5px] text-body">
                    <CircleCheckBig className="mt-0.5 size-4.5 shrink-0 text-accent" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-btn bg-primary-soft p-4 text-[13.5px] leading-relaxed text-primary">
                Not your situation? Tell us anyway — we&apos;ll point you to the right engagement, even if it isn&apos;t
                ours.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mini process */}
      <section className="container-site py-20 md:py-28" aria-labelledby="mini-process-heading">
        <SectionHeading
          eyebrow="How it runs"
          title="The same four steps, tuned for this engagement"
          lead="Every TalentBridge service rides the same rails — brief, source, shortlist, close — with SLAs at each stage."
        />
        <RevealGroup as="ul" className="relative grid gap-8 md:grid-cols-4 md:gap-5">
          <div aria-hidden className="absolute left-0 right-0 top-5 hidden h-px bg-line md:block" />
          {processSteps.map((step, i) => (
            <RevealItem as="li" key={step.title} className="relative">
              <div className="relative z-10 mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-card">
                <Icon name={step.icon} className="size-4.5" />
              </div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">
                Step {i + 1} · {step.duration}
              </p>
              <h3 className="mt-1 text-[15.5px] font-bold">{step.title}</h3>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-8 text-center">
          <Link href="/process" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
            See the full process
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="bg-background-alt py-20 md:py-28" aria-labelledby="service-faq-heading">
        <div className="container-site max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title={`${service.title}, asked and answered`}
            lead="The questions clients ask before engaging us for this service."
          />
          <Reveal>
            <Accordion defaultOpen={`${service.slug}-faq-0`}>
              {service.faq.map((faq, i) => (
                <AccordionItem key={faq.question} id={`${service.slug}-faq-${i}`} title={faq.question}>
                  {faq.answer}
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Related services */}
      <section className="container-site py-20 md:py-24" aria-label="Related services">
        <SectionHeading eyebrow="Related" title="Often paired with" align="left" className="mb-8" />
        <RevealGroup as="ul" className="grid gap-5 md:grid-cols-3">
          {related.map((s) => (
            <RevealItem as="li" key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="group flex h-full items-start gap-4 rounded-card border border-line bg-surface p-5 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-card"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon name={s.icon} className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-foreground group-hover:text-primary">{s.title}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-body">{s.short}</span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <CtaBand
        title={`Ready to start ${service.title.toLowerCase()}?`}
        lead="Tell us the roles — a delivery lead will call you within one business day."
        primary={{ label: "Request Talent", href: "/employers#request-talent" }}
        secondary={{ label: "All services", href: "/services" }}
      />

      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <JsonLd data={faqJsonLd(service.faq)} />
    </>
  );
}
