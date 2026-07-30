"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { toggleSaveJob } from "@/features/jobs/actions";
import { cn } from "@/lib/utils";

export function JobCardActions({
  jobId,
  slug,
  title,
  initialSaved,
}: {
  jobId: string;
  slug: string;
  title: string;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(!!initialSaved);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const onSave = () => {
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const res = await toggleSaveJob(jobId);
      if (!res.ok) {
        setSaved(!next);
        if (res.error === "unauthenticated") {
          toast("Sign in to save jobs", {
            description: "Create a free candidate account to build your shortlist.",
            action: { label: "Sign in", onClick: () => router.push(`/login?next=/jobs/${slug}`) },
          });
        } else {
          toast.error(res.error);
        }
      }
    });
  };

  const onShare = async () => {
    const url = `${window.location.origin}/jobs/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user dismissed the share sheet */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex gap-1.5">
      <button
        type="button"
        onClick={onSave}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${title} from saved jobs` : `Save ${title}`}
        className={cn(
          "grid size-8 place-items-center rounded-lg border transition-colors",
          saved ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-line text-faint hover:border-primary hover:text-primary"
        )}
      >
        <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
      </button>
      <button
        type="button"
        onClick={onShare}
        aria-label={`Share ${title}`}
        className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
      >
        <Share2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
