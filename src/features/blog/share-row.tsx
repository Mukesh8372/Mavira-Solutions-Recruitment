"use client";

import * as React from "react";
import { Check, Link2 } from "lucide-react";
import { toast } from "sonner";
import { BrandIcon } from "@/components/shared/brand-icons";
import { cn } from "@/lib/utils";

const shareButtonClass = cn(
  "grid size-10 place-items-center rounded-lg border border-line text-body transition-colors",
  "hover:border-primary hover:text-primary"
);

/** Share actions for a blog post: copy link + LinkedIn / X intents. */
export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link — copy it from the address bar instead.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13.5px] font-semibold text-faint">Share</span>
      <div className="flex gap-2">
        <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} className={shareButtonClass}>
          {copied ? <Check className="size-4 text-accent" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        </button>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
          className={shareButtonClass}
        >
          <BrandIcon name="linkedin" className="size-4" />
        </a>
        <a
          href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X"
          className={shareButtonClass}
        >
          <BrandIcon name="x" className="size-4" />
        </a>
      </div>
    </div>
  );
}
