"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleAlert } from "lucide-react";
import { loginWithCredentials } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginForm({ next }: { next?: string }) {
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
      const res = await loginWithCredentials({ ...values, next });
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
      <Field id="login-email" label="Email" error={errors.email?.message}>
        {(a11y) => <Input {...a11y} type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />}
      </Field>
      <Field id="login-password" label="Password" error={errors.password?.message}>
        {(a11y) => <Input {...a11y} type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />}
      </Field>
      <Button type="submit" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
