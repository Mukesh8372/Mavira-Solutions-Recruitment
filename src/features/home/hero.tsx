"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BadgeCheck, Check, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HeroContent } from "@/features/site-content/schemas";

const entrance = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 1, 0.5, 1] as const },
});

export function Hero({ content }: { content: HeroContent }) {
  const reduced = useReducedMotion();
  const anim = (delay: number) => (reduced ? {} : entrance(delay));

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Ambient gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] size-[640px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(37,99,235,.14), transparent 70%), radial-gradient(closest-side, rgba(124,58,237,.10), transparent 70%)",
        }}
      />

      <div className="container-site relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <motion.p {...anim(0)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-body shadow-soft">
            <BadgeCheck className="size-4 text-accent" aria-hidden />
            {content.badge}
          </motion.p>

          <motion.h1
            {...anim(0.08)}
            id="hero-heading"
            className="text-[38px] font-extrabold leading-[1.06] tracking-[-0.025em] md:text-[56px]"
          >
            {content.headline} <span className="text-gradient">{content.headlineAccent}</span>
          </motion.h1>

          <motion.p {...anim(0.16)} className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-body md:text-lg">
            {content.subtext}
          </motion.p>

          <motion.div {...anim(0.24)} className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/employers#request-talent"
              className="group inline-flex h-12 items-center gap-2 rounded-btn bg-primary px-7 text-base font-semibold text-white transition-all hover:bg-primary-strong hover:shadow-glow active:scale-[0.98]"
            >
              Request Talent
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex h-12 items-center rounded-btn border border-line bg-surface px-7 text-base font-semibold text-foreground shadow-soft transition-colors hover:border-faint active:scale-[0.98]"
            >
              Browse open roles
            </Link>
          </motion.div>

          <motion.ul {...anim(0.32)} className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-faint">
            {content.assurances.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 text-accent" aria-hidden />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>

        <HeroIllustration reduced={!!reduced} />
      </div>
    </section>
  );
}

/** Product-style layered-cards illustration — DOM/SVG, zero image weight, theme-aware. */
function HeroIllustration({ reduced }: { reduced: boolean }) {
  return (
    <div className="relative mx-auto hidden h-[380px] w-full max-w-md sm:block" aria-hidden>
      {/* Job card */}
      <motion.div
        className="absolute left-0 top-2 w-[270px] rounded-card border border-line bg-surface p-5 shadow-lift"
        animate={reduced ? undefined : { y: [0, -8, 0] }}
        transition={reduced ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[15px] font-bold text-foreground">Senior React Developer</p>
        <p className="mt-1 flex items-center gap-1 text-[12.5px] text-faint">
          <MapPin className="size-3" /> Bengaluru · Hybrid · ₹28–36 LPA
        </p>
        <div className="mt-3 flex gap-1.5">
          <Badge variant="blue">Full-time</Badge>
          <Badge variant="purple">5–8 yrs</Badge>
        </div>
      </motion.div>

      {/* Candidate card */}
      <motion.div
        className="absolute right-0 top-[120px] w-[240px] rounded-card border border-line bg-surface p-5 shadow-lift"
        animate={reduced ? undefined : { y: [0, 8, 0] }}
        transition={reduced ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white">
            AS
          </span>
          <div>
            <p className="text-[14.5px] font-bold text-foreground">Ananya S.</p>
            <p className="text-[12px] text-faint">Product Designer · 6 yrs</p>
          </div>
        </div>
        <div className="mt-3">
          <Badge variant="green">Shortlisted</Badge>
        </div>
      </motion.div>

      {/* Placed chip */}
      <motion.div
        className="glass absolute bottom-6 left-[14%] flex w-[250px] items-center gap-3 rounded-card border border-line p-4 shadow-lift"
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={reduced ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <div>
          <p className="text-[14.5px] font-bold text-foreground">Placed in 11 days</p>
          <p className="text-[12px] text-faint">avg. time-to-offer, tech roles</p>
        </div>
      </motion.div>

      {/* Connector lines */}
      <svg className="absolute inset-0 -z-10 size-full text-line" viewBox="0 0 400 380" fill="none">
        <path d="M140 90 C 220 110, 250 140, 290 170" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
        <path d="M270 230 C 220 270, 180 290, 150 310" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" />
      </svg>
    </div>
  );
}
