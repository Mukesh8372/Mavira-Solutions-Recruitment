import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/shared/reveal";
import { IconChip } from "@/components/shared/icon";
import { getWhyUsContent } from "@/features/site-content/queries";

export async function WhyUsSection() {
  const { cards: whyChooseUs } = await getWhyUsContent();
  return (
    <section className="bg-background-alt py-20 md:py-28" aria-labelledby="why-us-heading">
      <div className="container-site grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">Why Mavira Solutions</span>
          <h2 id="why-us-heading" className="mt-3 text-3xl font-bold tracking-tight md:text-[40px] md:leading-[1.2]">
            Agencies send resumes. <br className="hidden md:block" />
            We send <span className="text-gradient">answers.</span>
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-body">
            Every candidate you meet has already been interviewed by a domain specialist. Every promise we make has a
            number attached. That&apos;s the whole trick — and almost nobody does it.
          </p>
          <Link
            href="/why-choose-us"
            className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
          >
            More reasons to choose us
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Reveal>
        <RevealGroup as="ul" className="grid gap-5 sm:grid-cols-2">
          {whyChooseUs.map((item, i) => (
            <RevealItem as="li" key={item.title}>
              <div className="h-full rounded-card border border-line bg-surface p-6 shadow-soft">
                <IconChip name={item.icon} tone={i % 2 === 0 ? "primary" : "accent"} />
                <h3 className="mt-4 text-[16.5px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-body">{item.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
