import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-btn font-semibold whitespace-nowrap transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary-strong hover:shadow-glow",
        secondary: "bg-surface text-foreground border border-line shadow-soft hover:border-faint",
        outline: "border border-primary text-primary hover:bg-primary-soft",
        ghost: "text-primary hover:bg-primary-soft",
        destructive: "bg-destructive text-white hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
        inverse: "bg-white text-primary-strong hover:bg-slate-100",
      },
      size: {
        sm: "h-9 px-3.5 text-[13.5px] rounded-lg",
        md: "h-11 px-5 text-[15px]",
        lg: "h-12 px-7 text-base",
        icon: "size-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { buttonVariants };
