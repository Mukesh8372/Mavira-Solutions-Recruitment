"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createCategory, deleteCategory, moveCategoryJobsAndDelete, renameCategory } from "@/features/jobs/category-actions";

export type CategoryRow = { id: string; name: string; slug: string; jobCount: number; openJobCount: number };

type Mode = { kind: "add" } | { kind: "rename"; id: string } | { kind: "move"; id: string } | null;

const iconButton =
  "grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function CategoriesManager({ categories }: { categories: CategoryRow[] }) {
  const [mode, setMode] = useState<Mode>(null);
  const close = () => setMode(null);

  return (
    <div className="space-y-4">
      {mode?.kind === "add" ? (
        <NameEditor title="New role category" submitLabel="Add category" initial="" onClose={close} onSave={(name) => createCategory(name)} />
      ) : (
        <Button type="button" onClick={() => setMode({ kind: "add" })}>
          <Plus className="size-4" aria-hidden />
          Add category
        </Button>
      )}

      <ul className="space-y-2">
        {categories.map((c) => {
          if (mode?.kind === "rename" && mode.id === c.id) {
            return (
              <li key={c.id}>
                <NameEditor
                  title={`Rename "${c.name}"`}
                  submitLabel="Save name"
                  initial={c.name}
                  hint={
                    c.jobCount === 0
                      ? "No job uses this category, so its page URL changes to match the new name."
                      : `The page URL stays /jobs/category/${c.slug} because jobs use this category.`
                  }
                  onClose={close}
                  onSave={(name) => renameCategory(c.id, name)}
                />
              </li>
            );
          }
          if (mode?.kind === "move" && mode.id === c.id) {
            return (
              <li key={c.id}>
                <MoveAndDelete category={c} others={categories.filter((o) => o.id !== c.id)} onClose={close} />
              </li>
            );
          }
          return (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-foreground">{c.name}</p>
                <p className="text-[12px] text-faint">
                  /jobs/category/{c.slug} · {c.jobCount} job{c.jobCount === 1 ? "" : "s"} ({c.openJobCount} open)
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  aria-label={`Rename ${c.name}`}
                  title="Rename"
                  onClick={() => setMode({ kind: "rename", id: c.id })}
                  className={`${iconButton} hover:border-primary hover:text-primary`}
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                {c.jobCount > 0 ? (
                  <button
                    type="button"
                    aria-label={`Move the jobs in ${c.name} to another category, then delete it`}
                    title="Move jobs, then delete"
                    onClick={() => setMode({ kind: "move", id: c.id })}
                    className={`${iconButton} hover:border-destructive hover:text-destructive`}
                  >
                    <ArrowRightLeft className="size-3.5" aria-hidden />
                  </button>
                ) : (
                  <DeleteButton id={c.id} name={c.name} />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-[12.5px] text-faint">
        A category that jobs use can&apos;t be deleted directly. Use <ArrowRightLeft className="inline size-3.5" aria-label="Move jobs, then delete" /> to
        move its jobs to another category first. Draft, closed and archived jobs count too.
      </p>
    </div>
  );
}

function NameEditor({
  title,
  submitLabel,
  initial,
  hint,
  onClose,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial: string;
  hint?: string;
  onClose: () => void;
  onSave: (name: string) => Promise<{ ok: true; message?: string } | { ok: false; error: string }>;
}) {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const inputId = `cat-name-${title.length}-${initial.length}`;

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const res = await onSave(name);
          if (res.ok) {
            toast.success(res.message ?? "Saved");
            router.refresh();
            onClose();
          } else {
            setError(res.error);
          }
        });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-foreground">{title}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div>
        <Label htmlFor={inputId}>Name</Label>
        <Input
          id={inputId}
          maxLength={48}
          required
          autoFocus
          value={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-[13px] font-medium text-destructive">
            {error}
          </p>
        )}
        {hint && <p className="mt-1.5 text-[12.5px] text-faint">{hint}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MoveAndDelete({ category, others, onClose }: { category: CategoryRow; others: CategoryRow[]; onClose: () => void }) {
  const [targetId, setTargetId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const n = category.jobCount;

  return (
    <form
      className="space-y-3 rounded-card border border-destructive/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!targetId) {
          setError("Choose the category to move the jobs to.");
          return;
        }
        setError(null);
        startTransition(async () => {
          const res = await moveCategoryJobsAndDelete(category.id, targetId);
          if (res.ok) {
            toast.success(res.message ?? "Done");
            router.refresh();
            onClose();
          } else {
            setError(res.error);
          }
        });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-foreground">Delete &quot;{category.name}&quot;</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="text-[13.5px] text-body">
        {n} job{n === 1 ? " uses" : "s use"} this category. They move to the category you choose, and then &quot;{category.name}&quot; is
        deleted. This can&apos;t be undone.
      </p>
      <div>
        <Label htmlFor={`move-${category.id}`}>Move the jobs to</Label>
        <Select
          id={`move-${category.id}`}
          value={targetId}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setTargetId(e.target.value);
            setError(null);
          }}
        >
          <option value="">Select a category</option>
          {others.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
        {error && (
          <p role="alert" className="mt-1.5 text-[13px] font-medium text-destructive">
            {error}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" loading={pending}>
          Move {n} job{n === 1 ? "" : "s"} and delete
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-[12.5px]">
        <span className="text-body">Delete?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteCategory(id);
              if (res.ok) {
                toast.success(res.message ?? "Deleted");
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
      aria-label={`Delete ${name}`}
      title="Delete"
      onClick={() => setConfirming(true)}
      className={`${iconButton} hover:border-destructive hover:text-destructive`}
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
