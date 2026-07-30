# 05 — Technical Architecture

**Deliverables 14–21, 27–28.** Backend, database, auth, CMS, dashboards, folder structure, standards.

---

## 1. Stack (latest stable)

| Layer | Choice | Note |
|---|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript (strict)** | RSC-first; Client Components only for interactivity |
| Styling | **Tailwind CSS v4** + shadcn/ui + CVA | tokens via `@theme` CSS variables |
| Motion | **Framer Motion (`motion`)** | shared variants lib |
| Forms | **React Hook Form + Zod** (`zodResolver`) | schemas shared client/server |
| Data | **Prisma ORM → PostgreSQL** (SQLite in dev) | seed script with realistic data |
| Auth | **Auth.js v5 (NextAuth)** — credentials + optional Google | JWT sessions, role claims, middleware guards |
| Mutations | **Server Actions** (public forms) + **Route Handlers** `/api/v1/*` (dashboards, external) | one validation layer (zod) for both |
| Client cache | **TanStack Query** in dashboards only | public site stays RSC/no client fetching |
| Tables | TanStack Table | dashboards |
| Editor | Tiptap | blog/admin rich text |
| Email | Resend (or SMTP) — application/lead notifications | templated |
| Uploads | UploadThing or S3-compatible presigned URLs; local disk adapter in dev | resume PDF/DOC ≤ 5MB, mime-sniffed |
| Rate limiting | Upstash Ratelimit (or in-memory LRU fallback in dev) | per-IP on all public mutations |
| SEO | **Next Metadata API** (supersedes next-seo in App Router), `next-sitemap` not needed — native `sitemap.ts`/`robots.ts`; JSON-LD via typed helpers | |
| Validation of env | zod-validated `env.ts` | fail fast |
| Quality | ESLint (typescript-eslint strict + jsx-a11y + tailwind) · Prettier · Husky + lint-staged | CI-enforced |

**Note on the brief:** `next-seo` and `axios` are Pages-Router-era choices. In App Router, the native Metadata API and `fetch`/Server Actions are strictly better (smaller bundle, RSC-compatible). TanStack Query is included where it earns its keep (dashboards). Flagging the deviation rather than silently applying it.

## 2. Folder structure (feature-based)

```
src/
├── app/
│   ├── (marketing)/                 # public site — RSC, static/ISR
│   │   ├── page.tsx                 # Home
│   │   ├── about/ services/[slug]/ industries/[slug]/ employers/
│   │   ├── candidates/ why-choose-us/ process/ success-stories/[slug]/
│   │   ├── testimonials/ blog/[slug]/ resources/ faq/ contact/
│   │   ├── privacy-policy/ terms/
│   │   └── layout.tsx               # header/footer shell
│   ├── (jobs)/jobs/                 # listing (searchParams, ISR+dynamic), [slug]/, category/[slug]/
│   ├── (auth)/login|register|forgot-password/
│   ├── (dashboard)/
│   │   ├── dashboard/…              # candidate
│   │   ├── employer/…               # employer
│   │   ├── admin/…                  # admin/staff
│   │   └── layout.tsx               # DashboardShell + role guard
│   ├── api/v1/…                     # route handlers (below)
│   ├── sitemap.ts robots.ts manifest.ts not-found.tsx
│   └── layout.tsx                   # root: fonts, theme, analytics, org JSON-LD
├── features/                        # vertical slices: components + actions + queries + schemas per feature
│   ├── jobs/    applications/ employers/ candidates/ leads/
│   ├── blog/    testimonials/ contact/ newsletter/
│   ├── auth/    admin/ interviews/ media/ reports/
├── components/
│   ├── ui/                          # shadcn primitives
│   ├── layout/                      # header, footer, mobile-nav, dashboard-shell
│   └── shared/                      # SectionHeading, CtaBand, StatCounter, LogoMarquee, JsonLd…
├── lib/                             # prisma.ts, auth.ts, motion.ts, seo.ts, rate-limit.ts, email.ts, utils.ts, env.ts
├── hooks/                           # use-scroll-position, use-media-query, use-debounce…
├── config/                          # site.ts (brand, NAP, socials), nav.ts, seo-defaults.ts
├── styles/globals.css               # @theme tokens
└── types/
prisma/schema.prisma  prisma/seed.ts
tests/  e2e/  public/
```
Absolute imports via `@/*`. Rule: `features/*` may import `components|lib|hooks`, never another feature (cross-feature via composition in `app/`).

