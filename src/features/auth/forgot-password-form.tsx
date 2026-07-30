"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { requestPasswordReset } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <p role="status" className="flex items-start gap-2 rounded-btn border border-accent/30 bg-accent-soft px-3.5 py-3 text-[14px] font-medium text-accent">
        <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
        If an account exists for {email}, a reset link is on its way. Check your inbox (and spam folder).
      </p>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await requestPasswordReset({ email });
          if (res.ok) setDone(true);
          else setError(res.error);
        });
      }}
    >
      <Field id="forgot-email" label="Email" error={error ?? undefined}>
        {(a11y) => (
          <Input
            {...a11y}
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" loading={pending} className="w-full">
        Send reset link
      </Button>
    </form>
  );
}
