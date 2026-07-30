"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type TestimonialItem = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  company: string | null;
  rating: number;
  kind: string;
};

export function TestimonialsCarousel({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(1);
  const reduced = useReducedMotion();
  if (items.length === 0) return null;
  const current = items[index];

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((i) => (i + dir + items.length) % items.length);
  };

  return (
    <div
      className="relative mx-auto max-w-3xl"
      role="group"
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <div className="overflow-hidden rounded-modal border border-line bg-surface p-8 shadow-card md:p-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={current.id}
            initial={reduced ? false : { opacity: 0, x: 32 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -32 * direction }}
            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex gap-0.5 text-warning" aria-label={`${current.rating} out of 5 stars`}>
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden />
              ))}
            </div>
            <blockquote className="mt-5">
              <p className="text-[19px] font-medium leading-relaxed text-foreground md:text-[22px]">
                &ldquo;{current.quote}&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <Avatar name={current.authorName} />
              <div>
                <p className="text-[14.5px] font-bold text-foreground">{current.authorName}</p>
                <p className="text-[13px] text-faint">
                  {current.authorRole}
                  {current.company ? ` · ${current.company}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "ml-auto hidden rounded-full px-2.5 py-1 text-[11.5px] font-semibold sm:block",
                  current.kind === "CLIENT" ? "bg-secondary-soft text-secondary" : "bg-accent-soft text-accent"
                )}
              >
                {current.kind === "CLIENT" ? "Employer" : "Candidate"}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          className="grid size-10 place-items-center rounded-full border border-line bg-surface text-body transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Choose testimonial">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1} of ${items.length}`}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={cn(
                "h-2 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-2 bg-line hover:bg-faint"
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next testimonial"
          className="grid size-10 place-items-center rounded-full border border-line bg-surface text-body transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
