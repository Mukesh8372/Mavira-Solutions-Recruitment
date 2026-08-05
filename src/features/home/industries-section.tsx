import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { Icon } from "@/components/shared/icon";
import { getIndustries } from "@/features/content/queries";

export async function IndustriesSection() {
  const industries = await getIndustries();
  return (
    <section className="container-site py-20 md:py-28" aria-labelledby="industries-heading">
      <SectionHeading
        eyebrow="Where we work"
        title="Industries we serve"
        lead="We specialize in placing top talent across high-growth financial sectors — deep industry knowledge ensures precise candidate matching for every role."
      />
      <RevealGroup as="ul" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {industries.map((industry) => (
          <RevealItem as="li" key={industry.slug}>
            <Link
              href={`/industries/${industry.slug}`}
              className="group flex h-full items-center gap-3 rounded-card border border-line bg-surface p-4 shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon name={industry.icon ?? "building"} className="size-4.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-foreground group-hover:text-primary">
                  {industry.name}
                </span>
                <span className="block truncate text-[12px] text-faint">{industry.description}</span>
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
