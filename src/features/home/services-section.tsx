import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { servicesContent } from "@/content/services";

export function ServicesSection() {
  return (
    <section className="bg-background-alt py-20 md:py-28" aria-labelledby="services-heading">
      <div className="container-site">
        <SectionHeading
          eyebrow="What we do"
          title="Recruitment services, end to end"
          lead="From a single critical hire to staffing an entire facility — one accountable partner across the talent lifecycle."
        />
        <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {servicesContent.map((service, i) => (
            <RevealItem
              as="li"
              key={service.slug}
              className={i === 0 ? "sm:col-span-2 lg:col-span-1" : undefined}
            >
              <Link
                href={`/services/${service.slug}`}
                className="group flex h-full flex-col rounded-card border border-line bg-surface p-6 shadow-soft transition-all duration-250 hover:-translate-y-1 hover:shadow-lift"
              >
                <IconChip name={service.icon} tone={i % 3 === 0 ? "primary" : i % 3 === 1 ? "secondary" : "accent"} />
                <h3 className="mt-4 text-[16.5px] font-bold">{service.title}</h3>
                <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-body">{service.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold text-primary">
                  Learn more
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </RevealItem>
          ))}
          {/* CTA tile completes the 4×2 grid */}
          <RevealItem as="li">
            <Link
              href="/employers#request-talent"
              className="group flex h-full flex-col justify-between rounded-card bg-brand-gradient p-6 text-white transition-all duration-250 hover:-translate-y-1 hover:shadow-lift"
            >
              <div>
                <h3 className="text-[16.5px] font-bold text-white">Not sure what you need?</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/85">
                  Tell us the problem — we&apos;ll recommend the right engagement in one call.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-semibold">
                Talk to us
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
              </span>
            </Link>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
