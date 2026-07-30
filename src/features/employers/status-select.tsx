"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/features/employers/actions";
import { EMPLOYER_STATUS_TARGETS } from "@/features/employers/schemas";
import { Select } from "@/components/ui/select";
import { labelApplicationStatus } from "@/lib/format";

export function StatusSelect({
  applicationId,
  status,
  candidateName,
}: {
  applicationId: string;
  status: string;
  candidateName: string;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  const targets = EMPLOYER_STATUS_TARGETS as readonly string[];

  return (
    <Select
      value={current}
      disabled={pending}
      aria-label={`Update application status for ${candidateName}`}
      className="h-9 w-40 text-[13.5px]"
      onChange={(e) => {
        const next = e.target.value;
        if (next === current) return;
        const previous = current;
        setCurrent(next);
        startTransition(async () => {
          const res = await updateApplicationStatus(applicationId, next);
          if (res.ok) toast.success(res.message ?? "Status updated");
          else {
            toast.error(res.error);
            setCurrent(previous);
          }
        });
      }}
    >
      {!targets.includes(current) && (
        <option value={current} disabled>
          {labelApplicationStatus(current)}
        </option>
      )}
      {EMPLOYER_STATUS_TARGETS.map((s) => (
        <option key={s} value={s}>
          {labelApplicationStatus(s)}
        </option>
      ))}
    </Select>
  );
}
