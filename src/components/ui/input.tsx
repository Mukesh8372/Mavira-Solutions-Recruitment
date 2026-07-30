import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-btn border border-line bg-surface px-3.5 text-[15px] text-foreground placeholder:text-faint",
        "transition-colors focus-visible:border-primary aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
