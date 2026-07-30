import { cn } from "@/lib/utils";
import { Reveal } from "@/components/shared/reveal";

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "mb-12 flex max-w-2xl flex-col gap-3 md:mb-14",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-primary">{eyebrow}</span>
      )}
      <h2 className="text-3xl font-bold tracking-tight md:text-[40px] md:leading-[1.2]">{title}</h2>
      {lead && <p className="text-[17px] leading-relaxed text-body md:text-lg">{lead}</p>}
    </Reveal>
  );
}
