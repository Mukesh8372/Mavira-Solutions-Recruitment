import { cn } from "@/lib/utils";

/** Server-rendered table primitives for dashboards. Wrap in <TableShell> for card chrome + horizontal scroll. */

export function TableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-card border border-line bg-surface shadow-soft", className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <table className={cn("w-full min-w-[640px] border-collapse text-left", className)}>{children}</table>;
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line bg-background-alt">{children}</tr>
    </thead>
  );
}

export function TH({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("px-4 py-3 text-[12.5px] font-semibold uppercase tracking-wide text-faint", className)}>
      {children}
    </th>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-line">{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("transition-colors hover:bg-background-alt/60", className)}>{children}</tr>;
}

export function TD({
  children,
  className,
  style,
}: {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <td className={cn("px-4 py-3.5 text-[14px] text-body", className)} style={style}>
      {children}
    </td>
  );
}
