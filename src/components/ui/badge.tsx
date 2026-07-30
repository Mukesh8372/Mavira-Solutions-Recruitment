import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        blue: "bg-primary-soft text-primary",
        purple: "bg-secondary-soft text-secondary",
        green: "bg-accent-soft text-accent",
        red: "bg-destructive/10 text-destructive",
        amber: "bg-warning/12 text-warning",
        neutral: "bg-background-alt text-body border border-line",
        outline: "border border-line text-body",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
