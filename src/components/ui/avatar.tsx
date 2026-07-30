import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn("size-10 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-brand-gradient text-sm font-bold text-white",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
