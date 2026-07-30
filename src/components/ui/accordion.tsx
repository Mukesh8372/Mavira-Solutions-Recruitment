"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  open: string | null;
  setOpen: (id: string | null) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

export function Accordion({ className, children, defaultOpen }: { className?: string; children: React.ReactNode; defaultOpen?: string }) {
  const [open, setOpen] = React.useState<string | null>(defaultOpen ?? null);
  return (
    <AccordionContext.Provider value={{ open, setOpen }}>
      <div className={cn("divide-y divide-line rounded-card border border-line bg-surface", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");
  const isOpen = ctx.open === id;
  return (
    <div>
      <h3>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold text-foreground transition-colors hover:text-primary"
          aria-expanded={isOpen}
          aria-controls={`accordion-panel-${id}`}
          id={`accordion-trigger-${id}`}
          onClick={() => ctx.setOpen(isOpen ? null : id)}
        >
          {title}
          <ChevronDown className={cn("size-4 shrink-0 text-faint transition-transform duration-250", isOpen && "rotate-180")} aria-hidden />
        </button>
      </h3>
      <div
        id={`accordion-panel-${id}`}
        role="region"
        aria-labelledby={`accordion-trigger-${id}`}
        className={cn("grid transition-[grid-template-rows] duration-250 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-[15px] leading-relaxed text-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
