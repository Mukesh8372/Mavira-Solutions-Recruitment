# TalentBridge — Recruitment & Placement Platform

A premium recruitment-agency website with a jobs engine, three role-based dashboards and an admin-as-CMS — built with Next.js 16, TypeScript (strict), Tailwind CSS v4, Prisma and NextAuth v5.

> Full product strategy, design system and architecture docs live in [`docs/`](docs/README.md).

## Quick start

```bash
npm install
npx prisma migrate dev   # creates SQLite dev.db
npx prisma db seed       # 33 jobs, 12 companies, blog, testimonials, demo users
npm run dev              # http://localhost:3000
```

### Demo logins (password: `Password@123`)

| Role | Email | Lands on |
|---|---|---|
| Candidate | `candidate@talentbridge.dev` | `/dashboard` |
| Employer | `employer@talentbridge.dev` | `/employer` |
| Admin | `admin@talentbridge.dev` | `/admin` |

## What's inside

- **Public site** — Home, About, 7 service pages, industries, employer & candidate hubs, process, why-us, success stories, testimonials, FAQ, contact, blog, legal pages, designed 404.
- **Jobs engine** — search + filters (department, experience, salary, type, mode) in URL params, sorting, pagination, job detail with JobPosting JSON-LD (Google Jobs-ready), guest apply flow with resume upload (creates a trackable shadow account), saved jobs, share.
- **Candidate dashboard** — applications with live status, saved jobs, interviews with meeting links, resume manager, profile completion meter, notifications, settings.
- **Employer dashboard** — post/manage jobs (admin-reviewed), application pipeline with status transitions + candidate notifications, interview scheduling, company profile, funnel reports, invoiced-ready schema.
- **Admin dashboard (the CMS)** — moderate jobs (publish/feature), all applications, candidates, employers, leads pipeline, contact queries, blog authoring (markdown), testimonial approval, newsletter list, users & roles, audit log.
- **SEO** — Metadata API everywhere, canonical URLs, Organization/WebSite/BreadcrumbList/JobPosting/FAQPage/Article JSON-LD, `sitemap.xml`, `robots.txt`.
- **Security** — zod validation on every boundary, bcrypt(12), role checks in proxy + layouts + every server action, rate-limited public forms with honeypots, authorized-only resume file serving, security headers, audit logging.
- **A11y & performance** — WCAG-minded components (labels, focus rings, aria, reduced-motion), RSC-first with client islands, self-hosted variable font, zero-image hero.

## Environment

`.env` (see `.env.example`):

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-a-long-random-string"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Production notes

- **Database**: switch `prisma/schema.prisma` provider to `postgresql`; convert the Json string-array columns to native `String[]` (documented in `docs/05-technical-architecture.md`).
- **Uploads**: `src/lib/uploads.ts` is a local-disk adapter; swap for S3/UploadThing behind the same function signature. Resumes are served only through the authorized route `/api/v1/files/[name]`.
- **Email**: password reset + notification email senders are stubbed (`src/features/auth/actions.ts`); wire Resend/SMTP.
- **Rate limiting**: in-memory (single instance); swap for Upstash Ratelimit when scaling out.
- Deployment pipeline, testing strategy and scalability roadmap: `docs/06-quality-plan.md`.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Typecheck |
| `npx prisma studio` | Browse the database |
| `npx prisma db seed` | Re-seed demo data |

## Rebranding

All brand facts (name, phone, address, socials, SLA copy) live in `src/config/site.ts`. Colors/typography are CSS variables in `src/app/globals.css`.
