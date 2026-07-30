"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert } from "lucide-react";
import { registerCandidate } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  password: z.string().min(8, "Use at least 8 characters"),
  website: z.string().max(0).optional(),
});
type Values = z.infer<typeof schema>;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await registerCandidate(values);
      if (res.ok) {
        router.push(res.redirectTo ?? "/dashboard");
        router.refresh();
      } else {
        setServerError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p role="alert" className="flex items-start gap-2 rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {serverError}
        </p>
      )}
      <Field id="reg-name" label="Full name" error={errors.name?.message}>
        {(a11y) => <Input {...a11y} autoComplete="name" placeholder="Priya Sharma" {...register("name")} />}
      </Field>
      <Field id="reg-email" label="Email" error={errors.email?.message}>
        {(a11y) => <Input {...a11y} type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />}
      </Field>
      <Field id="reg-phone" label="Phone" error={errors.phone?.message}>
        {(a11y) => <Input {...a11y} type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register("phone")} />}
      </Field>
      <Field id="reg-password" label="Password" error={errors.password?.message} hint="At least 8 characters.">
        {(a11y) => <Input {...a11y} type="password" autoComplete="new-password" placeholder="••••••••" {...register("password")} />}
      </Field>
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="reg-website">Website</label>
        <input id="reg-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <Button type="submit" loading={pending} className="w-full">
        Create free account
      </Button>
      <p className="text-center text-[12.5px] leading-relaxed text-faint">
        By creating an account you agree to our Terms of Service and Privacy Policy. We never charge candidates — for
        anything.
      </p>
    </form>
  );
}
