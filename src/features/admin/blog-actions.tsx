"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteBlogPost } from "@/features/admin/actions";

export function DeleteBlogPostButton({ postId }: { postId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[13px] font-semibold text-faint transition-colors hover:text-destructive"
      >
        Delete
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 text-[13px]">
      <span className="text-faint">Sure?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await deleteBlogPost(postId);
            if (res.ok) toast.success(res.message ?? "Post deleted");
            else toast.error(res.error);
            setConfirming(false);
          })
        }
        className="font-semibold text-destructive hover:underline disabled:opacity-50"
      >
        Yes, delete
      </button>
      <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-body hover:underline">
        No
      </button>
    </span>
  );
}
