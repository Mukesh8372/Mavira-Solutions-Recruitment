"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveClient, deleteClient } from "@/features/jobs/admin-actions";

export type ClientRow = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  about: string | null;
  jobCount: number;
};

/** Raw form values; `clientSchema` on the server turns blanks into undefined. */
type ClientFormValues = { name: string; website: string; industry: string; size: string; about: string };

const emptyDraft: ClientFormValues = { name: "", website: "", industry: "", size: "", about: "" };

export function ClientsManager({ clients }: { clients: ClientRow[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <ClientEditor initial={emptyDraft} onClose={() => setEditing(null)} />
      ) : (
        <Button type="button" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden />
          Add client
        </Button>
      )}

      {clients.length === 0 && editing !== "new" && (
        <p className="text-[13.5px] text-body">No clients yet. Add one here, or create one from the job form.</p>
      )}

      <ul className="grid gap-2.5 md:grid-cols-2">
        {clients.map((client) =>
          editing === client.id ? (
            <li key={client.id} className="md:col-span-2">
              <ClientEditor
                initial={{ name: client.name, website: client.website ?? "", industry: client.industry ?? "", size: client.size ?? "", about: client.about ?? "" }}
                id={client.id}
                onClose={() => setEditing(null)}
              />
            </li>
          ) : (
            <li key={client.id} className="flex items-start gap-3 rounded-card border border-line bg-surface p-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-foreground">{client.name}</p>
                <p className="text-[12px] text-faint">
                  {[client.industry, client.size, `${client.jobCount} job${client.jobCount === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
                </p>
                {client.website && (
                  <a href={client.website} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-[13px] text-primary hover:underline">
                    {client.website}
                  </a>
                )}
                {client.about && <p className="mt-1 line-clamp-2 text-[13px] text-body">{client.about}</p>}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button type="button" aria-label={`Edit ${client.name}`} onClick={() => setEditing(client.id)} className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-primary hover:text-primary">
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                <DeleteClientButton id={client.id} name={client.name} disabled={client.jobCount > 0} />
              </div>
            </li>
          )
        )}
      </ul>
      <p className="text-[12.5px] text-faint">Clients with jobs attached can&apos;t be deleted. The client name is hidden on confidential jobs.</p>
    </div>
  );
}

function ClientEditor({ initial, id, onClose }: { initial: ClientFormValues; id?: string; onClose: () => void }) {
  const [form, setForm] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const k = id ?? "new";

  return (
    <form
      className="space-y-3 rounded-card border border-primary/40 bg-surface p-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await saveClient(form, id);
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
            onClose();
          } else toast.error(res.error);
        });
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-bold text-foreground">{id ? "Edit client" : "New client"}</p>
        <button type="button" onClick={onClose} aria-label="Cancel" className="grid size-8 place-items-center rounded-lg text-faint hover:text-foreground">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`client-name-${k}`}>Name</Label>
          <Input id={`client-name-${k}`} maxLength={80} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`client-site-${k}`}>Website (optional)</Label>
          <Input id={`client-site-${k}`} type="url" placeholder="https://" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`client-industry-${k}`}>Industry (optional)</Label>
          <Input id={`client-industry-${k}`} maxLength={60} placeholder="Stock broking" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
        </div>
        <div>
          <Label htmlFor={`client-size-${k}`}>Size (optional)</Label>
          <Input id={`client-size-${k}`} maxLength={40} placeholder="500–1000" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
        </div>
      </div>
      <div>
        <Label htmlFor={`client-about-${k}`}>About (optional, shown on non-confidential jobs)</Label>
        <Textarea id={`client-about-${k}`} rows={3} maxLength={2000} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" loading={pending}>
          {id ? "Save changes" : "Add client"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function DeleteClientButton({ id, name, disabled }: { id: string; name: string; disabled: boolean }) {
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
              const res = await deleteClient(id);
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
      title={disabled ? "Move or archive this client's jobs first" : undefined}
      onClick={() => setConfirming(true)}
      className="grid size-8 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 className="size-3.5" aria-hidden />
    </button>
  );
}
