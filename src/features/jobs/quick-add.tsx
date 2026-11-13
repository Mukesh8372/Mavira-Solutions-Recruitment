"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/shared/icon";
import { createCategory } from "@/features/jobs/category-actions";
import { saveIndustry } from "@/features/site-content/actions";
import { contentIconOptions, type IndustryInput } from "@/features/site-content/schemas";

type Option = { id: string; name: string };

/*
 * These panels sit inside the job form, so they must not render a nested <form>.
 * Enter in a text box adds the item instead of submitting the job.
 */

function AddLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline">
      <Plus className="size-3.5" aria-hidden />
      {label}
    </button>
  );
}

export function QuickAddCategory({ onAdded }: { onAdded: (option: Option, isNew: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) return <AddLink label="Add new category" onClick={() => setOpen(true)} />;

  const close = () => {
    setOpen(false);
    setName("");
    setError(null);
  };
  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await createCategory(name);
      if (res.ok && res.id && res.name) {
        toast.success(`Category "${res.name}" added`);
        onAdded({ id: res.id, name: res.name }, true);
        close();
      } else if (!res.ok && res.existingId) {
        // Same name already exists: select it rather than create a duplicate.
        onAdded({ id: res.existingId, name: "" }, false);
        toast.info(res.error);
        close();
      } else if (!res.ok) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="mt-2 space-y-2 rounded-card border border-primary/40 bg-background-alt p-3">
      <Label htmlFor="quick-category">New category name</Label>
      <Input
        id="quick-category"
        maxLength={48}
        autoFocus
        value={name}
        placeholder="Treasury Operations"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "quick-category-error" : "quick-category-hint"}
        onChange={(e) => {
          setName(e.target.value);
          setError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      {error ? (
        <p id="quick-category-error" role="alert" className="text-[12.5px] font-medium text-destructive">
          {error}
        </p>
      ) : (
        <p id="quick-category-hint" className="text-[12px] text-faint">
          Saved right away. Rename or delete it later under Role categories.
        </p>
      )}
      <div className="flex gap-2">
        <Button type="button" size="sm" loading={pending} onClick={submit}>
          Add category
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

const emptyIndustry: IndustryInput = { name: "", description: "", icon: "building" };

export function QuickAddIndustry({ onAdded }: { onAdded: (option: Option) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<IndustryInput>(emptyIndustry);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) return <AddLink label="Add new industry" onClick={() => setOpen(true)} />;

  const close = () => {
    setOpen(false);
    setForm(emptyIndustry);
    setError(null);
  };
  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await saveIndustry(form);
      if (res.ok && res.id && res.name) {
        toast.success(`Industry "${res.name}" added`);
        onAdded({ id: res.id, name: res.name });
        close();
      } else if (!res.ok) {
        setError(res.error);
      }
    });
  };
  const enterAdds = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mt-2 space-y-2.5 rounded-card border border-primary/40 bg-background-alt p-3">
      <p className="rounded-btn border border-warning/30 bg-warning/10 px-3 py-2 text-[12.5px] text-body">
        A new industry is public at once: it gets its own page, a card on the homepage and the Industries page, and a link in the
        footer.
      </p>
      <div>
        <Label htmlFor="quick-industry-name">Industry name</Label>
        <Input
          id="quick-industry-name"
          maxLength={48}
          autoFocus
          value={form.name}
          placeholder="Asset Management"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          onKeyDown={enterAdds}
        />
      </div>
      <div>
        <Label htmlFor="quick-industry-desc">Description (10–200 characters, shown on its page)</Label>
        <Textarea
          id="quick-industry-desc"
          rows={2}
          maxLength={200}
          value={form.description}
          placeholder="Fund managers, research analysts and distribution teams."
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="quick-industry-icon">Icon</Label>
        <div className="flex items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Icon name={form.icon} className="size-4" />
          </span>
          <Select id="quick-industry-icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value as IndustryInput["icon"] })}>
            {contentIconOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] font-medium text-destructive">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="button" size="sm" loading={pending} onClick={submit}>
          Add industry
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
