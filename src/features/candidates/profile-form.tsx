"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateCandidateProfile } from "@/features/candidates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";

const schema = z.object({
  headline: z.string().trim().max(80, "Keep the headline under 80 characters").optional(),
  summary: z.string().trim().max(1000, "Keep the summary under 1000 characters").optional(),
  experienceYears: z.coerce.number().min(0, "Can't be negative").max(50, "Really?").optional(),
  location: z.string().trim().max(60).optional(),
  expectedSalary: z.coerce.number().min(0).optional(),
  skills: z.string().trim().max(400).optional(),
  phone: z.string().trim().max(16).optional(),
});
type Values = z.input<typeof schema>;

export function ProfileForm({ defaults }: { defaults: Values }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });

  const onSubmit = (values: Values) => {
    setServerError(null);
    startTransition(async () => {
      const parsed = schema.parse(values);
      const res = await updateCandidateProfile(parsed);
      if (res.ok) toast.success("Profile updated");
      else {
        setServerError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p role="alert" className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}
      <Field id="pf-headline" label="Headline" error={errors.headline?.message} hint='One line that sells you, e.g. "Senior Frontend Engineer — React/TypeScript".'>
        {(a11y) => <Input {...a11y} {...register("headline")} />}
      </Field>
      <Field id="pf-summary" label="Summary" error={errors.summary?.message}>
        {(a11y) => <Textarea {...a11y} rows={4} {...register("summary")} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="pf-exp" label="Experience (years)" error={errors.experienceYears?.message}>
          {(a11y) => <Input {...a11y} type="number" min={0} max={50} {...register("experienceYears")} />}
        </Field>
        <Field id="pf-location" label="Location" error={errors.location?.message}>
          {(a11y) => <Input {...a11y} placeholder="Bengaluru" {...register("location")} />}
        </Field>
        <Field id="pf-salary" label="Expected salary (₹/year)" error={errors.expectedSalary?.message} hint="e.g. 2400000 for 24 LPA">
          {(a11y) => <Input {...a11y} type="number" min={0} step={100000} {...register("expectedSalary")} />}
        </Field>
        <Field id="pf-phone" label="Phone" error={errors.phone?.message}>
          {(a11y) => <Input {...a11y} type="tel" autoComplete="tel" {...register("phone")} />}
        </Field>
      </div>
      <Field id="pf-skills" label="Skills" error={errors.skills?.message} hint="Comma-separated, up to 20 — e.g. React, TypeScript, Node.js">
        {(a11y) => <Input {...a11y} {...register("skills")} />}
      </Field>
      <Button type="submit" loading={pending}>
        Save profile
      </Button>
    </form>
  );
}
