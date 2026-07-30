"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/shared/icon";
import { Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  contentIconOptions,
  type AchievementsContent,
  type AnnouncementContent,
  type ContactContent,
  type HeroContent,
  type LogosContent,
  type ProcessContent,
  type SiteStatsContent,
  type TeamContent,
  type WhyUsContent,
} from "@/features/site-content/schemas";
import {
  saveAchievements,
  saveAnnouncement,
  saveContactContent,
  saveHeroContent,
  saveLogosContent,
  saveProcessContent,
  saveStatsContent,
  saveTeam,
  saveWhyUsContent,
  type ContentActionResult,
} from "@/features/site-content/actions";

/** Shared submit plumbing: toast + refresh so the preview data on the page updates. */
function useContentSave() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const save = (fn: () => Promise<ContentActionResult>) =>
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message ?? "Saved");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  return { pending, save };
}

function IconSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
        <Icon name={value} className="size-4" />
      </span>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-label="Icon">
        {contentIconOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    </div>
  );
}

/* ---------------- Hero ---------------- */

export function HeroForm({ initial }: { initial: HeroContent }) {
  const [form, setForm] = useState(initial);
  const { pending, save } = useContentSave();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveHeroContent(form));
      }}
    >
      <div>
        <Label htmlFor="hero-badge">Badge line</Label>
        <Input id="hero-badge" maxLength={60} value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <Label htmlFor="hero-headline">Headline</Label>
          <Input id="hero-headline" maxLength={40} value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="hero-accent">Gradient word</Label>
          <Input id="hero-accent" maxLength={20} value={form.headlineAccent} onChange={(e) => setForm({ ...form, headlineAccent: e.target.value })} />
        </div>
      </div>
      <p className="rounded-lg bg-background-alt px-3 py-2 text-[13.5px] text-body">
        Preview:{" "}
        <span className="font-extrabold text-foreground">
          {form.headline} <span className="text-gradient">{form.headlineAccent}</span>
        </span>
      </p>
      <div>
        <Label htmlFor="hero-subtext">Supporting text</Label>
        <Textarea id="hero-subtext" rows={2} maxLength={180} value={form.subtext} onChange={(e) => setForm({ ...form, subtext: e.target.value })} />
        <p className="mt-1 text-right text-[12px] text-faint">{form.subtext.length}/180</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {form.assurances.map((a, i) => (
          <div key={i}>
            <Label htmlFor={`hero-assurance-${i}`}>Assurance {i + 1}</Label>
            <Input
              id={`hero-assurance-${i}`}
              maxLength={32}
              value={a}
              onChange={(e) => {
                const next = [...form.assurances];
                next[i] = e.target.value;
                setForm({ ...form, assurances: next });
              }}
            />
          </div>
        ))}
      </div>
      <Button type="submit" loading={pending}>
        Save hero
      </Button>
    </form>
  );
}

/* ---------------- Stats ---------------- */

const statFields: { key: keyof SiteStatsContent; label: string; step?: string }[] = [
  { key: "candidatesPlaced", label: "Candidates placed" },
  { key: "clientCompanies", label: "Client companies" },
  { key: "yearsExperience", label: "Years of experience" },
  { key: "googleRating", label: "Google rating (0–5)", step: "0.1" },
  { key: "offerJoinRate", label: "Offer-to-join rate (%)" },
  { key: "avgShortlistDays", label: "Avg. shortlist days" },
];

export function StatsForm({ initial }: { initial: SiteStatsContent }) {
  const [form, setForm] = useState(initial);
  const { pending, save } = useContentSave();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveStatsContent(form));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {statFields.map(({ key, label, step }) => (
          <div key={key}>
            <Label htmlFor={`stat-${key}`}>{label}</Label>
            <Input
              id={`stat-${key}`}
              type="number"
              step={step ?? "1"}
              min={0}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.valueAsNumber })}
            />
          </div>
        ))}
      </div>
      <Button type="submit" loading={pending}>
        Save statistics
      </Button>
    </form>
  );
}

/* ---------------- Client logos ---------------- */

export function LogosForm({ initial }: { initial: LogosContent }) {
  const [text, setText] = useState(initial.logos.join("\n"));
  const { pending, save } = useContentSave();
  const names = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveLogosContent({ logos: names }));
      }}
    >
      <div>
        <Label htmlFor="logos-list">Company names — one per line ({names.length}/20)</Label>
        <Textarea id="logos-list" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
        <p className="mt-1 text-[12.5px] text-faint">Shown in the rolling &ldquo;Trusted by&rdquo; strip. 4–20 names, each under 24 characters.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {names.map((n, i) => (
          <span key={`${n}-${i}`} className="rounded-full border border-line px-3 py-1 text-[13px] font-bold text-faint">
            {n}
          </span>
        ))}
      </div>
      <Button type="submit" loading={pending}>
        Save logos
      </Button>
    </form>
  );
}

