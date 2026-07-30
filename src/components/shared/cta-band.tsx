import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

/** Full-width gradient call-to-action band with the dual hire/get-hired path. */
export function CtaBand({
  title = "Hiring, or looking?",
  lead = "Either way, you're one conversation away from done.",
  primary = { label: "Request Talent", href: "/employers#request-talent" },
  secondary = { label: "Browse open roles", href: "/jobs" },
}: {
  title?: string;
  lead?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="container-site py-16 md:py-20" aria-label="Call to action">
      <Reveal>
        <div className="relative overflow-hidden rounded-modal bg-brand-gradient px-8 py-12 text-white md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
              <p className="mt-2 max-w-md text-[15px] text-white/85 md:text-base">{lead}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={primary.href}
                className="inline-flex h-12 items-center gap-2 rounded-btn bg-white px-7 text-base font-semibold text-primary-strong transition-all hover:bg-slate-100 active:scale-[0.98]"
              >
                {primary.label}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href={secondary.href}
                className="inline-flex h-12 items-center rounded-btn border border-white/40 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.98]"
              >
                {secondary.label}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
