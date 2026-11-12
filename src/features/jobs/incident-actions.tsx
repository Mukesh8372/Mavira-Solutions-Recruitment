"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resolveIncident } from "@/features/jobs/admin-actions";

export function ResolveIncidentButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await resolveIncident(id);
          if (res.ok) {
            toast.success(res.message ?? "Resolved");
            router.refresh();
          } else toast.error(res.error);
        })
      }
      className="rounded-btn border border-line bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-body transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
    >
      Mark resolved
    </button>
  );
}
