"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveSuccessStory, deleteSuccessStory } from "@/features/site-content/actions";
import type { SuccessStoryInput } from "@/features/site-content/schemas";

type StoryRow = SuccessStoryInput & { id: string; slug: string };

const emptyDraft: SuccessStoryInput = {
  title: "",
  clientName: "",
  industry: "",
  challenge: "",
  solution: "",
  results: [""],
  metrics: [
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ],
  status: "DRAFT",
};

export function SuccessStoriesManager({ stories }: { stories: StoryRow[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <StoryEditor initial={emptyDraft} onClose={() => setEditing(null)} />
      ) : (
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden />
          Add story
        </Button>
      )}

      <ul className="space-y-2.5">
        {stories.map((story) =>
          editing === story.id ? (
            <li key={story.id}>
              <StoryEditor initial={story} id={story.id} onClose={() => setEditing(null)} />
            </li>
          ) : (
            <li key={story.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={story.status === "PUBLISHED" ? "green" : "amber"}>
                      {story.status === "PUBLISHED" ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="blue">{story.industry}</Badge>
                    <span className="text-[12px] text-faint">/{story.slug}</span>
                  </div>
                  <p className="mt-2 text-[14.5px] font-bold text-foreground">{story.title}</p>
                  <p className="text-[13px] text-faint">{story.clientName}</p>
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-body">
                    {story.metrics.map((m) => (
                      <span key={m.label}>
                        <strong className="text-foreground">{m.value}</strong> {m.label}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    aria-label={`Edit ${story.title}`}
                    onClick={() => setEditing(story.id)}
                    className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                  <DeleteStoryButton id={story.id} title={story.title} />
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function StoryEditor({ initial, id, onClose }: { initial: SuccessStoryInput; id?: string; onClose: () => void }) {
  const [form, setForm] = useState<SuccessStoryInput>(initial);
  const [resultsText, setResultsText] = useState(initial.results.join("\n"));
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const fid = id ?? "new";

  const updateMetric = (i: number, patch: Partial<{ label: string; value: string }>) =>
    setForm({ ...form, metrics: form.metrics.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) });

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const results = resultsText.split("\n").map((r) => r.trim()).filter(Boolean);
        const metrics = form.metrics.filter((m) => m.label.trim() && m.value.trim());
        startTransition(async () => {
          const res = await saveSuccessStory({ ...form, results, metrics }, id);
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
        <p className="text-[14px] font-bold text-foreground">{id ? "Edit story" : "New story"}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div>
        <Label htmlFor={`st-title-${fid}`}>Title</Label>
        <Input id={`st-title-${fid}`} maxLength={90} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor={`st-client-${fid}`}>Client name</Label>
          <Input id={`st-client-${fid}`} maxLength={48} required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`st-industry-${fid}`}>Industry</Label>
          <Input id={`st-industry-${fid}`} maxLength={32} required value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`st-status-${fid}`}>Status</Label>
          <Select id={`st-status-${fid}`} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SuccessStoryInput["status"] })}>
            <option value="DRAFT">Draft (hidden)</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={`st-challenge-${fid}`}>The challenge</Label>
        <Textarea id={`st-challenge-${fid}`} rows={2} maxLength={500} required value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} />
      </div>
      <div>
        <Label htmlFor={`st-solution-${fid}`}>What we did</Label>
        <Textarea id={`st-solution-${fid}`} rows={3} maxLength={600} required value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} />
      </div>
      <div>
        <Label htmlFor={`st-results-${fid}`}>Results — one per line</Label>
        <Textarea id={`st-results-${fid}`} rows={3} required value={resultsText} onChange={(e) => setResultsText(e.target.value)} />
      </div>
      <fieldset className="rounded-card border border-line p-3">
        <legend className="px-1.5 text-[13px] font-bold text-foreground">Headline metrics (up to 4)</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {form.metrics.map((metric, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr] gap-2">
              <div>
                <Label htmlFor={`st-mv-${fid}-${i}`}>Value</Label>
                <Input id={`st-mv-${fid}-${i}`} maxLength={16} placeholder="34" value={metric.value} onChange={(e) => updateMetric(i, { value: e.target.value })} />
              </div>
              <div>
                <Label htmlFor={`st-ml-${fid}-${i}`}>Label</Label>
                <Input id={`st-ml-${fid}-${i}`} maxLength={40} placeholder="Roles closed" value={metric.label} onChange={(e) => updateMetric(i, { label: e.target.value })} />
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {id ? "Save changes" : "Add story"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteStoryButton({ id, title }: { id: string; title: string }) {
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
              const res = await deleteSuccessStory(id);
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
      aria-label={`Delete ${title}`}
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
