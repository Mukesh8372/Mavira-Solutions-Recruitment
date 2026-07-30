# 04 — Design System

**Deliverables 6–13.** Tokens are authored as CSS variables (Tailwind v4 `@theme`), consumed by shadcn/ui. Dark mode via `.dark` class + `prefers-color-scheme` default.

---

## 1. Design principles

1. **Calm confidence** — generous whitespace, restrained color, content leads. (Stripe/Notion)
2. **Precision** — 4px grid, consistent radii/shadows, optical alignment. (Linear/Vercel)
3. **Warm trust** — human photography, rounded forms, emerald success moments. (Airbnb/Calendly)
4. **Motion with purpose** — animation explains hierarchy and state; nothing decorative loops forever except the logo marquee.

## 2. Color system

### Brand palette (light)
| Token | Value | Use |
|---|---|---|
| `--primary` (blue) | `#2563EB` (blue-600), hover `#1D4ED8` | Primary CTAs, links, focus |
| `--secondary` (purple) | `#7C3AED` (violet-600) | Gradient partner, accents, employer-side identity |
| `--accent` (emerald) | `#059669` (emerald-600) | Success, salary, "placed" moments, candidate-side identity |
| `--background` | `#FFFFFF`; sections alt `#F8FAFC` (slate-50) | Page / alternating bands |
| `--foreground` | `#0F172A` (slate-900) | Headings |
| `--muted-foreground` | `#475569` (slate-600) | Body (AA on white: 7.0:1) |
| `--border` | `#E2E8F0` (slate-200) | Hairlines |
| destructive | `#DC2626` | Errors |
| warning | `#D97706` | Warnings, "closing soon" |

### Dark
Background `#0B1120` (near slate-950), surface `#111827`, raised surface `#1E293B`, foreground `#F1F5F9`, body `#94A3B8`, primary lightens to `#3B82F6`, accent `#10B981`, borders `#1E293B`. All pairs re-checked for AA.

### Gradients (used sparingly)
- **Hero/CTA band:** `linear-gradient(135deg, #2563EB → #7C3AED)`; text version via `bg-clip-text`.
- **Ambient glow:** radial blue/violet at 6–10% opacity behind hero + CTA sections (blurred blobs, `pointer-events-none`).
- **Card sheen:** 1px gradient border (`from-white/60 to-white/10`) on glass cards.

### Contrast commitments
Body ≥ 7:1, large text ≥ 4.5:1, UI components ≥ 3:1. White-on-primary-600 = 5.17:1 ✓. Never place body copy on gradients — only H1/CTA-scale text in white.

## 3. Typography

- **Display + UI:** `Plus Jakarta Sans` (variable, `next/font`, subset latin, `display: swap`) — geometric warmth, premium feel.
- **Body fallback stack:** system-ui chain. **Mono (salary/code/stats):** `JetBrains Mono` or `ui-monospace`.

| Style | Size / line-height (desktop → mobile) | Weight | Tracking |
|---|---|---|---|
| Display / H1 | 60/64 → 38/44 | 800 | -0.025em |
| H2 | 40/48 → 30/36 | 700 | -0.02em |
| H3 | 28/36 → 22/30 | 700 | -0.01em |
| H4 | 20/28 | 600 | 0 |
| Body-lg (leads) | 18/29 | 400 | 0 |
| Body | 16/26 | 400 | 0 |
| Caption/meta | 13/20 | 500 | +0.01em |
| Eyebrow/overline | 13/16 | 600 | +0.08em, uppercase |
| Button | 15/24 | 600 | 0 |

Prose max-width 68ch. Headings text-wrap balance; body pretty.

## 4. Spacing, radius, elevation

- **Grid:** 4px base. Section padding `py-20 md:py-28`; container `max-w-7xl px-4 sm:px-6 lg:px-8`.
- **Radii:** input/button 10px · card 16px · modal/large card 20px · pill 9999.
- **Shadows (soft, layered, never harsh):**
  - `sm`: `0 1px 2px rgb(15 23 42 / .06)`
  - `md`: `0 4px 12px -2px rgb(15 23 42 / .08)`
  - `lg` (hover/popover): `0 12px 32px -8px rgb(15 23 42 / .14)`
  - `glow` (primary CTA hover): `0 8px 24px -6px rgb(37 99 235 / .35)`
- **Glass (header on scroll, mobile sheet, floating chips only):** `bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-white/20` — with solid-color fallback via `@supports`.

## 5. Iconography & imagery

