"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Zap } from "lucide-react";
import { toast } from "sonner";
import type { JobStatus } from "@prisma/client";
import { deleteJob, setJobStatus, updateJobFlags } from "@/features/jobs/admin-actions";
import { JOB_STATUS_TRANSITIONS } from "@/features/jobs/admin-schemas";
import { cn } from "@/lib/utils";

/** Featured / urgent pill toggles for a job row. */
export function JobFlagToggles({ jobId, featured, urgent }: { jobId: string; featured: boolean; urgent: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const toggle = (flags: { featured?: boolean; urgent?: boolean }) =>
    startTransition(async () => {
      const res = await updateJobFlags(jobId, flags);
      if (res.ok) {
        toast.success(res.message ?? "Job updated");
        router.refresh();
      } else toast.error(res.error);
    });

  const pillClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold transition-colors disabled:opacity-50",
      active ? "border-primary/40 bg-primary-soft text-primary" : "border-line bg-surface text-faint hover:border-faint hover:text-body"
    );

  return (
    <span className="inline-flex items-center gap-1.5">
      <button type="button" aria-pressed={featured} aria-label={featured ? "Remove featured flag" : "Mark as featured"} disabled={pending} onClick={() => toggle({ featured: !featured })} className={pillClass(featured)}>
        <Star className="size-3" aria-hidden />
        Featured
      </button>
      <button type="button" aria-pressed={urgent} aria-label={urgent ? "Remove urgent flag" : "Mark as urgent"} disabled={pending} onClick={() => toggle({ urgent: !urgent })} className={pillClass(urgent)}>
        <Zap className="size-3" aria-hidden />
        Urgent
      </button>
    </span>
  );
}

const labels: Record<JobStatus, { verb: string; question: string; tone: string }> = {
  PUBLISHED: { verb: "Publish", question: "Publish this job?", tone: "text-primary" },
  CLOSED: { verb: "Close", question: "Stop accepting applications?", tone: "text-destructive" },
  ARCHIVED: { verb: "Archive", question: "Archive this job?", tone: "text-faint hover:text-destructive" },
  DRAFT: { verb: "Restore to draft", question: "Move back to draft?", tone: "text-primary" },
};

/** Status buttons for the moves allowed from the current status, each with an inline confirm step. */
export function JobStatusButtons({ jobId, status }: { jobId: string; status: JobStatus }) {
  const [confirming, setConfirming] = useState<JobStatus | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (next: JobStatus) =>
    startTransition(async () => {
      const res = await setJobStatus(jobId, next);
      if (res.ok) {
        toast.success(res.message ?? "Job updated");
        router.refresh();
      } else toast.error(res.error);
      setConfirming(null);
    });

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-[13px]">
        <span className="text-faint">{labels[confirming].question}</span>
        <button type="button" disabled={pending} onClick={() => run(confirming)} className={cn("font-semibold hover:underline disabled:opacity-50", labels[confirming].tone)}>
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
      {JOB_STATUS_TRANSITIONS[status].map((next) => (
        <button key={next} type="button" onClick={() => setConfirming(next)} className={cn("transition-colors hover:underline", labels[next].tone)}>
          {status === "CLOSED" && next === "PUBLISHED" ? "Reopen" : labels[next].verb}
        </button>
      ))}
    </span>
  );
}

/**
 * Permanent delete for an archived job. The confirm step states what goes with it:
 * every application and its resume file.
 */
export function DeleteJobButton({ jobId, title, applicationCount }: { jobId: string; title: string; applicationCount: number }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const n = applicationCount;

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="text-[13px] font-semibold text-destructive transition-colors hover:underline">
        Delete
      </button>
    );
  }

  return (
    <span role="alertdialog" aria-label={`Delete ${title}`} className="inline-flex max-w-xs flex-col items-end gap-1.5 text-right text-[12.5px]">
      <span className="text-body">
        Delete &quot;{title}&quot;
        {n > 0 ? ` and its ${n} application${n === 1 ? "" : "s"} with resume${n === 1 ? "" : "s"}` : ""}? This can&apos;t be undone.
      </span>
      <span className="inline-flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteJob(jobId);
              if (res.ok) {
                toast.success(res.message ?? "Job deleted");
                router.refresh();
              } else {
                toast.error(res.error);
                setConfirming(false);
              }
            })
          }
          className="font-semibold text-destructive hover:underline disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Delete permanently"}
        </button>
        <button type="button" disabled={pending} onClick={() => setConfirming(false)} className="font-semibold text-body hover:underline">
          Cancel
        </button>
      </span>
    </span>
  );
}
