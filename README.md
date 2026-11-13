# Mavira Solutions — company website

The public website, job board and admin CMS for Mavira Solutions Private Limited, a BFSI, broking and FinTech recruitment agency in Thane, Maharashtra.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma 6 (PostgreSQL) and NextAuth v5.

- **System overview, routes, data model and known issues:** [CONTEXT.md](CONTEXT.md)
- **Rules for changing the code:** [AGENTS.md](AGENTS.md)

## Quick start

1. Install packages. This also runs `prisma generate`.

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values. `DATABASE_URL` must be a PostgreSQL connection string. The `R2_*` values come from Cloudflare (see "Resume storage" below); without them the site runs but job applications fail with a clear message.

3. Start the dev server on http://localhost:3000.

   ```bash
   npm run dev
   ```

Sign in at `/login` with an ADMIN or STAFF account. There is no public sign-up.

### New, empty database only

The seed **deletes all data** before it inserts sample content. Run it only on a new database.

```bash
npx prisma db seed
```

It creates one admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`. If `ADMIN_PASSWORD` is empty, the password is `Password@123`. Change it at Admin → Settings.

Migrations are Postgres migrations with a baseline at `prisma/migrations/0_init`. Apply new ones with `npx prisma migrate deploy`. See CONTEXT.md §7.

### Role categories (safe on any database)

The job board needs the 14 role categories. This script only upserts by slug and never deletes:

```bash
npm run seed:categories
```

## Resume storage (Cloudflare R2)

Applicants upload a resume (PDF, DOCX or DOC, up to 2 MB). Files are stored in one private Cloudflare R2 bucket and can only be downloaded by a signed-in admin or staff user.

1. In the Cloudflare dashboard open **R2** and create a bucket, for example `mavira-resumes`. Leave public access off.
2. Open **Manage R2 API Tokens** and create a token with **Object Read & Write**, limited to that bucket. Copy the Access Key ID and the Secret Access Key; the secret is shown once.
3. Put the account ID, the two keys and the bucket name in `.env` as `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET`, and in the hosting provider's environment variables.
4. Set `CRON_SECRET` to a long random string. The daily cleanup job (`vercel.json`) sends it as a bearer token.

## What is inside

- **Public site:** home, about, 5 service pages, industries, employers (with the Request Talent form), process, why choose us, success stories, testimonials, FAQ, contact, blog, privacy, terms, 404.
- **Job board:** `/jobs` with search and filters, job detail pages with Google JobPosting markup, category pages, and an apply form with resume upload. No applicant accounts.
- **Admin CMS (`/admin`):** leads, jobs, applications (filters by age, experience, CTC, city and more), role categories, site content blocks, blog, success stories, FAQs, industries, testimonial approval, newsletter list, user roles, password change, audit log.
- **SEO:** Metadata API, canonical URLs, JSON-LD (Organization, WebSite, BreadcrumbList, FAQPage, Article), `sitemap.xml`, `robots.txt`.
- **Security:** zod on every action, bcrypt cost 12, role checks in the proxy, layouts and actions, honeypots and rate limits on public forms, security headers.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (reads the database) |
| `npm run start` | Serve the production build |
| `npx tsc --noEmit` | Typecheck |
| `npx eslint src --max-warnings 0` | Lint |
| `npm test` | Unit tests (Vitest) |
| `npm run seed:categories` | Upsert the job role categories |
| `npx prisma studio` | Browse the database |

## Environment

See `.env.example` and CONTEXT.md §11.

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="a-long-random-string"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET="mavira-resumes"
CRON_SECRET="a-long-random-string"
ADMIN_EMAIL="..."      # seed only
ADMIN_PASSWORD="..."   # seed only
```
