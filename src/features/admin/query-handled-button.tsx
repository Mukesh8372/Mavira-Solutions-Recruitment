"use client";

import { useTransition } from "react";
import { Check, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { markQueryHandled } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

export function QueryHandledButton({ queryId, handled }: { queryId: string; handled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={handled}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await markQueryHandled(queryId, !handled);
          if (res.ok) toast.success(res.message ?? "Updated");
          else toast.error(res.error);
        })
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-50",
        handled
          ? "border-line bg-surface text-faint hover:border-faint hover:text-body"
          : "border-accent/40 bg-accent-soft text-accent hover:border-accent"
      )}
    >
      {handled ? <Undo2 className="size-3.5" aria-hidden /> : <Check className="size-3.5" aria-hidden />}
      {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}
