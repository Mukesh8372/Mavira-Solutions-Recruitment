import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 font-extrabold tracking-tight", className)}
      aria-label={`${siteConfig.name} — home`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-[9px] bg-white object-contain"
      />
      <span className={cn("leading-tight", inverse ? "text-white" : "text-foreground")}>
        <span className="block text-[17px]">{siteConfig.name}</span>
        <span className={cn("block text-[10px] font-semibold uppercase tracking-[0.14em]", inverse ? "text-white/70" : "text-faint")}>
          Private Limited
        </span>
      </span>
    </Link>
  );
}
