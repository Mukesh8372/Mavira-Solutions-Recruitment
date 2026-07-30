"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateLeadStatus } from "@/features/admin/actions";
import { Select } from "@/components/ui/select";
import { labelLeadStatus } from "@/lib/format";

const statuses = ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];

export function LeadStatusSelect({ leadId, status }: { leadId: string; status: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      aria-label="Change lead status"
      value={status}
      disabled={pending}
      className="h-9 w-36 text-[13.5px]"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const res = await updateLeadStatus(leadId, next);
          if (res.ok) toast.success(res.message ?? "Lead updated");
          else toast.error(res.error);
        });
      }}
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {labelLeadStatus(s)}
        </option>
      ))}
    </Select>
  );
}
