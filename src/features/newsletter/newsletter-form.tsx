"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { subscribeNewsletter } from "@/features/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="flex items-center gap-2 text-[14.5px] font-medium text-accent" role="status">
        <Check className="size-4" aria-hidden />
        You&apos;re subscribed. One useful email a month — no spam.
      </p>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await subscribeNewsletter({ email });
          if (res.ok) setDone(true);
          else setError(res.error);
        });
      }}
    >
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your work email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
        />
        {error && (
          <p id="newsletter-error" role="alert" className="mt-1.5 text-[12.5px] font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" loading={pending}>
        Subscribe
      </Button>
    </form>
  );
}
