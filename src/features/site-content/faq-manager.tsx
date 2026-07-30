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
import { saveFaq, deleteFaq } from "@/features/site-content/actions";
import type { FaqInput } from "@/features/site-content/schemas";

type FaqRow = FaqInput & { id: string };

const audienceLabels = { EMPLOYER: "Employers", CANDIDATE: "Candidates", GENERAL: "General" } as const;
const audienceTones = { EMPLOYER: "purple", CANDIDATE: "green", GENERAL: "blue" } as const;

const emptyDraft: FaqInput = { question: "", answer: "", audience: "GENERAL", order: 0 };

export function FaqManager({ faqs }: { faqs: FaqRow[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <FaqEditor initial={emptyDraft} onClose={() => setEditing(null)} />
      ) : (
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden />
          Add FAQ
        </Button>
      )}

      <ul className="space-y-2.5">
        {faqs.map((faq) =>
          editing === faq.id ? (
            <li key={faq.id}>
              <FaqEditor initial={faq} id={faq.id} onClose={() => setEditing(null)} />
            </li>
          ) : (
            <li key={faq.id} className="rounded-card border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={audienceTones[faq.audience]}>{audienceLabels[faq.audience]}</Badge>
                    <span className="text-[12px] text-faint">order {faq.order}</span>
                  </div>
                  <p className="mt-2 text-[14.5px] font-bold text-foreground">{faq.question}</p>
                  <p className="mt-1 line-clamp-2 text-[13.5px] text-body">{faq.answer}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    aria-label={`Edit: ${faq.question}`}
                    onClick={() => setEditing(faq.id)}
                    className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                  <DeleteFaqButton id={faq.id} question={faq.question} />
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function FaqEditor({ initial, id, onClose }: { initial: FaqInput; id?: string; onClose: () => void }) {
  const [form, setForm] = useState<FaqInput>(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveFaq(form, id);
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
        <p className="text-[14px] font-bold text-foreground">{id ? "Edit FAQ" : "New FAQ"}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div>
        <Label htmlFor={`faq-q-${id ?? "new"}`}>Question</Label>
        <Input id={`faq-q-${id ?? "new"}`} maxLength={160} required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
      </div>
      <div>
        <Label htmlFor={`faq-a-${id ?? "new"}`}>Answer</Label>
        <Textarea id={`faq-a-${id ?? "new"}`} rows={4} maxLength={1200} required value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`faq-aud-${id ?? "new"}`}>Audience</Label>
          <Select
            id={`faq-aud-${id ?? "new"}`}
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value as FaqInput["audience"] })}
          >
            <option value="GENERAL">General</option>
            <option value="EMPLOYER">Employers</option>
            <option value="CANDIDATE">Candidates</option>
          </Select>
        </div>
        <div>
          <Label htmlFor={`faq-order-${id ?? "new"}`}>Order (lower shows first)</Label>
          <Input
            id={`faq-order-${id ?? "new"}`}
            type="number"
            min={0}
            max={999}
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.valueAsNumber || 0 })}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {id ? "Save changes" : "Add FAQ"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteFaqButton({ id, question }: { id: string; question: string }) {
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
              const res = await deleteFaq(id);
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
      aria-label={`Delete: ${question}`}
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
