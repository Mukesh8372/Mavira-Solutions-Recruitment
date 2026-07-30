"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { changePassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Use at least 8 characters"),
});
type Values = z.infer<typeof schema>;

export function ChangePasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = (values: Values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await changePassword(values);
      if (res.ok) {
        toast.success("Password updated");
        reset();
      } else {
        setServerError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4" noValidate>
      {serverError && (
        <p role="alert" className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}
      <Field id="cp-current" label="Current password" error={errors.currentPassword?.message}>
        {(a11y) => <Input {...a11y} type="password" autoComplete="current-password" {...register("currentPassword")} />}
      </Field>
      <Field id="cp-new" label="New password" error={errors.newPassword?.message} hint="At least 8 characters.">
        {(a11y) => <Input {...a11y} type="password" autoComplete="new-password" {...register("newPassword")} />}
      </Field>
      <Button type="submit" loading={pending}>
        Update password
      </Button>
    </form>
  );
}
