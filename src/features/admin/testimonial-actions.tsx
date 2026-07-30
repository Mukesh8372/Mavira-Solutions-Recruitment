"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteTestimonial,
  setTestimonialApproval,
  setTestimonialFeatured,
  type AdminActionResult,
} from "@/features/admin/actions";
import { Button } from "@/components/ui/button";

export function TestimonialActions({
  testimonialId,
  approved,
  featured,
}: {
  testimonialId: string;
  approved: boolean;
  featured: boolean;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<AdminActionResult>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) toast.success(res.message ?? "Updated");
      else toast.error(res.error);
      setConfirmingDelete(false);
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={approved ? "secondary" : "primary"}
        loading={pending}
        onClick={() => run(() => setTestimonialApproval(testimonialId, !approved))}
      >
        {approved ? "Unapprove" : "Approve"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        aria-pressed={featured}
        loading={pending}
        onClick={() => run(() => setTestimonialFeatured(testimonialId, !featured))}
      >
        {featured ? "Unfeature" : "Feature"}
      </Button>
      {confirmingDelete ? (
        <span className="inline-flex items-center gap-2 text-[13px]">
          <span className="text-faint">Delete?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => deleteTestimonial(testimonialId))}
            className="font-semibold text-destructive hover:underline disabled:opacity-50"
          >
            Yes, delete
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="font-semibold text-body hover:underline"
          >
            No
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="text-[13px] font-semibold text-faint transition-colors hover:text-destructive"
        >
          Delete
        </button>
      )}
    </div>
  );
}
