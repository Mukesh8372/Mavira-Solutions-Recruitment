"use client";

import { useState, useTransition } from "react";
import { Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { setJobStatus, updateJobFlags } from "@/features/admin/actions";
import { cn } from "@/lib/utils";

/** Featured / urgent pill toggles for a job row. */
export function JobFlagToggles({ jobId, featured, urgent }: { jobId: string; featured: boolean; urgent: boolean }) {
  const [pending, startTransition] = useTransition();

  const toggle = (flags: { featured?: boolean; urgent?: boolean }) =>
    startTransition(async () => {
      const res = await updateJobFlags(jobId, flags);
      if (res.ok) toast.success(res.message ?? "Job updated");
      else toast.error(res.error);
    });

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors disabled:opacity-50",
      active
        ? "border-primary/40 bg-primary-soft text-primary"
        : "border-line bg-surface text-faint hover:border-faint hover:text-body"
    );

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        aria-pressed={featured}
        aria-label={featured ? "Remove featured flag" : "Mark as featured"}
        disabled={pending}
        onClick={() => toggle({ featured: !featured })}
        className={pillClass(featured)}
      >
        <Star className="size-3" aria-hidden />
        Featured
      </button>
      <button
        type="button"
        aria-pressed={urgent}
        aria-label={urgent ? "Remove urgent flag" : "Mark as urgent"}
        disabled={pending}
        onClick={() => toggle({ urgent: !urgent })}
        className={pillClass(urgent)}
      >
        <Zap className="size-3" aria-hidden />
        Urgent
      </button>
    </span>
  );
}

/** Publish / close controls with an inline confirm step. */
export function JobStatusButtons({ jobId, status }: { jobId: string; status: string }) {
  const [confirming, setConfirming] = useState<"PUBLISHED" | "CLOSED" | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (next: "PUBLISHED" | "CLOSED") =>
    startTransition(async () => {
      const res = await setJobStatus(jobId, next);
      if (res.ok) toast.success(res.message ?? "Job updated");
      else toast.error(res.error);
      setConfirming(null);
    });

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-[13px]">
        <span className="text-faint">{confirming === "PUBLISHED" ? "Publish?" : "Close?"}</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(confirming)}
          className={cn(
            "font-semibold hover:underline disabled:opacity-50",
            confirming === "PUBLISHED" ? "text-primary" : "text-destructive"
          )}
        >
          Yes
        </button>
        <button type="button" onClick={() => setConfirming(null)} className="font-semibold text-body hover:underline">
          No
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3 text-[13px] font-semibold">
      {status !== "PUBLISHED" && (
        <button type="button" onClick={() => setConfirming("PUBLISHED")} className="text-primary hover:underline">
          Publish
        </button>
      )}
      {status === "PUBLISHED" && (
        <button
          type="button"
          onClick={() => setConfirming("CLOSED")}
          className="text-faint transition-colors hover:text-destructive"
        >
          Close
        </button>
      )}
    </span>
  );
}
