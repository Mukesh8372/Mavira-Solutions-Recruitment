"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, CircleAlert, FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { applyToJob } from "@/features/jobs/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Mirrors the server-side rules in features/jobs/actions.ts.
const applySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  coverNote: z.string().trim().max(1200, "Keep your note under 1200 characters").optional(),
  website: z.string().max(0).optional(), // honeypot
});

type ApplyValues = z.infer<typeof applySchema>;

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_RESUME_BYTES = 5 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function validateResume(file: File): string | null {
  if (!ALLOWED_RESUME_TYPES.includes(file.type)) return "Resume must be a PDF or Word document (.pdf, .doc, .docx).";
  if (file.size > MAX_RESUME_BYTES) return "Resume is larger than 5 MB.";
  return null;
}

export function ApplyForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: { name: "", email: "", phone: "", coverNote: "", website: "" },
  });

  const [pending, startTransition] = React.useTransition();
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const coverNote = useWatch({ control, name: "coverNote" }) ?? "";

  const acceptFile = (candidate: File | undefined) => {
    if (!candidate) return;
    const error = validateResume(candidate);
    setFileError(error);
    setFile(error ? null : candidate);
  };

  const onSubmit = (values: ApplyValues) => {
    setServerError(null);
    if (!file) {
      setFileError("Attach your resume (PDF or Word, up to 5 MB).");
      return;
    }
    const fd = new FormData();
    fd.set("jobId", jobId);
    fd.set("name", values.name);
    fd.set("email", values.email);
    fd.set("phone", values.phone);
    if (values.coverNote) fd.set("coverNote", values.coverNote);
    if (values.website) fd.set("website", values.website);
    fd.set("resume", file);

    startTransition(async () => {
      const res = await applyToJob(fd);
      if (res.ok) {
        setSuccessMessage(res.message ?? "Application submitted.");
        toast.success("Application submitted");
      } else {
        setServerError(res.error);
      }
    });
  };

  if (successMessage) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-card border border-accent/30 bg-accent-soft p-6"
      >
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="text-[16px] font-bold text-foreground">You&apos;re in the running</p>
          <p className="mt-1 text-[14.5px] leading-relaxed text-body">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5" aria-label={`Apply for ${jobTitle}`}>
      {serverError && (
        <p role="alert" className="flex items-start gap-2 rounded-btn border border-destructive/30 bg-destructive/8 px-4 py-3 text-[14px] font-medium text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {serverError}
        </p>
      )}

      {/* Honeypot — invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="apply-website">Website</label>
        <input id="apply-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="apply-name" label="Full name" error={errors.name?.message}>
          {(props) => <Input {...props} autoComplete="name" placeholder="Priya Sharma" {...register("name")} />}
        </Field>
        <Field id="apply-phone" label="Phone" error={errors.phone?.message}>
          {(props) => <Input {...props} type="tel" autoComplete="tel" placeholder="+91 98765 43210" {...register("phone")} />}
        </Field>
      </div>

      <Field id="apply-email" label="Email" error={errors.email?.message} hint="We'll create a free candidate profile on this email so you can track your application.">
        {(props) => <Input {...props} type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />}
      </Field>

      {/* Resume dropzone */}
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
                if (fileInputRef.current) fileInputRef.current.value = "";
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
            <span className="text-[12.5px] text-faint">PDF, DOC or DOCX · up to 5 MB</span>
            <input
              ref={fileInputRef}
              id="apply-resume"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
        <Field id="apply-cover" label="Cover note (optional)" error={errors.coverNote?.message}>
          {(props) => (
            <Textarea
              {...props}
              rows={5}
              maxLength={1200}
              placeholder="Two or three lines on why this role fits you — specific beats long."
              {...register("coverNote")}
            />
          )}
        </Field>
        <p className="mt-1.5 text-right text-[12px] tabular-nums text-faint" aria-live="polite">
          {coverNote.length}/1200
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" loading={pending} size="lg" className="sm:min-w-52">
          Submit application
        </Button>
        <p className="text-[12.5px] leading-relaxed text-faint">
          Free for candidates — no fees, ever. By applying you agree to be contacted about this role.
        </p>
      </div>
    </form>
  );
}
