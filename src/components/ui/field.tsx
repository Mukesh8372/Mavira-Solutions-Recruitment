"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Form field wrapper: label + control + inline error wired with aria-describedby.
 * Pass the rendered control via a render prop so it receives the right ids.
 */
export function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-[12.5px] text-faint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-destructive">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
