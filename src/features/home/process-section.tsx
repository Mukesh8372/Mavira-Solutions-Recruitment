import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { RevealGroup, RevealItem, Reveal } from "@/components/shared/reveal";
import { Icon } from "@/components/shared/icon";
import { getProcessContent } from "@/features/site-content/queries";

export async function ProcessSection() {
  const { steps } = await getProcessContent();
  return (
    <section className="bg-background-alt py-20 md:py-28" aria-labelledby="process-heading">
      <div className="container-site">
        <SectionHeading
          eyebrow="How it works"
          title="From brief to joined, in four steps"
          lead="A process honed over 12,000 placements — transparent at every stage, for both sides of the table."
        />
        <RevealGroup as="ul" className="relative grid gap-8 md:grid-cols-4 md:gap-5">
          {/* Connector line (desktop) */}
          <div aria-hidden className="absolute left-0 right-0 top-6 hidden h-px bg-line md:block" />
          {steps.map((step, i) => (
            <RevealItem as="li" key={step.title} className="relative">
              <div className="relative z-10 mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-card">
                <Icon name={step.icon} className="size-5" />
              </div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-primary">
                Step {i + 1} · {step.duration}
              </p>
              <h3 className="mt-1.5 text-[17px] font-bold">{step.title}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-body">{step.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <Reveal className="mt-10 text-center">
          <Link href="/process" className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline">
            See the full process
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
