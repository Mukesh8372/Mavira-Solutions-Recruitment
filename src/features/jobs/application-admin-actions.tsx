"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteApplication, saveApplicationNote, updateApplicationStatus } from "@/features/jobs/admin-actions";
import { APPLICATION_STATUSES } from "@/features/jobs/admin-schemas";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { labelApplicationStatus } from "@/lib/format";

export function ApplicationStatusSelect({ applicationId, status }: { applicationId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Select
      aria-label="Change application status"
      value={status}
      disabled={pending}
      className="h-9 w-36 text-[13.5px]"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const res = await updateApplicationStatus(applicationId, next);
          if (res.ok) {
            toast.success(res.message ?? "Application updated");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      {APPLICATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {labelApplicationStatus(s)}
        </option>
      ))}
    </Select>
  );
}

export function ApplicationNoteEditor({ applicationId, note }: { applicationId: string; note: string }) {
  const [value, setValue] = useState(note);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const id = `note-${applicationId}`;
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveApplicationNote(applicationId, value);
          if (res.ok) {
            toast.success(res.message ?? "Note saved");
            router.refresh();
          } else toast.error(res.error);
        });
      }}
    >
      <label htmlFor={id} className="block text-[12.5px] font-semibold uppercase tracking-wide text-faint">
        Internal note
      </label>
      <Textarea id={id} rows={3} maxLength={2000} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Screening call notes, next step, who owns it." />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" variant="secondary" loading={pending} disabled={value === note}>
          Save note
        </Button>
        <span className="text-[12px] tabular-nums text-faint">{value.length}/2000</span>
      </div>
    </form>
  );
}

/** Deletes the application and its resume file after an inline confirm. */
export function DeleteApplicationButton({ applicationId, applicantName }: { applicationId: string; applicantName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <span className="inline-flex flex-wrap items-center gap-2 text-[13px]">
        <span className="text-faint">Delete the application and resume? This cannot be undone.</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteApplication(applicationId);
              if (res.ok) {
                toast.success(res.message ?? "Application deleted");
                router.refresh();
              } else toast.error(res.error);
              setConfirming(false);
            })
          }
          className="font-semibold text-destructive hover:underline disabled:opacity-50"
        >
          Yes, delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-body hover:underline">
          Keep
        </button>
      </span>
    );
  }
  return (
    <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete the application from ${applicantName}`} className="text-[13px] font-semibold text-faint transition-colors hover:text-destructive">
      Delete
    </button>
  );
}