/* ---------------- Process steps ---------------- */

export function ProcessForm({ initial }: { initial: ProcessContent }) {
  const [steps, setSteps] = useState(initial.steps);
  const { pending, save } = useContentSave();
  const update = (i: number, patch: Partial<ProcessContent["steps"][number]>) =>
    setSteps(steps.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveProcessContent({ steps }));
      }}
    >
      {steps.map((step, i) => (
        <fieldset key={i} className="rounded-card border border-line p-4">
          <legend className="px-1.5 text-[13px] font-bold text-foreground">Step {i + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px_220px]">
            <div>
              <Label htmlFor={`ps-title-${i}`}>Title</Label>
              <Input id={`ps-title-${i}`} maxLength={40} value={step.title} onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`ps-duration-${i}`}>Duration</Label>
              <Input id={`ps-duration-${i}`} maxLength={20} value={step.duration} onChange={(e) => update(i, { duration: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`ps-icon-${i}`}>Icon</Label>
              <IconSelect id={`ps-icon-${i}`} value={step.icon} onChange={(v) => update(i, { icon: v as typeof step.icon })} />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor={`ps-body-${i}`}>Description</Label>
            <Textarea id={`ps-body-${i}`} rows={2} maxLength={320} value={step.body} onChange={(e) => update(i, { body: e.target.value })} />
          </div>
        </fieldset>
      ))}
      <Button type="submit" loading={pending}>
        Save process
      </Button>
    </form>
  );
}

/* ---------------- Announcement bar ---------------- */

