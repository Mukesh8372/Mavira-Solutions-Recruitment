"use client";

import { useRef, useState, useTransition } from "react";
import { Check, CloudUpload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { uploadResumeToPool } from "@/features/jobs/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const allowedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const maxBytes = 5 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function validateFile(file: File): string | null {
  if (!allowedTypes.includes(file.type)) return "Use a PDF or Word document (.pdf, .doc, .docx).";
  if (file.size > maxBytes) return "That file is over 5 MB — export a lighter version and try again.";
  return null;
}

export function ResumeUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  if (done) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-4 rounded-card border border-accent/30 bg-accent-soft p-8"
      >
        <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
          <Check className="size-5" strokeWidth={3} aria-hidden />
        </span>
        <div>
          <p className="text-lg font-bold text-foreground">Resume received</p>
          <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-body">
            You&apos;re in our talent pool now. A placement consultant will reach out the moment a matching role opens —
            and you can apply to live openings any time.
          </p>
        </div>
      </div>
    );
  }

  const acceptFile = (f: File) => {
    const err = validateFile(f);
    setFileError(err);
    setFile(err ? null : f);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();

    const errs: Record<string, string> = {};
    if (name.length < 2) errs.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email address";
    if (phone.length < 8 || phone.length > 16) errs.phone = "Enter a valid phone number";
    setFieldErrors(errs);
    if (!file) {
      setFileError("Attach your resume to continue.");
      return;
    }
    if (Object.keys(errs).length > 0) return;

    data.set("resume", file);
    startTransition(async () => {
      const res = await uploadResumeToPool(data);
      if (res.ok) {
        setDone(true);
        toast.success(res.message ?? "Resume received.");
      } else {
        setServerError(res.error);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {/* Honeypot — hidden from humans, tempting for bots */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden>
        <label htmlFor="ru-website">Website</label>
        <input id="ru-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="ru-name" label="Full name" error={fieldErrors.name}>
          {(props) => <Input {...props} name="name" placeholder="As on your resume" autoComplete="name" />}
        </Field>
        <Field id="ru-phone" label="Phone" error={fieldErrors.phone}>
          {(props) => <Input {...props} name="phone" type="tel" placeholder="+91 98xxx xxxxx" autoComplete="tel" />}
        </Field>
      </div>
      <Field id="ru-email" label="Email" error={fieldErrors.email}>
        {(props) => <Input {...props} name="email" type="email" placeholder="you@example.com" autoComplete="email" />}
      </Field>

      {/* Dropzone */}
      <div>
        <span className="mb-1.5 block text-[13.5px] font-semibold text-foreground" id="ru-resume-label">
          Resume
        </span>
        {file ? (
          <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <FileText className="size-4.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-foreground">{file.name}</p>
              <p className="text-[12.5px] text-faint">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label={`Remove ${file.name}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button
            type="button"
            aria-describedby="ru-resume-hint"
            aria-labelledby="ru-resume-label"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) acceptFile(dropped);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragOver ? "border-primary bg-primary-soft" : "border-line bg-surface hover:border-primary/50 hover:bg-primary-soft/40"
            )}
          >
            <span className={cn("grid size-11 place-items-center rounded-full", dragOver ? "bg-primary text-white" : "bg-primary-soft text-primary")}>
              <CloudUpload className="size-5" aria-hidden />
            </span>
            <span className="text-[14.5px] font-semibold text-foreground">
              {dragOver ? "Drop it here" : "Drag your resume here, or click to browse"}
            </span>
            <span id="ru-resume-hint" className="text-[12.5px] text-faint">
              PDF, DOC or DOCX · up to 5 MB
            </span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) acceptFile(f);
          }}
        />
        {fileError && (
          <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-destructive">
            {fileError}
          </p>
        )}
      </div>

      {serverError && (
        <p role="alert" className="rounded-btn bg-destructive/10 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
        Join the talent pool
      </Button>
      <p className="text-[12.5px] text-faint">
        Zero fees, ever. Your resume is shared with employers only for roles you match — never sold, never spammed.
      </p>
    </form>
  );
}
