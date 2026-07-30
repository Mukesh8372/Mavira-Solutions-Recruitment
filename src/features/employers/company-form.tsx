"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateCompanyProfile } from "@/features/employers/actions";
import { companySchema, type CompanyInput } from "@/features/employers/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";

const sizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export function CompanyForm({ defaults }: { defaults: CompanyInput }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyInput>({ resolver: zodResolver(companySchema), defaultValues: defaults });

  const sizes = defaults.size && !sizeOptions.includes(defaults.size) ? [defaults.size, ...sizeOptions] : sizeOptions;

  const onSubmit = (values: CompanyInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await updateCompanyProfile(values);
      if (res.ok) toast.success("Company profile updated");
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
      <Field id="co-about" label="About the company" error={errors.about?.message} hint="What you do, your scale, and why candidates should care.">
        {(a11y) => <Textarea {...a11y} rows={5} {...register("about")} />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="co-website" label="Website" error={errors.website?.message}>
          {(a11y) => <Input {...a11y} type="url" placeholder="https://example.com" {...register("website")} />}
        </Field>
        <Field id="co-industry" label="Industry" error={errors.industry?.message}>
          {(a11y) => <Input {...a11y} placeholder="Information Technology" {...register("industry")} />}
        </Field>
        <Field id="co-size" label="Company size" error={errors.size?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("size")}>
              <option value="">Select size</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s} employees
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Button type="submit" loading={pending}>
        Save company profile
      </Button>
    </form>
  );
}
