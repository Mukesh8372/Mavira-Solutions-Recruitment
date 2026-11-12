# Mavira Solutions website — project context

This file describes the application as it is in the code. Every fact here was checked against the source on 2026-11-07 (commit `ebbd83b`).
Update this file in the same commit as any change that makes a fact here wrong.

## 1. What the application is

The application is the public website of **Mavira Solutions Private Limited**, a recruitment agency in Thane, Maharashtra. The agency recruits for BFSI (banking, financial services, insurance), stock broking, wealth management, NBFC and FinTech companies.

The site is a **brochure site with a job board and an admin CMS**.

- Public visitors read pages, send a "Request Talent" lead, subscribe to the newsletter, browse open jobs at `/jobs` and apply with a resume.
- Applicants have no accounts. One application per job per email; the admin reviews them under `/admin/applications`.
- Admin and staff users sign in at `/login` and edit content at `/admin`.
- There is no public sign-up. There are no candidate or employer accounts in use.

### History

The repository started as "TalentBridge", a full job portal (jobs, applications, candidate and employer dashboards). Commit `7e02aa6` rebranded it to Mavira Solutions and removed the portal features. Commit `ebbd83b` removed the contact form and email sending.

The database schema still has the old portal tables. See [§9 Legacy code](#9-legacy-code-left-from-the-job-portal).

## 2. Stack

| Layer | Package | Version (package.json) |
|---|---|---|
| Framework | `next` (App Router, Turbopack) | 16.2.12 |
| UI | `react`, `react-dom` | 19.2.4 |
| Language | TypeScript, `strict: true` | ^5 |
| Styling | `tailwindcss` v4, CSS-first config, no `tailwind.config` file | ^4 |
| ORM | `prisma`, `@prisma/client` | 6.19.3 |
| Database | PostgreSQL on Neon | — |
| Auth | `next-auth` v5 beta, Credentials provider, JWT sessions | ^5.0.0-beta.32 |
| Validation | `zod` v4 | ^4.4.3 |
| Forms | `react-hook-form` + `@hookform/resolvers`, or `useState` + `useTransition` | — |
| Motion | `framer-motion` | ^12 |
| Icons | `lucide-react` (no brand icons, see `BrandIcon`) | — |
| Theme | `next-themes` (class strategy) | — |
| Toasts | `sonner` | — |
| Password hash | `bcryptjs`, cost 12 | — |
| Tests | `vitest` (+ `vite`, its required peer) | ^5.0.5 |

Installed but not imported anywhere in `src/`: `@tanstack/react-query`, `@tanstack/react-table`, `date-fns`.

Local toolchain at time of writing: Node v22.23.1.

## 3. Commands

| Command | What it does |
|---|---|
| `npm install` | Installs packages. `postinstall` runs `prisma generate`. |
| `npm run dev` | Starts the dev server on http://localhost:3000. |
| `npm run build` | Production build. It reads the database (see §6). |
| `npm run start` | Serves the production build. |
| `npx tsc --noEmit` | Typecheck. |
| `npx eslint src --max-warnings 0` | Lint. `next lint` does not exist in Next 16. |
| `npm test` | Runs the Vitest unit tests (`src/**/*.test.ts`). No database or network. |
| `npx prisma studio` | Opens a database browser on the database in `DATABASE_URL`. |
| `npx prisma db seed` | Runs `prisma/seed.ts`. **It deletes all data first.** See §7. |
| `npm run seed:categories` | Upserts the 14 job role categories (`Department` rows) by slug. Never deletes. Safe to rerun. |

Unit tests live next to the code as `*.test.ts` and run with `npm test`. `vitest.config.ts` maps `@` to `src/` and replaces the `server-only` package with `src/test/server-only-stub.ts`. There are no end-to-end tests.

Verification state on 2026-11-07: `tsc` clean, `eslint` clean (0 warnings), `next build` succeeds (43 routes).

## 4. Directory map

```
src/
  proxy.ts                 Next 16 "proxy" (old name: middleware). Redirects /admin/* to /login if no session cookie.
  app/
    layout.tsx             Root layout: font, ThemeProvider, Toaster, Organization JSON-LD.
    (site)/                Public pages. layout.tsx adds AnnouncementBar, SiteHeader, SiteFooter.
    (auth)/                /login, /forgot-password.
    (dashboard)/           Admin area. layout.tsx = session check + DashboardShell.
      admin/               layout.tsx = ADMIN or STAFF only. One folder per admin screen.
    api/auth/[...nextauth] NextAuth route handlers.
    api/v1/resumes/[applicationId]  Streams an applicant's resume to a signed-in ADMIN or STAFF user (see §8).
    api/cron/cleanup-resumes  Daily job: closes expired jobs, deletes orphaned resume files (see §7, Resume storage).
    sitemap.ts robots.ts manifest.ts not-found.tsx icon.png favicon.ico globals.css
  features/<feature>/      Vertical slices: actions.ts ("use server"), queries.ts ("server-only"), client forms.
    admin/                 Lead status, testimonials, blog, user roles, newsletter, audit log.
    auth/                  Login, logout, change password, forgot password (stub).
    blog/                  Public blog queries, cards, markdown renderer, share row.
    content/               Public reads: testimonials, success stories, FAQs, industries.
    home/                  Homepage sections.
    leads/                 Public "Request Talent" form and action.
    newsletter/            Public newsletter form and action.
    jobs/                  Job board. queries.ts (open-job reads), display.ts (filters, URLs, isJobOpen, clientLabel),
                           options.ts (fixed lists), schemas.ts (apply validation), actions.ts (applyToJob),
                           cache.ts (revalidateJobPages), job-card, job-filters, job-search-form, apply-form,
                           latest-jobs-section (home), industry-jobs-section (industry pages).
    site-content/          Admin-editable content blocks stored in the Setting table, plus FAQ,
                           industry and success-story CRUD.
  components/
    ui/                    Primitives: Button, Badge, Input, Select, Field, Accordion, etc.
    shared/                Reveal (scroll animation), SectionHeading, CtaBand, JsonLd, Icon, BrandIcon.
    layout/                SiteHeader, SiteFooter, Logo, ThemeToggle, AnnouncementBar, DashboardShell.
    dashboard/             Admin table, stat card, status badge, empty state, page header.
  config/
    site.ts                Brand facts: name, legal name, CIN, GSTIN, phone, email, address, socials.
    nav.ts                 Header and footer navigation. The footer industry links come from the Industry table.
    dashboard-nav.ts       Admin sidebar items and the role -> landing-path map.
  content/
    services.ts            The 5 service pages (static content in code).
    process.ts             Defaults for process steps, why-us cards, client logos, achievements.
  test/                    server-only-stub.ts for Vitest.
  lib/
    auth.ts                NextAuth config, requireRole(), dashboardPathForRole.
    prisma.ts              PrismaClient singleton.
    rate-limit.ts          In-memory sliding-window limiter + clientKey(scope) from x-forwarded-for.
    resumes.ts             Resume file rules: 2 MB limit, allowed types, magic-byte detection, safe names.
    seo.ts                 JSON-LD builders.
    utils.ts               cn(), jsonArray(), jsonValue(), slugify(), shortId().
    format.ts              Date, INR/LPA and label formatters.
    resume-storage.ts      The only module that talks to Cloudflare R2: put, get (stream), delete, list.
    incidents.ts           recordIncident(): SystemIncident rows for failures with no signed-in user.
    motion.ts              framer-motion variants.
prisma/
  schema.prisma            PostgreSQL datasource.
  migrations/              Postgres migrations. `0_init` is the baseline of the schema as it was on 2026-11-12.
  seed.ts                  Wipes and refills the database.
  seed-role-categories.ts  Upserts the job role categories. Safe to rerun.
  dev.db                   Old SQLite file. Git-ignored. Not used.
docs/                      Planning documents from before the rebrand. Mostly out of date (see docs/README.md).
uploads/                   Local resume files from the old portal. Git-ignored. Nothing reads it.
public/logo.png            Logo.
```

Import alias: `@/*` maps to `src/*`.

## 5. Routes

### Public (`src/app/(site)`)

| Path | Data source | Render |
|---|---|---|
| `/` | Setting (hero, achievements, process, why-us), Testimonial (approved + featured), FaqItem, BlogPost, Industry, Job (6 newest open) | Static |
| Footer on every public page | Setting (contact), Industry | — |
| `/about` | Setting (achievements) | Static |
| `/services`, `/services/[slug]` | `src/content/services.ts`, Setting (process) | Static / SSG (5 slugs) |
| `/industries` | Industry | Static |
| `/industries/[slug]` | Industry, Job (open jobs in the industry) | Dynamic |
| `/jobs` | Job (open), Department, Industry. Filters in the query string: `q`, `location`, `category`, `industry`, `experience`, `type`, `mode`, `sort`, `page` (10 a page). | Dynamic |
| `/jobs/[slug]` | Job, Company, Department, Industry. DRAFT/ARCHIVED → 404. CLOSED or past `validThrough` → banner, no form, no JobPosting JSON-LD, `noindex`. Confidential jobs hide the client. Holds the apply form. | Dynamic |
| `/jobs/category/[slug]` | Department, Job (open) | SSG (one per Department) |
| `/employers` | Testimonial, FaqItem, Setting (process, contact). Holds the Request Talent form at `#request-talent`. | Static |
| `/process` | Setting (process) | Static |
| `/why-choose-us` | Setting (why-us), Testimonial | Static |
| `/success-stories` | SuccessStory (PUBLISHED) | Static |
| `/success-stories/[slug]` | SuccessStory | Dynamic |
| `/testimonials` | Testimonial (approved) | Static |
| `/blog` | BlogPost (PUBLISHED) | Static |
| `/blog/category/[slug]` | BlogPost by category | SSG (3 categories) |
| `/blog/[slug]` | BlogPost | Dynamic |
| `/faq` | FaqItem, Setting (contact) | Static |
| `/contact` | Setting (contact). No form. Phone, WhatsApp, email, map link. | Static |
| `/privacy-policy`, `/terms` | Text in code | Static |
| `/sitemap.xml` | Static list + BlogPost, Industry, SuccessStory, Department, Job (open) | Static |

"Static" means Next.js prerenders the page at build time **with data from the database**. The page changes only when a server action calls `revalidatePath` for that exact path, or on the next deploy. See §6.

The blog categories are fixed in `src/features/blog/queries.ts`: `career-advice`, `hiring-insights`, `industry-news`.

### Auth (`src/app/(auth)`)

| Path | Behaviour |
|---|---|
| `/login` | Credentials sign-in. Honours `?next=` if it starts with `/`. Signed-in users are redirected. |
| `/forgot-password` | Shows a form. The action only validates and rate-limits. **It does not send an email or create a token.** |

### Admin (`src/app/(dashboard)/admin`), ADMIN or STAFF only

| Path | Purpose |
|---|---|
| `/admin` | Counts and the 8 latest leads. |
| `/admin/leads` | Lead list, filter by status (`?status=new`), change status. |
| `/admin/jobs`, `/new`, `/[id]/edit` | Post, edit, publish, close, reopen, archive jobs; featured/urgent flags; application counts. Status moves follow `JOB_STATUS_TRANSITIONS` in `features/jobs/admin-schemas.ts`. |
| `/admin/applications` | Applicant list with URL filters (`job`, `category`, `status`, `ageMin`/`ageMax`, `expMin`/`expMax`, `ctcMin`/`ctcMax`, `city`, `qualification`, `notice`, `from`/`to`, `q`, `sort`, `page`), 25 a page. Download resume, change status, internal note, delete. |
| `/admin/clients` | Create, edit, delete clients (`Company` rows). Deletion is blocked while jobs are attached. |
| `/admin/site-content` | Edit announcement bar, hero, process (4 steps), why-us (4 cards), achievements, contact details. |
| `/admin/blog`, `/new`, `/[id]/edit` | Write, edit, publish and delete markdown posts. |
| `/admin/success-stories` | Create, edit, delete stories. |
| `/admin/faqs` | Create, edit, delete FAQs. |
| `/admin/industries` | Create, edit, delete industries. The slug does not change on rename. |
| `/admin/testimonials` | Approve, feature, delete. **No create or edit.** |
| `/admin/newsletter` | List and delete subscribers. |
| `/admin/users` | List users. ADMIN can change roles. STAFF has read-only access. |
| `/admin/settings` | Account info, change password, last 100 audit-log rows. |

Admin lists show the 50 newest rows without pagination, except `/admin/applications`, which filters and paginates (25 a page). `/admin` shows a red banner for unresolved `SystemIncident` rows.

## 6. How data flows

### Reads

- Public pages call cached query functions in `features/*/queries.ts`. They use React `cache()` for per-request de-duplication only.
- Admin-editable blocks (hero, process, why-us, contact, announcement, achievements) live in the `Setting` table as one row per key. Keys are in `contentKeys` in `src/features/site-content/schemas.ts`.
- `readSetting()` returns the code default when a row is missing or fails zod validation. A bad row can never blank a section. Defaults are in `src/features/site-content/queries.ts` and `src/content/process.ts`.

### Writes

All mutations are server actions. Each one follows this pattern:

1. Check the role with `requireRole([...])`. Return `{ ok: false, error }` if not allowed.
2. Validate the input with zod. Return the first issue message on failure.
3. Write with Prisma.
4. Write an `AuditLog` row (admin actions only).
5. Call `revalidatePath(...)` for every public page that shows the data.
6. Return `{ ok: true, message? }`.

Public actions (`createLead`, `subscribeNewsletter`, `loginWithCredentials`, `requestPasswordReset`) add a honeypot field named `website` and a rate limit. They do not check a role.

### Cache invalidation rule

Next 16 `revalidatePath` refreshes **only the path you name**. It does not refresh other pages that read the same table. When you add a page that reads a table, add that page to the `revalidatePath` calls of every action that writes the table.

Each table has one helper that lists its pages:

| Table | Helper | Refreshes |
|---|---|---|
| Testimonial | `revalidateTestimonialPages()` in `features/admin/actions.ts` | `/`, `/testimonials`, `/employers`, `/why-choose-us`, `/admin/testimonials` |
| BlogPost | `revalidateBlogPages()` in `features/admin/actions.ts` | `/`, `/blog`, `/blog/category/*`, `/blog/*`, `/sitemap.xml`, `/admin/blog` |
| SuccessStory | `revalidateStoryPages()` in `features/site-content/actions.ts` | `/success-stories`, `/success-stories/*`, `/sitemap.xml` |
| Industry | `revalidateIndustryPages()` in `features/site-content/actions.ts` | Whole layout tree (the footer lists industries) and `/sitemap.xml` |
| FaqItem, Setting blocks | `revalidateContentPages()` in `features/site-content/actions.ts` | `/`, `/employers`, `/process`, `/why-choose-us`, `/about`, `/faq`, `/services/*` |
| Setting: contact, announcement | inline | Whole layout tree |
| Job | `revalidateJobPages()` in `features/jobs/cache.ts` | `/`, `/jobs`, `/jobs/*`, `/jobs/category/*`, `/industries/*`, `/sitemap.xml`, `/admin`, `/admin/jobs`, `/admin/applications` |
| JobApplication | inline in `applyToJob` and `features/jobs/admin-actions.ts` | `/admin`, `/admin/applications`, `/admin/jobs` |
| Company (client) | `saveClient` / `deleteClient` in `features/jobs/admin-actions.ts` | `/admin/clients` plus `revalidateJobPages()` |

`/sitemap.xml` is a cached route handler. Name it on its own: `revalidatePath("/sitemap.xml")`.

### JSON columns

Columns typed `Json` (for example `BlogPost.tags`, `SuccessStory.results`, `Setting.value`) hold a **JSON-encoded string**, not a native array or object. The code writes `JSON.stringify(value)` and reads with `jsonArray()` or `jsonValue()` from `@/lib/utils`. Keep this convention. Do not cast the raw value.

## 7. Database

- Provider: PostgreSQL (`prisma/schema.prisma`). The local `.env` points at a Neon database (region ap-southeast-1).
- On 2026-11-12 the migration history was baselined. `prisma/migrations/0_init` holds the full schema and is marked as applied on Neon. `npx prisma migrate status` reports "Database schema is up to date".
- Schema change workflow: edit `schema.prisma`, run `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script` into a new `prisma/migrations/<timestamp>_<name>/migration.sql`, review the SQL, then run `npx prisma migrate deploy` (this writes to the database in `DATABASE_URL`) and `npx prisma generate`.

### Tables in use

| Model | Used for |
|---|---|
| `User` | Admin and staff logins. Role enum: ADMIN, STAFF, EMPLOYER, CANDIDATE. |
| `Lead` | Request Talent submissions. Status: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST. |
| `BlogPost` | Markdown posts. `publishedAt` is set on the first publish only. |
| `Testimonial` | Shown only when `approved = true`. Homepage shows `featured = true` ones. |
| `SuccessStory` | Shown only when `status = PUBLISHED`. |
| `FaqItem` | Ordered by `order`. Audience: EMPLOYER, CANDIDATE, GENERAL. |
| `Industry` | Industry landing pages. |
| `NewsletterSubscriber` | Email list. |
| `Setting` | Key-value content blocks. |
| `AuditLog` | One row per admin mutation. |
| `Job` | Job posts. `confidential` hides the client name; `confidentialLabel` is shown instead. (Job board, in progress.) |
| `Department` | Job role categories. Seeded by `npm run seed:categories`. |
| `Company` | Client records attached to jobs. |
| `JobApplication` | Public "Apply" submissions. Holds applicant details and resume metadata (`resumeKey` in Cloudflare R2). One row per job per email. |
| `SystemIncident` | Failures with no signed-in user, such as a resume upload failing. Shown on `/admin` until resolved. |

### Resume storage

Resume files live in one private Cloudflare R2 bucket, reached through the S3 API by `src/lib/resume-storage.ts`. Object keys are `resumes/<32 hex>.<ext>`. The database row (`JobApplication.resumeKey`) is the only reference to a file.

- Upload: `applyToJob` checks the bytes, writes the file, then the row. If the row write fails, it deletes the file.
- Download: `/api/v1/resumes/[applicationId]` only, ADMIN or STAFF.
- Delete: `deleteApplication` removes the row, then the file. A failed file delete is recorded as a `SystemIncident`.
- Cleanup: `GET /api/cron/cleanup-resumes` (header `Authorization: Bearer <CRON_SECRET>`) closes PUBLISHED jobs past `validThrough` and deletes files older than 24 hours that no row references. `vercel.json` schedules it daily at 21:30 UTC (03:00 IST). On another host, schedule the same request. Without `CRON_SECRET` the route runs only outside production.

### Seed (`prisma/seed.ts`)

**The seed deletes every row in every table, then inserts sample data.** Do not run it against a database that holds real data. Check `DATABASE_URL` first.

The seed creates:

- 4 industries.
- 1 ADMIN user. Email = `ADMIN_EMAIL` (fallback `admin@mavira.dev`). Password = `ADMIN_PASSWORD` (fallback `Password@123`, with a warning).
- 2 sample testimonials (not approved), 1 sample success story (DRAFT).
- 2 published blog posts, 8 FAQs.

## 8. Auth and security

- NextAuth v5, Credentials provider only, JWT session. The token carries `id` and `role`.
- Three layers check access:
  1. `src/proxy.ts`: redirects `/admin/*` to `/login?next=...` when no `authjs.session-token` cookie exists. It does not verify the token.
  2. `(dashboard)/admin/layout.tsx`: redirects if the role is not ADMIN or STAFF.
  3. Every admin server action calls `requireRole`. `setUserRole` requires ADMIN.
- Rate limits are in memory. They reset on restart and are per instance. On serverless hosting, each instance has its own counters.
- Security headers are set in `next.config.ts`: X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS. There is no Content-Security-Policy.
- The blog markdown renderer (`src/features/blog/markdown.tsx`) HTML-escapes all input first and allows only `http(s)`, `/`, `#` and `mailto:` links.
- Resumes are stored in a private Cloudflare R2 bucket (encrypted at rest by R2). They leave storage only through `/api/v1/resumes/[applicationId]`, which requires an ADMIN or STAFF session and sends the file as an attachment with `nosniff`. The server checks each upload's magic bytes before storing it (`src/lib/resumes.ts`). There is no virus scan.
- There is no way to create a user from the UI. To add a staff member, insert a `User` row with a bcrypt hash (cost 12), then set the role in `/admin/users`.

## 9. Legacy code left from the job portal

These items are unused by the current site. Remove them only as a deliberate change.

- Prisma models: `CandidateProfile`, `EmployerProfile`, `Company`, `Department`, `Job`, `Application`, `Interview`, `Resume`, `SavedJob`, `ContactQuery`, `Notification`. Enums for jobs, applications and interviews.
- `InterviewStatusBadge` in `components/dashboard/status-badge.tsx`.
- `departmentSchema` in `site-content/schemas.ts` (role categories are seeded, not edited in the admin).
- Content blocks with an action, a form and a query but no screen: `StatsForm`, `LogosForm`, `TeamForm`, `saveStatsContent`, `saveLogosContent`, `saveTeam`, `getClientLogos`, `getTeam`. No public page reads them.
- Unimported components: `components/shared/stat-counter.tsx`.
- `EMPLOYER` and `CANDIDATE` roles land on `/` after sign-in and have no screens.
- Branch `production-readiness` (2026-07-31) adds email, tests, Blob storage, cron and invoices **for the old job portal**. It branched before the rebrand. Do not merge it as is.

## 10. Known issues (verified 2026-11-07)

1. **Forgot password does nothing.** `requestPasswordReset` returns success but sends no email and stores no token. The only way to reset a password is the change-password form while signed in, or a direct database update.
2. **Testimonials cannot be created or edited in the admin.** The seed text says "replace from the admin panel", but there is no screen for it.
3. **Deployment state is not recorded in the repo.** `vercel.json` holds only the cron schedule. There is no `.vercel/` folder. `docs/07-deployment-guide.md` refers to the old portal and to the `production-readiness` branch. Hosting is undecided: Vercel's Hobby plan is restricted to non-commercial personal use.
4. **Prisma warns** that `package.json#prisma` (the seed command) is deprecated and will be removed in Prisma 7.

## 11. Environment variables

| Name | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | Prisma | Postgres connection string. Never commit it. |
| `AUTH_SECRET` | NextAuth | Long random string. Different per environment. |
| `AUTH_TRUST_HOST` | NextAuth | `true` behind a proxy such as Vercel. |
| `NEXT_PUBLIC_SITE_URL` | `siteConfig.url` | Used for canonical URLs, sitemap, JSON-LD and `metadataBase`. Fallback `http://localhost:3000`. |
| `R2_ACCOUNT_ID` | `src/lib/resume-storage.ts` | Cloudflare account ID. Forms the endpoint `https://<id>.r2.cloudflarestorage.com`. |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | `src/lib/resume-storage.ts` | An R2 API token with "Object Read & Write" on the one bucket. |
| `R2_BUCKET` | `src/lib/resume-storage.ts` | Bucket name. Public access must stay off. |
| `CRON_SECRET` | `/api/cron/cleanup-resumes` | Bearer token the scheduler sends. Required in production. |
| `ADMIN_EMAIL` | `prisma/seed.ts` only | Admin login created by the seed. |
| `ADMIN_PASSWORD` | `prisma/seed.ts` only | If empty, the seed uses `Password@123`. |

`.env*` files are git-ignored. `.env.example` is the template.

## 12. Repository and remotes

- Default branch: `main`.
- `origin` = `github.com/Vivekg1306/talentbridge`.
- `mavira` = `github.com/Mukesh8372/Mavira-Solutions-Recruitment`.
- On 2026-11-07, `main`, `origin/main` and `mavira/main` were the same commit.

## 13. Where to change common things

| Change | Where |
|---|---|
| Company name, CIN, GSTIN, legal name | `src/config/site.ts` |
| Phone, email, address, hours, socials | Admin → Site content → Contact details (code defaults in `src/config/site.ts`) |
| Hero, process, why-us, achievements, announcement | Admin → Site content |
| Service pages | `src/content/services.ts` and `services` in `src/config/nav.ts` |
| Header and footer links | `src/config/nav.ts`. The footer "Industries" column (`source: "industries"`) lists the Industry table, then the static links. |
| Colors, radii, shadows, fonts | `src/app/globals.css` (`:root`, `.dark`, `@theme inline`) |
| Legal text | `src/app/(site)/privacy-policy/page.tsx`, `src/app/(site)/terms/page.tsx` |
| Admin sidebar | `src/config/dashboard-nav.ts` |
| Apply form fields and rules | `src/features/jobs/schemas.ts` (rules), `src/features/jobs/options.ts` (city, qualification and notice-period lists, age limits), `src/features/jobs/apply-form.tsx` (layout) |
| Resume size and types | `src/lib/resumes.ts`; the body limit in `next.config.ts` must stay above it |
| Social icons | Shown as "coming soon" placeholders in `site-footer.tsx` and `contact/page.tsx`. The `social` URLs in the contact setting are stored but not rendered as links. |
