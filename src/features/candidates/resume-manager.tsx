"use client";

import { useRef, useState, useTransition } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadResumeAuthed, deleteResume } from "@/features/candidates/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ResumeRow = { id: string; fileName: string; fileUrl: string; sizeBytes: number; isPrimary: boolean };

export function ResumeManager({ resumes }: { resumes: ResumeRow[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  const onUpload = (file: File) => {
    const formData = new FormData();
    formData.set("resume", file);
    startTransition(async () => {
      const res = await uploadResumeAuthed(formData);
      if (res.ok) toast.success("Resume uploaded — it's now your primary resume");
      else toast.error(res.error);
    });
  };

  return (
    <div className="space-y-4">
      {resumes.length === 0 ? (
        <p className="text-[13.5px] text-body">No resume on file yet. Upload one so recruiters can match you.</p>
      ) : (
        <ul className="space-y-2.5">
          {resumes.map((resume) => (
            <li key={resume.id} className="flex items-center gap-3 rounded-lg border border-line px-3.5 py-2.5">
              <FileText className="size-4 shrink-0 text-primary" aria-hidden />
              <a
                href={resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-foreground hover:text-primary"
              >
                {resume.fileName}
              </a>
              <span className="text-[12px] text-faint">{(resume.sizeBytes / 1024).toFixed(0)} KB</span>
              {resume.isPrimary && <Badge variant="green">Primary</Badge>}
              <button
                type="button"
                aria-label={`Delete ${resume.fileName}`}
                disabled={deleting === resume.id}
                onClick={() => {
                  setDeleting(resume.id);
                  startTransition(async () => {
                    const res = await deleteResume(resume.id);
                    if (res.ok) toast.success("Resume deleted");
                    else toast.error(res.error);
                    setDeleting(null);
                  });
                }}
                className="grid size-8 place-items-center rounded-lg text-faint transition-colors hover:bg-destructive/8 hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        aria-label="Upload resume"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (file.size > 5 * 1024 * 1024) {
            toast.error("Resume is larger than 5 MB");
            return;
          }
          onUpload(file);
          e.target.value = "";
        }}
      />
      <Button type="button" variant="secondary" loading={pending} onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" aria-hidden />
        Upload new resume
      </Button>
      <p className="text-[12px] text-faint">PDF or Word, up to 5 MB. The newest upload becomes your primary resume.</p>
    </div>
  );
}