## 3. Database schema (Prisma, condensed)

```prisma
enum Role { ADMIN STAFF EMPLOYER CANDIDATE }
enum JobStatus { DRAFT PUBLISHED CLOSED ARCHIVED }
enum WorkMode { ONSITE REMOTE HYBRID }
enum EmploymentType { FULL_TIME PART_TIME CONTRACT INTERNSHIP }
enum ApplicationStatus { APPLIED SCREENING SHORTLISTED INTERVIEW OFFERED PLACED REJECTED WITHDRAWN }
enum LeadStatus { NEW CONTACTED QUALIFIED CONVERTED LOST }

model User { id cuid; email unique; passwordHash?; name; phone?; role Role @default(CANDIDATE);
  emailVerified?; image?; candidateProfile?; employerProfile?; notifications[]; auditLogs[];
  createdAt updatedAt }

model CandidateProfile { userId unique; headline?; summary?; experienceYears?; currentSalary?;
  expectedSalary?; location?; skills String[]; resumes Resume[]; documents Document[];
  applications[]; savedJobs[]; profileScore Int @default(0) }

model EmployerProfile { userId unique; company Company; designation? }
model Company { id; name; slug unique; logoUrl?; website?; industry Industry?; size?; about?;
  jobs[]; testimonials[]; invoices[] }

model Job { id; slug unique; title; description; responsibilities String[]; requirements String[];
  benefits String[]; skills String[]; department Department; industry Industry?;
  location; workMode WorkMode; employmentType EmploymentType;
  experienceMin experienceMax Int; salaryMin salaryMax Int?; salaryVisible Boolean;
  status JobStatus; featured Boolean; urgent Boolean; validThrough DateTime?;
  company Company; postedBy User; applications[]; savedBy[]; viewCount;
  seoTitle? seoDescription?; publishedAt?; @@index([status, publishedAt]) @@index([department, location]) }

model Application { id; job Job; candidate CandidateProfile; resume Resume;
  coverNote?; status ApplicationStatus @default(APPLIED); statusHistory Json[];
  interviews Interview[]; source?; @@unique([jobId, candidateId]) }

model Interview { id; application; scheduledAt; mode (CALL|VIDEO|ONSITE); location?;
  meetingUrl?; interviewer?; status (SCHEDULED|COMPLETED|CANCELLED|NO_SHOW); feedback?; rating? }

model Resume { id; candidateId; fileUrl; fileName; mimeType; sizeBytes; parsedText?; isPrimary }
model SavedJob { @@unique([candidateId, jobId]) }
model Department { id; name; slug unique; icon? }         // taxonomy → category pages
model Industry   { id; name; slug unique; icon?; description? }

model BlogPost { id; slug unique; title; excerpt; content(Json/Tiptap); coverImage?;
  category BlogCategory; tags String[]; author User; status; publishedAt?; readMinutes;
  seoTitle? seoDescription? }
model Testimonial { id; authorName; authorRole; company?; avatarUrl?; quote; rating;
  kind (CLIENT|CANDIDATE); featured; approved }
model SuccessStory { id; slug; title; clientName; industry; challenge; solution; results Json;
  metrics Json; coverImage?; published }

model Lead { id; kind (REQUEST_TALENT|GENERAL); companyName?; name; email; phone;
  hiringType?; rolesNeeded?; message?; status LeadStatus; assignedTo?; notes[] }
model ContactQuery { id; name; email; phone?; audience (EMPLOYER|CANDIDATE|OTHER); message; handled }
model NewsletterSubscriber { email unique; verifiedAt?; unsubscribedAt? }

model MediaAsset { id; url; alt?; width height; mimeType; uploadedBy; usage? }
model SeoSetting { route unique; title; description; ogImage?; noindex }
model Notification { id; user; type; title; body?; readAt?; link? }
model AuditLog { id; actor User; action; entity; entityId; diff Json?; ip?; createdAt }
model Invoice { id; company; number unique; amountCents; currency; status; dueDate; pdfUrl? }
model Setting { key unique; value Json }                   // site stats, SLA copy, socials
```

