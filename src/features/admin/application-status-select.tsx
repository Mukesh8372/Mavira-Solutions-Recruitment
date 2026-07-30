"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { adminUpdateApplicationStatus } from "@/features/admin/actions";
import { Select } from "@/components/ui/select";
import { labelApplicationStatus } from "@/lib/format";

const statuses = ["APPLIED", "SCREENING", "SHORTLISTED", "INTERVIEW", "OFFERED", "PLACED", "REJECTED", "WITHDRAWN"];

export function AdminApplicationStatusSelect({ applicationId, status }: { applicationId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Change application status"
      value={status}
      disabled={pending}
      className="h-9 w-40 text-[13.5px]"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const res = await adminUpdateApplicationStatus(applicationId, next);
          if (res.ok) toast.success(res.message ?? "Status updated");
          else toast.error(res.error);
        });
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {labelApplicationStatus(s)}
        </option>
      ))}
    </Select>
  );
}
