"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { toast } from "sonner";
import { saveJob } from "@/features/employers/actions";
import { jobSchema, type JobInput } from "@/features/employers/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";

type Department = { id: string; name: string };

export function JobForm({
  departments,
  jobId,
  jobStatus,
  defaults,
}: {
  departments: Department[];
  jobId?: string;
  jobStatus?: string;
  defaults?: Partial<JobInput>;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      workMode: "ONSITE",
      employmentType: "FULL_TIME",
      experienceMin: 0,
      experienceMax: 2,
      salaryVisible: true,
      urgent: false,
      ...defaults,
    },
  });

  const onSubmit = (values: JobInput) => {
    setServerError(null);
    startTransition(async () => {
      const parsed = jobSchema.parse(values);
      const res = await saveJob({ ...parsed, id: jobId });
      if (res.ok) {
        toast.success(res.message ?? (jobId ? "Job updated" : "Job submitted for review"));
        router.push("/employer/jobs");
        router.refresh();
      } else {
        setServerError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {!jobId ? (
        <p className="flex items-start gap-2 rounded-btn border border-primary/25 bg-primary-soft px-3.5 py-2.5 text-[13.5px] text-body">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          New jobs are reviewed by TalentBridge before going live — usually within one business day.
        </p>
      ) : (
        jobStatus === "PUBLISHED" && (
          <p className="flex items-start gap-2 rounded-btn border border-primary/25 bg-primary-soft px-3.5 py-2.5 text-[13.5px] text-body">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            This job is live — your edits publish immediately.
          </p>
        )
      )}

      {serverError && (
        <p role="alert" className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}

      <Field id="job-title" label="Job title" error={errors.title?.message}>
        {(a11y) => <Input {...a11y} placeholder="Senior Backend Engineer" {...register("title")} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="job-department" label="Department" error={errors.departmentId?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("departmentId")}>
              <option value="">Select a department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="job-location" label="Location" error={errors.location?.message}>
          {(a11y) => <Input {...a11y} placeholder="Bengaluru" {...register("location")} />}
        </Field>
        <Field id="job-workmode" label="Work mode" error={errors.workMode?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("workMode")}>
              <option value="ONSITE">On-site</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </Select>
          )}
        </Field>
        <Field id="job-type" label="Employment type" error={errors.employmentType?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("employmentType")}>
              <option value="FULL_TIME">Full-time</option>
              <option value="PART_TIME">Part-time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </Select>
          )}
        </Field>
        <Field id="job-exp-min" label="Experience min (years)" error={errors.experienceMin?.message}>
          {(a11y) => <Input {...a11y} type="number" min={0} max={50} {...register("experienceMin")} />}
        </Field>
        <Field id="job-exp-max" label="Experience max (years)" error={errors.experienceMax?.message}>
          {(a11y) => <Input {...a11y} type="number" min={0} max={50} {...register("experienceMax")} />}
        </Field>
        <Field id="job-salary-min" label="Salary min (₹/year)" error={errors.salaryMin?.message} hint="e.g. 1800000 for 18 LPA. Leave blank to skip.">
          {(a11y) => <Input {...a11y} type="number" min={0} step={100000} {...register("salaryMin")} />}
        </Field>
        <Field id="job-salary-max" label="Salary max (₹/year)" error={errors.salaryMax?.message} hint="e.g. 2800000 for 28 LPA. Leave blank to skip.">
          {(a11y) => <Input {...a11y} type="number" min={0} step={100000} {...register("salaryMax")} />}
        </Field>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3">
        <label className="flex items-center gap-2 text-[14px] text-body">
          <input type="checkbox" className="size-4 accent-primary" {...register("salaryVisible")} />
          Show salary range on the listing
        </label>
        <label className="flex items-center gap-2 text-[14px] text-body">
          <input type="checkbox" className="size-4 accent-primary" {...register("urgent")} />
          Mark as urgent hiring
        </label>
      </div>

      <Field id="job-description" label="Role description" error={errors.description?.message}>
        {(a11y) => <Textarea {...a11y} rows={5} placeholder="What the role is, the team, and why it matters." {...register("description")} />}
      </Field>
      <Field id="job-responsibilities" label="Responsibilities" error={errors.responsibilities?.message} hint="One per line.">
        {(a11y) => <Textarea {...a11y} rows={4} {...register("responsibilities")} />}
      </Field>
      <Field id="job-requirements" label="Requirements" error={errors.requirements?.message} hint="One per line.">
        {(a11y) => <Textarea {...a11y} rows={4} {...register("requirements")} />}
      </Field>
      <Field id="job-benefits" label="Benefits" error={errors.benefits?.message} hint="One per line.">
        {(a11y) => <Textarea {...a11y} rows={3} {...register("benefits")} />}
      </Field>
      <Field id="job-skills" label="Skills" error={errors.skills?.message} hint="Comma-separated, up to 20 — e.g. Node.js, PostgreSQL, AWS">
        {(a11y) => <Input {...a11y} {...register("skills")} />}
      </Field>

      <Button type="submit" loading={pending}>
        {jobId ? "Save changes" : "Submit for review"}
      </Button>
    </form>
  );
}