## 4. API surface (`/api/v1`) + Server Actions

**Public (rate-limited, zod-validated, honeypot):**
`GET /jobs` (q, location, department, experience, salary, type, mode, sort, page) · `GET /jobs/:slug` · Server Actions: `applyToJob`, `uploadResume`, `createLead`, `createContactQuery`, `subscribeNewsletter`.

**Auth:** Auth.js handlers `/api/auth/*`; `register` action (candidate default; employer accounts provisioned by admin or verified-domain signup).

**Candidate (role: CANDIDATE):** `GET/PATCH /me/profile` · `GET /me/applications` · `POST/DELETE /me/saved-jobs/:jobId` · `GET /me/interviews` · resumes CRUD · notifications.

**Employer (role: EMPLOYER, scoped to own company):** company profile · `POST /employer/jobs` (draft → admin approval) · jobs CRUD · `GET /employer/applications?jobId=` · shortlist/status transitions · interviews CRUD · reports summary · invoices (read).

**Admin (role: ADMIN/STAFF, permission-checked):** full CRUD on every entity, application pipeline transitions, blog publishing, testimonial approval, lead pipeline, newsletter export, SEO settings, media library, users & roles, reports (`GET /admin/reports?range=`: placements, time-to-fill, source, funnel), audit log (auto-written by a `withAudit` mutation wrapper).

**Conventions:** JSON `{ data, error, meta }`; cursor pagination in dashboards, page pagination public; errors are typed discriminated unions; every mutation revalidates the affected tags (`revalidateTag('jobs')` etc.).

## 5. Auth flow

Credentials (bcrypt) + optional Google OAuth. JWT session carries `{ id, role }`. `middleware.ts` guards `/dashboard|/employer|/admin` by role prefix; server-side `requireRole()` re-checks in every layout + action (defense in depth). Apply-without-account: application creates a shadow CANDIDATE user + emails a set-password link. Forgot password: single-use tokens, 30-min expiry. Admin routes additionally check granular permissions (STAFF subset). CSRF: Server Actions have built-in origin checks; route handlers verify `Origin`/same-site + auth token.

## 6. CMS architecture

Admin dashboard **is** the CMS (no external headless CMS in v1 — one deploy, no vendor):
blog (Tiptap → JSON → RSC renderer), testimonials, success stories, FAQ items, client logos, site stats, SEO overrides per route, media library. All public reads go through cached data-layer functions (`unstable_cache` + tags); admin mutations invalidate tags → public pages update instantly while staying static-fast.

## 7. Security

zod on every boundary · Prisma (parameterized) · sanitized rich-text render (allowlist) · honeypot + time-trap + rate limit on public forms · upload mime-sniffing, size caps, randomized names, non-executable storage · secure headers in `next.config` (CSP, HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy) · bcrypt(12) · audit log on all admin mutations · no PII in logs · role checks server-side always.

## 8. Coding standards

Strict TS (`noUncheckedIndexedAccess`, no `any`) · named exports · components ≤ ~150 lines, extract hooks · server-only data layer modules marked `import "server-only"` · zod schema single-source (infer types) · no barrel-file cycles · conventional commits · PR checklist: types, a11y, loading/empty/error states, mobile.
