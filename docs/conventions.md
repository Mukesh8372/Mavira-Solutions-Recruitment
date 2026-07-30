# Implementation Conventions (read before writing any code)

## Framework — Next.js 16 (breaking changes vs 14/15)
- `params`/`searchParams` are **Promises**: `const { slug } = await props.params`. Applies to pages, layouts, generateMetadata, route handlers.
- No `middleware.ts` — we use `src/proxy.ts` (already written; don't touch).
- `next lint` is removed; run `npx tsc --noEmit` and `npx eslint src` to verify.
- Do NOT enable cacheComponents. Standard semantics: pages reading searchParams/cookies are dynamic automatically. Use `revalidatePath` after mutations (not revalidateTag).
- `next/image`: `priority` prop is deprecated (avoid it; we barely use images — prefer DOM/SVG illustrations).
- lucide-react has NO brand icons — use `BrandIcon` from `@/components/shared/brand-icons` for socials.

## Stack facts
- Tailwind CSS **v4** (CSS-first config in `src/app/globals.css` via `@theme`). No tailwind.config file.
- Prisma 6 + SQLite. **Json columns store string arrays as JSON strings** — always parse with `jsonArray(value)` from `@/lib/utils`, never cast. Write with `JSON.stringify(arr)`.
- Prisma SQLite: no `mode: "insensitive"` in filters, no array `has` filters, `contains` on String columns only (it IS case-insensitive for ASCII in SQLite by default).
- Auth: NextAuth v5 — `auth()`, `requireRole(roles)`, `dashboardPathForRole` from `@/lib/auth`.

## Design system (use these, don't invent new tokens)
- Colors via Tailwind classes: `bg-background`, `bg-background-alt`, `bg-surface`, `text-foreground` (headings), `text-body`, `text-faint`, `border-line`, `bg-primary`/`text-primary`/`bg-primary-soft`, `secondary*`, `accent*`, `text-destructive`, `text-warning`.
- Radii: `rounded-btn` (10px), `rounded-card` (16px), `rounded-modal` (20px). Shadows: `shadow-soft`, `shadow-card`, `shadow-lift`, `shadow-glow`.
- Utilities: `container-site` (max-w-7xl + px), `text-gradient`, `bg-brand-gradient`, `glass`.
- Section rhythm: `py-20 md:py-28`, alternate `bg-background` / `bg-background-alt` between sections.
- Type: eyebrow = `text-[13px] font-semibold uppercase tracking-[0.08em] text-primary`; H1 = `text-4xl md:text-5xl font-extrabold tracking-[-0.025em]`.

## Components available (import paths)
- `@/components/ui/*`: Button (variants primary/secondary/outline/ghost/destructive/link/inverse; `loading` prop), Badge (blue/purple/green/red/amber/neutral/outline), Card(+Header/Title/Description/Content/Footer, `hover` prop), Input, Textarea, Label, Select (native), Accordion/AccordionItem (`id`, `title`), Skeleton, Avatar (`name`, `src?`), Breadcrumb (`items: {label, href?}[]`), Pagination (`current,total,hrefFor`), Field (form field wrapper w/ label+error render-prop — see it before writing forms).
- `@/components/shared/*`: Reveal / RevealGroup / RevealItem (scroll animations — use for all section content), SectionHeading (`eyebrow,title,lead,align`), StatCounter, CtaBand, JsonLd, Icon + IconChip (`name` slug), BrandIcon.
- `@/components/layout/*`: SiteHeader, SiteFooter, Logo, ThemeToggle (already wired in `(site)/layout.tsx`).
- Features: `@/features/jobs/{queries,actions,job-card,job-card-actions}`, `@/features/blog/{queries,blog-card}`, `@/features/content/queries`, `@/features/newsletter/*`.

## Patterns (copy these, exactly)
- **Public pages** live in `src/app/(site)/...` — the group layout already renders header/footer/main.
- **Server components by default.** `"use client"` only for interactivity leaves.
- **Metadata**: every page exports `metadata` or `generateMetadata` with `title`, `description`, `alternates: { canonical: "/path" }`.
- **Breadcrumbs**: render `<Breadcrumb items={...}/>` at top of every page below level 1 + `<JsonLd data={breadcrumbJsonLd(items)}/>` (from `@/lib/seo`).
- **Server actions**: `"use server"` file per feature (`src/features/<x>/actions.ts`), zod schema, honeypot field `website: z.string().max(0).optional()`, `rateLimit(await clientKey("scope"), {...})` from `@/lib/rate-limit`, return `{ ok: true } | { ok: false, error }`. See `features/newsletter/actions.ts` and `features/jobs/actions.ts`.
- **Forms**: client components with react-hook-form + zodResolver OR simple useState + useTransition (match `newsletter-form.tsx` for simple, use RHF for multi-field). Inline errors via `Field` component, `aria-invalid`, `role="alert"`. Submit button `loading={pending}`. Success = inline success panel (green, Check icon) replacing the form, plus `toast.success`.
- **Empty states**: designed placeholder (icon + one line + CTA), never a bare "No results".
- **Accessibility**: labels on every control, `aria-hidden` on decorative icons, `aria-label` on icon-only buttons, one h1/page, no skipped heading levels.
- **Copy tone**: plain-spoken, specific, confident; India-centric examples (LPA salaries, PF/ESI). Never lorem ipsum. Use seeded data facts: 12,000+ placements, 500+ clients, 15+ years, 4.9★, 90%+ offer-join, 3–5 day shortlists.

## Verification bar for every task
`npx tsc --noEmit` clean, `npx eslint src --max-warnings 0` clean for YOUR files, `npm run build` succeeds. No new npm dependencies without explicit need.
