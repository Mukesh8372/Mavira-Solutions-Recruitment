"use client";

import { useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveJob } from "@/features/jobs/admin-actions";
import { EMPLOYMENT_TYPES, JOB_FORM_STATUSES, WORK_MODES, istToday, jobSchema, type JobInput } from "@/features/jobs/admin-schemas";
import { labelEmploymentType, labelWorkMode } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuickAddCategory, QuickAddIndustry } from "@/features/jobs/quick-add";

export type JobFormOptions = {
  departments: { id: string; name: string }[];
  industries: { id: string; name: string }[];
};

/** Raw form values. Validation runs through `jobSchema`, the same rules the server uses. */
export type JobFormValues = {
  title: string;
  departmentId: string;
  industryId: string;
  employerLabel: string;
  location: string;
  workMode: (typeof WORK_MODES)[number];
  employmentType: (typeof EMPLOYMENT_TYPES)[number];
  experienceMin: string;
  experienceMax: string;
  salaryMinLpa: string;
  salaryMaxLpa: string;
  salaryVisible: boolean;
  featured: boolean;
  urgent: boolean;
  validThrough: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string;
  seoTitle: string;
  seoDescription: string;
  status: (typeof JOB_FORM_STATUSES)[number];
};

export const emptyJobValues: JobFormValues = {
  title: "",
  departmentId: "",
  industryId: "",
  employerLabel: "",
  location: "",
  workMode: "ONSITE",
  employmentType: "FULL_TIME",
  experienceMin: "0",
  experienceMax: "2",
  salaryMinLpa: "",
  salaryMaxLpa: "",
  salaryVisible: true,
  featured: false,
  urgent: false,
  validThrough: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  skills: "",
  seoTitle: "",
  seoDescription: "",
  status: "DRAFT",
};

