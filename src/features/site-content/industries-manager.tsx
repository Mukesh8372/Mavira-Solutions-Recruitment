"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/shared/icon";
import { contentIconOptions, type IndustryInput } from "@/features/site-content/schemas";
import { saveIndustry, deleteIndustry } from "@/features/site-content/actions";

type IndustryRow = { id: string; name: string; slug: string; icon: string | null; description: string | null; jobCount: number };

const emptyDraft: IndustryInput = { name: "", description: "", icon: "building" };

export function IndustriesManager({ industries }: { industries: IndustryRow[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <IndustryEditor initial={emptyDraft} onClose={() => setEditing(null)} />
      ) : (
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden />
          Add industry
        </Button>
      )}

      <ul className="grid gap-2.5 md:grid-cols-2">
        {industries.map((industry) =>
          editing === industry.id ? (
            <li key={industry.id} className="md:col-span-2">
              <IndustryEditor
                initial={{
                  name: industry.name,
                  description: industry.description ?? "",
                  icon: (industry.icon ?? "building") as IndustryInput["icon"],
                }}
                id={industry.id}
                onClose={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={industry.id} className="flex items-start gap-3 rounded-card border border-line bg-surface p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon name={industry.icon ?? "building"} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-foreground">{industry.name}</p>
                <p className="text-[12px] text-faint">
                  /{industry.slug} · {industry.jobCount} job{industry.jobCount === 1 ? "" : "s"}
                </p>
                {industry.description && <p className="mt-1 line-clamp-2 text-[13px] text-body">{industry.description}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  aria-label={`Edit ${industry.name}`}
                  onClick={() => setEditing(industry.id)}
                  className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                <DeleteIndustryButton id={industry.id} name={industry.name} disabled={industry.jobCount > 0} />
              </div>
            </li>
          )
        )}
      </ul>
      <p className="text-[12.5px] text-faint">
        Renaming keeps the page URL stable so indexed links never break. Industries with jobs attached can&apos;t be deleted.
      </p>
    </div>
  );
}

function IndustryEditor({ initial, id, onClose }: { initial: IndustryInput; id?: string; onClose: () => void }) {
  const [form, setForm] = useState<IndustryInput>(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveIndustry(form, id);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
            onClose();
          } else {
            toast.error(res.error);
          }
        });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-foreground">{id ? "Edit industry" : "New industry"}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
        <div>
          <Label htmlFor={`ind-name-${id ?? "new"}`}>Name</Label>
          <Input id={`ind-name-${id ?? "new"}`} maxLength={48} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`ind-icon-${id ?? "new"}`}>Icon</Label>
          <div className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Icon name={form.icon} className="size-4" />
            </span>
            <Select
              id={`ind-icon-${id ?? "new"}`}
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value as IndustryInput["icon"] })}
            >
              {contentIconOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div>
        <Label htmlFor={`ind-desc-${id ?? "new"}`}>Description</Label>
        <Textarea id={`ind-desc-${id ?? "new"}`} rows={2} maxLength={200} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {id ? "Save changes" : "Add industry"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteIndustryButton({ id, name, disabled }: { id: string; name: string; disabled: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12.5px]">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteIndustry(id);
              if (res.ok) {
                toast.success(res.message);
                router.refresh();
              } else toast.error(res.error);
              setConfirming(false);
            })
          }
          className="font-semibold text-destructive hover:underline disabled:opacity-50"
        >
          Delete
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-body hover:underline">
          Keep
        </button>
      </span>
    );
  }
  return (
    <button
      type="button"
      aria-label={disabled ? `${name} has jobs attached and can't be deleted` : `Delete ${name}`}
      disabled={disabled}
      title={disabled ? "Reassign this industry's jobs first" : undefined}
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
