import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-btn border border-line bg-surface px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-faint",
        "transition-colors focus-visible:border-primary aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        "disabled:cursor-not-allowed disabled:opacity-55",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