export function JobForm({
  options,
  jobId,
  currentStatus,
  defaults,
}: {
  options: JobFormOptions;
  jobId?: string;
  currentStatus?: string;
  defaults?: Partial<JobFormValues>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Local copies so a category or industry added from this form appears at once.
  const [departments, setDepartments] = useState(options.departments);
  const [industries, setIndustries] = useState(options.industries);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<JobFormValues>({ defaultValues: { ...emptyJobValues, ...defaults } });

  const locked = currentStatus === "CLOSED" || currentStatus === "ARCHIVED";

  const onSubmit = (values: JobFormValues) => {
    setServerError(null);
    clearErrors();
    const input: JobInput = values;
    const parsed = jobSchema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in emptyJobValues && !errors[field as keyof JobFormValues]) {
          setError(field as keyof JobFormValues, { message: issue.message });
        }
      }
      setServerError("Please fix the highlighted fields.");
      return;
    }
    startTransition(async () => {
      const res = await saveJob(input, jobId);
      if (res.ok) {
        toast.success(res.message ?? "Job saved");
        router.push("/admin/jobs");
        router.refresh();
      } else {
        if (res.field && res.field in emptyJobValues) setError(res.field as keyof JobFormValues, { message: res.error });
        setServerError(res.error);
        toast.error(res.error);
      }
    });
  };

  const err = (name: keyof JobFormValues) => errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {serverError && (
        <p role="alert" className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="mb-1 text-[15px] font-bold text-foreground">Role</legend>
        <Field id="job-title" label="Job title" error={err("title")}>
          {(a) => <Input {...a} maxLength={80} placeholder="Relationship Manager — Wealth" {...register("title")} />}
        </Field>
        <Field
          id="job-employer"
          label="Hiring company (shown on the website)"
          error={err("employerLabel")}
          hint="Describe the employer without naming it, e.g. “Leading private bank” or “Top broking house”."
        >
          {(a) => <Input {...a} maxLength={80} placeholder="Leading private bank" {...register("employerLabel")} />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Field id="job-department" label="Role category" error={err("departmentId")}>
              {(a) => (
                <Select {...a} {...register("departmentId")}>
                  <option value="">Select a category</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <QuickAddCategory
              onAdded={(option, isNew) => {
                // Render the new <option> first, or the select can't show it as chosen.
                if (isNew) flushSync(() => setDepartments((list) => [...list, option].sort((x, y) => x.name.localeCompare(y.name))));
                setValue("departmentId", option.id, { shouldDirty: true });
                clearErrors("departmentId");
              }}
            />
          </div>
          <div>
            <Field id="job-industry" label="Industry (optional)" error={err("industryId")} hint="Shown on the industry's public page.">
              {(a) => (
                <Select {...a} {...register("industryId")}>
                  <option value="">None</option>
                  {industries.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <QuickAddIndustry
              onAdded={(option) => {
                flushSync(() => setIndustries((list) => [...list, option].sort((x, y) => x.name.localeCompare(y.name))));
                setValue("industryId", option.id, { shouldDirty: true });
                clearErrors("industryId");
              }}
            />
          </div>
          <Field id="job-location" label="Location" error={err("location")}>
            {(a) => <Input {...a} maxLength={60} placeholder="Thane" {...register("location")} />}
          </Field>
          <Field id="job-workmode" label="Work mode" error={err("workMode")}>
            {(a) => (
              <Select {...a} {...register("workMode")}>
                {WORK_MODES.map((m) => (
                  <option key={m} value={m}>
                    {labelWorkMode(m)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="job-type" label="Employment type" error={err("employmentType")}>
            {(a) => (
              <Select {...a} {...register("employmentType")}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {labelEmploymentType(t)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field id="job-validthrough" label="Apply by (optional)" error={err("validThrough")} hint="Applications close at the end of this day (IST). Leave blank for no deadline.">
            {(a) => <Input {...a} type="date" min={istToday()} {...register("validThrough")} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-[15px] font-bold text-foreground">Experience and salary</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="job-exp-min" label="Experience min (years)" error={err("experienceMin")}>
            {(a) => <Input {...a} type="number" min={0} max={50} step={1} {...register("experienceMin")} />}
          </Field>
          <Field id="job-exp-max" label="Experience max (years)" error={err("experienceMax")}>
            {(a) => <Input {...a} type="number" min={0} max={50} step={1} {...register("experienceMax")} />}
          </Field>
          <Field id="job-salary-min" label="Salary min (LPA, optional)" error={err("salaryMinLpa")} hint="e.g. 4.5">
            {(a) => <Input {...a} inputMode="decimal" {...register("salaryMinLpa")} />}
          </Field>
          <Field id="job-salary-max" label="Salary max (LPA, optional)" error={err("salaryMaxLpa")} hint="e.g. 7">
            {(a) => <Input {...a} inputMode="decimal" {...register("salaryMaxLpa")} />}
          </Field>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <label className="flex items-center gap-2 text-[14px] text-body">
            <input type="checkbox" className="size-4 accent-(--color-primary)" {...register("salaryVisible")} />
            Show the salary range publicly
          </label>
          <label className="flex items-center gap-2 text-[14px] text-body">
            <input type="checkbox" className="size-4 accent-(--color-primary)" {...register("featured")} />
            Featured (shown first)
          </label>
          <label className="flex items-center gap-2 text-[14px] text-body">
            <input type="checkbox" className="size-4 accent-(--color-primary)" {...register("urgent")} />
            Urgent hiring
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-[15px] font-bold text-foreground">Description</legend>
        <Field id="job-description" label="About the role" error={err("description")} hint="Blank line between paragraphs.">
          {(a) => <Textarea {...a} rows={6} maxLength={6000} {...register("description")} />}
        </Field>
        <Field id="job-responsibilities" label="Responsibilities (optional)" error={err("responsibilities")} hint="One per line, up to 20.">
          {(a) => <Textarea {...a} rows={4} maxLength={3000} {...register("responsibilities")} />}
        </Field>
        <Field id="job-requirements" label="Requirements (optional)" error={err("requirements")} hint="One per line, up to 20.">
          {(a) => <Textarea {...a} rows={4} maxLength={3000} {...register("requirements")} />}
        </Field>
        <Field id="job-benefits" label="Benefits (optional)" error={err("benefits")} hint="One per line, up to 20.">
          {(a) => <Textarea {...a} rows={3} maxLength={3000} {...register("benefits")} />}
        </Field>
        <Field id="job-skills" label="Skills (optional)" error={err("skills")} hint="Comma-separated, up to 20. e.g. CASA, Wealth Management, Equity Dealing">
          {(a) => <Input {...a} maxLength={400} {...register("skills")} />}
        </Field>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-[15px] font-bold text-foreground">Search engines (optional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="job-seo-title" label="SEO title" error={err("seoTitle")} hint="Up to 70 characters.">
            {(a) => <Input {...a} maxLength={70} {...register("seoTitle")} />}
          </Field>
          <Field id="job-seo-desc" label="SEO description" error={err("seoDescription")} hint="Up to 160 characters.">
            {(a) => <Input {...a} maxLength={160} {...register("seoDescription")} />}
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-4 border-t border-line pt-5">
        <Field id="job-status" label="Status" error={err("status")} className="sm:w-56" hint={locked ? `This job is ${currentStatus?.toLowerCase()}. Use the status buttons on the jobs list to reopen it.` : undefined}>
          {(a) => (
            <Select {...a} {...register("status")}>
              <option value="DRAFT">Draft (hidden)</option>
              <option value="PUBLISHED">Published (live)</option>
            </Select>
          )}
        </Field>
        <Button type="submit" loading={pending}>
          {jobId ? "Save changes" : "Save job"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/jobs")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