export function AnnouncementForm({ initial }: { initial: AnnouncementContent }) {
  const [form, setForm] = useState(initial);
  const { pending, save } = useContentSave();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveAnnouncement(form));
      }}
    >
      <div className="flex items-center gap-3">
        <Switch id="ann-enabled" checked={form.enabled} onChange={(enabled) => setForm({ ...form, enabled })} label="Show announcement bar" />
        <span className="text-[14px] font-semibold text-foreground">{form.enabled ? "Visible on the site" : "Hidden"}</span>
      </div>
      <div>
        <Label htmlFor="ann-text">Announcement text</Label>
        <Input id="ann-text" maxLength={120} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ann-label">Link label (optional)</Label>
          <Input id="ann-label" maxLength={30} placeholder="See open roles" value={form.linkLabel ?? ""} onChange={(e) => setForm({ ...form, linkLabel: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ann-href">Link (optional)</Label>
          <Input id="ann-href" maxLength={200} placeholder="/jobs or https://…" value={form.href ?? ""} onChange={(e) => setForm({ ...form, href: e.target.value })} />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg">
        <p className="bg-brand-gradient px-4 py-2 text-center text-[13px] font-semibold text-white">
          {form.text}
          {form.href && form.linkLabel && <span className="ml-2 underline underline-offset-2">{form.linkLabel} →</span>}
        </p>
      </div>
      <Button type="submit" loading={pending}>
        Save announcement
      </Button>
    </form>
  );
}

/* ---------------- Contact details ---------------- */

export function ContactDetailsForm({ initial }: { initial: ContactContent }) {
  const [form, setForm] = useState(initial);
  const { pending, save } = useContentSave();
  const set = (patch: Partial<ContactContent>) => setForm({ ...form, ...patch });
  const setSocial = (key: keyof ContactContent["social"], value: string) =>
    setForm({ ...form, social: { ...form.social, [key]: value } });
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveContactContent(form));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="ct-phone">Phone (as displayed)</Label>
          <Input id="ct-phone" value={form.phone} onChange={(e) => set({ phone: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-whatsapp">WhatsApp number</Label>
          <Input id="ct-whatsapp" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-email">Email</Label>
          <Input id="ct-email" type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr_100px]">
        <div>
          <Label htmlFor="ct-street">Street address</Label>
          <Input id="ct-street" value={form.street} onChange={(e) => set({ street: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-city">City</Label>
          <Input id="ct-city" value={form.city} onChange={(e) => set({ city: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-state">State</Label>
          <Input id="ct-state" value={form.state} onChange={(e) => set({ state: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-pin">PIN</Label>
          <Input id="ct-pin" value={form.postalCode} onChange={(e) => set({ postalCode: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="ct-hours">Business hours</Label>
          <Input id="ct-hours" value={form.hours} onChange={(e) => set({ hours: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="ct-sla">Response promise</Label>
          <Input id="ct-sla" value={form.responseSla} onChange={(e) => set({ responseSla: e.target.value })} />
        </div>
      </div>
      <fieldset className="rounded-card border border-line p-4">
        <legend className="px-1.5 text-[13px] font-bold text-foreground">Social links</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["linkedin", "twitter", "instagram", "facebook"] as const).map((key) => (
            <div key={key}>
              <Label htmlFor={`ct-social-${key}`} className="capitalize">
                {key === "twitter" ? "X (Twitter)" : key}
              </Label>
              <Input id={`ct-social-${key}`} type="url" value={form.social[key]} onChange={(e) => setSocial(key, e.target.value)} />
            </div>
          ))}
        </div>
      </fieldset>
      <Button type="submit" loading={pending}>
        Save contact details
      </Button>
    </form>
  );
}

/* ---------------- Achievements ---------------- */

export function AchievementsForm({ initial }: { initial: AchievementsContent }) {
  const [items, setItems] = useState(initial.items);
  const { pending, save } = useContentSave();
  const update = (i: number, patch: Partial<AchievementsContent["items"][number]>) =>
    setItems(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveAchievements({ items }));
      }}
    >
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="grid gap-3 rounded-card border border-line p-4 sm:grid-cols-[1fr_240px_100px_36px] sm:items-end">
            <div>
              <Label htmlFor={`ach-title-${i}`}>Award / recognition</Label>
              <Input id={`ach-title-${i}`} maxLength={60} value={item.title} onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`ach-org-${i}`}>Awarded by</Label>
              <Input id={`ach-org-${i}`} maxLength={48} value={item.org} onChange={(e) => update(i, { org: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`ach-year-${i}`}>Year</Label>
              <Input id={`ach-year-${i}`} maxLength={4} value={item.year} onChange={(e) => update(i, { year: e.target.value })} />
            </div>
            <button
              type="button"
              aria-label={`Remove achievement ${i + 1}`}
              disabled={items.length <= 1}
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="grid h-11 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive disabled:opacity-40"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={items.length >= 8}
          onClick={() => setItems([...items, { title: "", org: "", year: `${new Date().getFullYear()}` }])}
        >
          <Plus className="size-4" aria-hidden />
          Add achievement
        </Button>
        <Button type="submit" loading={pending}>
          Save achievements
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Leadership team ---------------- */

export function TeamForm({ initial }: { initial: TeamContent }) {
  const [members, setMembers] = useState(initial.members);
  const { pending, save } = useContentSave();
  const update = (i: number, patch: Partial<TeamContent["members"][number]>) =>
    setMembers(members.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveTeam({ members }));
      }}
    >
      <ul className="space-y-3">
        {members.map((member, i) => (
          <li key={i} className="rounded-card border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_36px] sm:items-end">
              <div>
                <Label htmlFor={`team-name-${i}`}>Name</Label>
                <Input id={`team-name-${i}`} maxLength={40} value={member.name} onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor={`team-role-${i}`}>Role</Label>
                <Input id={`team-role-${i}`} maxLength={48} value={member.role} onChange={(e) => update(i, { role: e.target.value })} />
              </div>
              <button
                type="button"
                aria-label={`Remove ${member.name || `member ${i + 1}`}`}
                disabled={members.length <= 2}
                onClick={() => setMembers(members.filter((_, idx) => idx !== i))}
                className="grid h-11 place-items-center rounded-lg border border-line text-faint transition-colors hover:border-destructive hover:text-destructive disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3">
              <Label htmlFor={`team-bio-${i}`}>Bio</Label>
              <Textarea id={`team-bio-${i}`} rows={2} maxLength={220} value={member.bio} onChange={(e) => update(i, { bio: e.target.value })} />
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={members.length >= 8}
          onClick={() => setMembers([...members, { name: "", role: "", bio: "" }])}
        >
          <Plus className="size-4" aria-hidden />
          Add member
        </Button>
        <Button type="submit" loading={pending}>
          Save team
        </Button>
      </div>
    </form>
  );
}

/* ---------------- Why-us cards ---------------- */

export function WhyUsForm({ initial }: { initial: WhyUsContent }) {
  const [cards, setCards] = useState(initial.cards);
  const { pending, save } = useContentSave();
  const update = (i: number, patch: Partial<WhyUsContent["cards"][number]>) =>
    setCards(cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        save(() => saveWhyUsContent({ cards }));
      }}
    >
      {cards.map((card, i) => (
        <fieldset key={i} className="rounded-card border border-line p-4">
          <legend className="px-1.5 text-[13px] font-bold text-foreground">Card {i + 1}</legend>
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <div>
              <Label htmlFor={`wu-title-${i}`}>Title</Label>
              <Input id={`wu-title-${i}`} maxLength={48} value={card.title} onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor={`wu-icon-${i}`}>Icon</Label>
              <IconSelect id={`wu-icon-${i}`} value={card.icon} onChange={(v) => update(i, { icon: v as typeof card.icon })} />
            </div>
          </div>
          <div className="mt-3">
            <Label htmlFor={`wu-body-${i}`}>Description</Label>
            <Textarea id={`wu-body-${i}`} rows={2} maxLength={280} value={card.body} onChange={(e) => update(i, { body: e.target.value })} />
          </div>
        </fieldset>
      ))}
      <Button type="submit" loading={pending}>
        Save differentiators
      </Button>
    </form>
  );
}
