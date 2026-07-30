"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

/**
 * Dismissal is remembered per announcement text in localStorage —
 * publishing a new announcement automatically un-dismisses the bar.
 */
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function storageKey(text: string) {
  return `tb-announcement-dismissed:${text}`;
}

function dismiss(text: string) {
  try {
    localStorage.setItem(storageKey(text), "1");
  } catch {
    /* private mode — bar just stays for the session */
  }
  listeners.forEach((cb) => cb());
}

export function AnnouncementBarClient({ text, linkLabel, href }: { text: string; linkLabel?: string; href?: string }) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey(text)) === "1";
      } catch {
        return false;
      }
    },
    () => false
  );
  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-brand-gradient text-white">
      <div className="container-site flex min-h-10 items-center justify-center gap-3 py-1.5 pr-10 text-center">
        <p className="text-[13px] font-semibold leading-snug">
          {text}
          {href && linkLabel && (
            <Link href={href} className="ml-2 inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-90">
              {linkLabel}
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(text)}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-white/85 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
