import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 font-extrabold tracking-tight", className)}
      aria-label={`${siteConfig.name} — home`}
    >
      <span className="grid size-8 place-items-center rounded-[9px] bg-brand-gradient text-[15px] font-extrabold text-white">
        T
      </span>
      <span className={cn("text-lg", inverse ? "text-white" : "text-foreground")}>{siteConfig.name}</span>
    </Link>
  );
}