- **Lucide** only, 1.5px stroke, 20px inline / 24px feature; feature-card icons sit in 48px rounded-xl tinted squares (`bg-primary/10 text-primary`).
- **Illustrations:** custom SVG "product-style" compositions — layered UI cards (job card, candidate avatar card, ✓ Placed chip) instead of clip-art people. Built in-repo as components → crisp, theme-aware, zero image weight.
- **Photography:** only where humanity matters (About team, testimonials avatars, success stories). Requirements: candid > posed, consistent warm grade, AVIF/WebP via `next/image`, meaningful alt text. Avatars may use generated initials fallback.

## 6. Motion system (Framer Motion)

| Token | Value |
|---|---|
| duration-fast / base / slow | 150ms / 250ms / 450ms |
| ease-out-quart | `cubic-bezier(0.25, 1, 0.5, 1)` (default) |
| spring-soft | `{ type: "spring", stiffness: 260, damping: 26 }` |

**Variants (shared library `lib/motion.ts`):**
- `fadeUp`: opacity 0→1, y 24→0, 450ms — all scroll reveals (`whileInView`, `viewport={{ once: true, margin: "-80px" }}`)
- `stagger`: children delay 80ms — card grids, nav lists
- `scaleIn`: 0.96→1 — modals, dropdowns (150ms)
- `heroFloat`: y ±8px, 6s ease-in-out loop — hero illustration chips only
- Counters: animate on view via `useMotionValue` + spring, once.
- Hover: card `translateY(-4px)` + shadow md→lg; button `scale(0.98)` on press; arrow icons `translateX(4px)`.
- Accordion/sheet: height/transform, 250ms.
- Page transitions: none (App Router; keep TTI clean) — loading.tsx skeletons instead.

**Rules:** transform/opacity only (no layout properties). `useReducedMotion()` → all reveals render static, counters snap to value, marquee pauses. Nothing animates on scroll more than once.

## 7. Component library (inventory + key states)

**Primitives (shadcn/ui base, restyled):** Button (primary / secondary / outline / ghost / destructive / link · sm/md/lg · loading spinner state) · Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider (salary) · Badge (solid/soft/outline; semantic colors) · Avatar (+initials fallback) · Card · Accordion · Tabs · Dialog, Sheet (mobile nav/filters), Popover, Tooltip, DropdownMenu · Toast (sonner) · Skeleton · Pagination · Breadcrumb · Table (TanStack wrapper: sort/filter/paginate/empty/loading) · Progress, RadialProgress (profile completion) · Command palette (⌘K, dashboards).

**Composed (feature components):**
- `SiteHeader` (transparent→glass at 24px scroll, active-route underline, mega-menu), `MobileNav`, `SiteFooter`, `NewsletterForm`
- `Hero`, `SectionHeading` (eyebrow+H2+lead), `StatCounter`, `LogoMarquee`, `CtaBand`
- `ServiceCard`, `IndustryCard`, `FeatureRow`, `ProcessTimeline`, `TestimonialCarousel`, `SuccessStoryCard`, `BlogCard`, `FaqAccordion`
- `JobCard` (save ♡ optimistic, share popover), `JobSearchBar`, `JobFilters` (+`FilterChips`), `JobSort`, `SalaryRange`, `JobMeta`, `ApplyForm`, `ResumeDropzone` (drag state, file chip, progress, error), `RelatedJobs`, `StickyApplyBar` (mobile)
- `RequestTalentForm`, `ContactForm`, `MapEmbed` (lazy, click-to-load)
- Dashboard: `DashboardShell`, `StatCard`, `DataTable`, `ApplicationsPipeline` (status kanban), `InterviewScheduler`, `ProfileCompletionCard`, `NotificationList`, `RichTextEditor` (blog), `MediaGrid`, `AuditLogTable`

**Form states (all forms):** inline zod errors under field (red-600 + icon, `aria-describedby`), submitting (button spinner + disabled + `aria-busy`), success (inline check panel or toast + form reset), failure (toast + preserved input), honeypot + server error mapping.

## 8. Responsive system

Breakpoints (Tailwind defaults): 640 / 768 / 1024 / 1280 / 1536. Design at 375, 768, 1440; verify 320 and landscape-short (`max-h-500px` reduces hero padding). Grids: cards 1→2→3(→4); dashboards collapse sidebar to sheet < 1024; tables become stacked definition cards < 640; touch targets ≥ 44px.

## 9. Accessibility baked into the system
Focus ring: 2px `ring-primary` + 2px offset, visible on every interactive element, never removed. Skip-to-content link. Landmarks (`header/nav/main/footer`), one `h1`/page, no skipped levels. Icons decorative → `aria-hidden`; icon-only buttons → `aria-label`. Carousel: buttons + keyboard + `aria-roledescription`, no autoplay. Color never sole signal (badges get text). Forms: real `<label>`s, error `role="alert"`, `autocomplete` attrs.
