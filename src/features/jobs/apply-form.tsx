"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { CheckCircle2, CircleAlert, FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { applyToJob, type ApplyErrorCode } from "@/features/jobs/actions";
import { applySchema } from "@/features/jobs/schemas";
import {
  AGE_MAX,
  AGE_MIN,
  INDIAN_CITIES,
  NOTICE_PERIODS,
  QUALIFICATIONS,
  dateOfBirthForAge,
  formatDateOnly,
  noticePeriodLabel,
} from "@/features/jobs/options";
import { RESUME_ACCEPT, RESUME_MAX_BYTES, RESUME_MAX_LABEL, RESUME_TYPE_ERROR, resumeExtFromFileName } from "@/lib/resumes";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/** Raw form values. Validation runs through `applySchema`, the same rules the server uses. */
type FormValues = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  qualification: string;
  currentCity: string;
  currentCompany: string;
  currentDesignation: string;
  experienceYears: string;
  currentCtcLpa: string;
  expectedCtcLpa: string;
  noticePeriodDays: string;
  skills: string;
  linkedinUrl: string;
  coverNote: string;
  consent: boolean;
  website: string;
};

const emptyValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  qualification: "",
  currentCity: "",
  currentCompany: "",
  currentDesignation: "",
  experienceYears: "",
  currentCtcLpa: "",
  expectedCtcLpa: "",
  noticePeriodDays: "",
  skills: "",
  linkedinUrl: "",
  coverNote: "",
  consent: false,
  website: "",
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Fast pre-check in the browser. The server repeats it and also inspects the file bytes. */
function validateResume(file: File): string | null {
  if (!resumeExtFromFileName(file.name)) return RESUME_TYPE_ERROR;
  if (file.size === 0) return "That file is empty.";
  if (file.size > RESUME_MAX_BYTES) return `Your resume is larger than ${RESUME_MAX_LABEL}. Export a smaller PDF and retry.`;
  return null;
}

