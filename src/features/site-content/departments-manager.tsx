"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Icon } from "@/components/shared/icon";
import { contentIconOptions, type DepartmentInput } from "@/features/site-content/schemas";
import { saveDepartment, deleteDepartment } from "@/features/site-content/actions";

type DepartmentRow = { id: string; name: string; slug: string; icon: string | null; jobCount: number };

const emptyDraft: DepartmentInput = { name: "", icon: "briefcase-business" };

export function DepartmentsManager({ departments }: { departments: DepartmentRow[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <DepartmentEditor initial={emptyDraft} onClose={() => setEditing(null)} />
      ) : (
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden />
          Add category
        </Button>
      )}

      <ul className="grid gap-2.5 md:grid-cols-2">
        {departments.map((dept) =>
          editing === dept.id ? (
            <li key={dept.id} className="md:col-span-2">
              <DepartmentEditor
                initial={{ name: dept.name, icon: (dept.icon ?? "briefcase-business") as DepartmentInput["icon"] }}
                id={dept.id}
                onClose={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={dept.id} className="flex items-center gap-3 rounded-card border border-line bg-surface p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Icon name={dept.icon ?? "briefcase-business"} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-foreground">{dept.name}</p>
                <p className="text-[12px] text-faint">
                  /jobs/category/{dept.slug} · {dept.jobCount} job{dept.jobCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  aria-label={`Edit ${dept.name}`}
                  onClick={() => setEditing(dept.id)}
                  className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                <DeleteDepartmentButton id={dept.id} name={dept.name} disabled={dept.jobCount > 0} />
              </div>
            </li>
          )
        )}
      </ul>
      <p className="text-[12.5px] text-faint">
        Renaming keeps the landing-page URL stable. Categories with jobs attached can&apos;t be deleted.
      </p>
    </div>
  );
}

function DepartmentEditor({ initial, id, onClose }: { initial: DepartmentInput; id?: string; onClose: () => void }) {
  const [form, setForm] = useState<DepartmentInput>(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const fid = id ?? "new";

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveDepartment(form, id);
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
        <p className="text-[14px] font-bold text-foreground">{id ? "Edit category" : "New category"}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
        <div>
          <Label htmlFor={`dept-name-${fid}`}>Name</Label>
          <Input id={`dept-name-${fid}`} maxLength={48} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`dept-icon-${fid}`}>Icon</Label>
          <div className="flex items-center gap-2">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Icon name={form.icon} className="size-4" />
            </span>
            <Select id={`dept-icon-${fid}`} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as DepartmentInput["icon"] })}>
              {contentIconOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {id ? "Save changes" : "Add category"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteDepartmentButton({ id, name, disabled }: { id: string; name: string; disabled: boolean }) {
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
              const res = await deleteDepartment(id);
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
      title={disabled ? "Reassign this category's jobs first" : undefined}
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