export function ApplyForm({ jobId, jobTitle, contactEmail }: { jobId: string; jobTitle: string; contactEmail: string }) {
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: emptyValues });

  const [pending, startTransition] = React.useTransition();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [serverError, setServerError] = React.useState<{ message: string; code: ApplyErrorCode } | null>(null);
  const [done, setDone] = React.useState(false);
  // Re-mounting the file input (new key) clears its value without touching a ref.
  const [fileInputKey, setFileInputKey] = React.useState(0);

  const coverNote = useWatch({ control, name: "coverNote" }) ?? "";

  // Date-of-birth bounds come from the same age rule the validator uses.
  const today = React.useMemo(() => new Date(), []);
  const dobMax = formatDateOnly(dateOfBirthForAge(AGE_MIN, today));
  const dobMin = formatDateOnly(dateOfBirthForAge(AGE_MAX, today));

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const error = validateResume(candidate);
    setFileError(error);
    setFile(error ? null : candidate);
  };

  const onSubmit = (values: FormValues) => {
    setServerError(null);
    clearErrors();

    // Same rules as the server, so errors show inline before any upload.
    const parsed = applySchema.safeParse({ ...values, jobId });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field in emptyValues && !errors[field as keyof FormValues]) {
          setError(field as keyof FormValues, { message: issue.message });
        }
      }
    }
    if (!file) setFileError("Attach your resume (PDF or Word, up to 2 MB).");
    if (!parsed.success || !file) return;

    const fd = new FormData();
    fd.set("jobId", jobId);
    for (const [key, value] of Object.entries(values)) {
      if (key === "consent") continue;
      fd.set(key, String(value ?? ""));
    }
    fd.set("consent", values.consent ? "true" : "");
    fd.set("resume", file, file.name);

    startTransition(async () => {
      const res = await applyToJob(fd);
      if (res.ok) {
        setDone(true);
        toast.success("Application submitted");
        return;
      }
      if (res.code === "RESUME") {
        setFileError(res.error);
        setFile(null);
        setFileInputKey((k) => k + 1);
        return;
      }
      if (res.code === "INVALID" && res.field && res.field in emptyValues) {
        setError(res.field as keyof FormValues, { message: res.error });
        return;
      }
      setServerError({ message: res.error, code: res.code });
    });
  };

  if (done) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-card border border-accent/30 bg-accent-soft p-6">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="text-[16px] font-bold text-foreground">Application received</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-body">
            Thank you for applying for {jobTitle}. Our team reviews every application and contacts shortlisted candidates by phone or
            email.
          </p>
        </div>
      </div>
    );
  }

  const fieldError = (name: keyof FormValues) => errors[name]?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" aria-label={`Apply for ${jobTitle}`}>
      {serverError && (
        <div role="alert" className="flex items-start gap-2 rounded-btn border border-destructive/30 bg-destructive/8 px-4 py-3 text-[14px] font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>
            {serverError.message}
            {serverError.code === "STORAGE" && (
              <>
                {" "}
                Email:{" "}
                <a href={`mailto:${contactEmail}?subject=${encodeURIComponent(`Application: ${jobTitle}`)}`} className="underline">
                  {contactEmail}
                </a>
              </>
            )}
          </p>
        </div>
      )}

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="apply-website">Website</label>
        <input id="apply-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-name" label="Full name" error={fieldError("name")}>
          {(p) => <Input {...p} autoComplete="name" placeholder="Priya Sharma" {...register("name")} />}
        </Field>
        <Field id="apply-phone" label="Mobile number" error={fieldError("phone")} hint="10-digit Indian mobile">
          {(p) => <Input {...p} type="tel" inputMode="numeric" autoComplete="tel" placeholder="98765 43210" {...register("phone")} />}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-email" label="Email" error={fieldError("email")}>
          {(p) => <Input {...p} type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />}
        </Field>
        <Field id="apply-dob" label="Date of birth" error={fieldError("dateOfBirth")}>
          {(p) => <Input {...p} type="date" min={dobMin} max={dobMax} autoComplete="bday" {...register("dateOfBirth")} />}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-qualification" label="Highest qualification" error={fieldError("qualification")}>
          {(p) => (
            <Select {...p} {...register("qualification")}>
              <option value="">Select</option>
              {QUALIFICATIONS.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="apply-city" label="Current city" error={fieldError("currentCity")}>
          {(p) => (
            <Select {...p} {...register("currentCity")}>
              <option value="">Select</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-company" label="Current company (optional)" error={fieldError("currentCompany")}>
          {(p) => <Input {...p} autoComplete="organization" placeholder="e.g. Kotak Securities" {...register("currentCompany")} />}
        </Field>
        <Field id="apply-designation" label="Current designation (optional)" error={fieldError("currentDesignation")}>
          {(p) => <Input {...p} autoComplete="organization-title" placeholder="e.g. Relationship Manager" {...register("currentDesignation")} />}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="apply-experience" label="Total experience (years)" error={fieldError("experienceYears")}>
          {(p) => <Input {...p} type="number" inputMode="numeric" min={0} max={50} step={1} placeholder="0 for fresher" {...register("experienceYears")} />}
        </Field>
        <Field id="apply-current-ctc" label="Current CTC (LPA, optional)" error={fieldError("currentCtcLpa")}>
          {(p) => <Input {...p} inputMode="decimal" placeholder="e.g. 6.5" {...register("currentCtcLpa")} />}
        </Field>
        <Field id="apply-expected-ctc" label="Expected CTC (LPA)" error={fieldError("expectedCtcLpa")}>
          {(p) => <Input {...p} inputMode="decimal" placeholder="e.g. 8" {...register("expectedCtcLpa")} />}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-notice" label="Notice period" error={fieldError("noticePeriodDays")}>
          {(p) => (
            <Select {...p} {...register("noticePeriodDays")}>
              <option value="">Select</option>
              {NOTICE_PERIODS.map((d) => (
                <option key={d} value={d}>
                  {noticePeriodLabel(d)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field id="apply-linkedin" label="LinkedIn profile (optional)" error={fieldError("linkedinUrl")}>
          {(p) => <Input {...p} type="url" placeholder="https://www.linkedin.com/in/your-name" {...register("linkedinUrl")} />}
        </Field>
      </div>

      <Field id="apply-skills" label="Key skills (optional)" error={fieldError("skills")} hint="Comma-separated, up to 10. e.g. CASA, Wealth Management, Equity Dealing">
        {(p) => <Input {...p} placeholder="Skill, skill, skill" {...register("skills")} />}
      </Field>

      {/* Resume */}
      <div>
        <span id="apply-resume-label" className="mb-1.5 block text-[13.5px] font-semibold text-foreground">
          Resume
        </span>
        {file ? (
          <div className="flex items-center justify-between gap-3 rounded-btn border border-line bg-background-alt px-4 py-3">
            <span className="flex min-w-0 items-center gap-2.5">
              <FileText className="size-5 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-foreground">{file.name}</span>
                <span className="block text-[12.5px] text-faint">{formatBytes(file.size)}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setFileInputKey((k) => k + 1);
              }}
              aria-label={`Remove ${file.name}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <label
            htmlFor="apply-resume"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-btn border-2 border-dashed px-6 py-8 text-center transition-colors",
              "focus-within:border-primary hover:border-primary",
              dragOver ? "border-primary bg-primary-soft" : "border-line bg-background-alt",
              fileError && "border-destructive"
            )}
          >
            <UploadCloud className="size-6 text-primary" aria-hidden />
            <span className="text-[14px] font-semibold text-foreground">
              Drop your resume here, or <span className="text-primary underline underline-offset-2">browse</span>
            </span>
            <span className="text-[12.5px] text-faint">PDF, DOCX or DOC · up to {RESUME_MAX_LABEL}</span>
            <input
              key={fileInputKey}
              id="apply-resume"
              type="file"
              accept={RESUME_ACCEPT}
              className="sr-only"
              aria-labelledby="apply-resume-label"
              aria-invalid={fileError ? true : undefined}
              aria-describedby={fileError ? "apply-resume-error" : undefined}
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
          </label>
        )}
        {fileError && (
          <p id="apply-resume-error" role="alert" className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-destructive">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {fileError}
          </p>
        )}
      </div>

      <div>
        <Field id="apply-cover" label="Cover note (optional)" error={fieldError("coverNote")}>
          {(p) => <Textarea {...p} rows={4} maxLength={1200} placeholder="Two or three lines on why this role fits you." {...register("coverNote")} />}
        </Field>
        <p className="mt-1.5 text-right text-[12px] tabular-nums text-faint" aria-live="polite">
          {coverNote.length}/1200
        </p>
      </div>

      <div>
        <label htmlFor="apply-consent" className="flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-relaxed text-body">
          <input
            id="apply-consent"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 rounded accent-(--color-primary)"
            aria-invalid={fieldError("consent") ? true : undefined}
            aria-describedby={fieldError("consent") ? "apply-consent-error" : undefined}
            {...register("consent")}
          />
          <span>
            I agree that Mavira Solutions may store my details and resume and contact me about this and similar roles, as described in
            the{" "}
            <Link href="/privacy-policy" className="font-semibold text-primary hover:underline" target="_blank">
              privacy policy
            </Link>
            .
          </span>
        </label>
        {fieldError("consent") && (
          <p id="apply-consent-error" role="alert" className="mt-1.5 flex items-center gap-1 text-[12.5px] font-medium text-destructive">
            <CircleAlert className="size-3.5 shrink-0" aria-hidden />
            {fieldError("consent")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" loading={pending} size="lg" className="sm:min-w-52">
          Submit application
        </Button>
        <p className="text-[12.5px] leading-relaxed text-faint">Free for candidates. No fees at any stage.</p>
      </div>
    </form>
  );
}
