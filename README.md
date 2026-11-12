# Mavira Solutions — company website

The public website and admin CMS for Mavira Solutions Private Limited, a BFSI, broking and FinTech recruitment agency in Thane, Maharashtra.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma 6 (PostgreSQL) and NextAuth v5.

- **System overview, routes, data model and known issues:** [CONTEXT.md](CONTEXT.md)
- **Rules for changing the code:** [AGENTS.md](AGENTS.md)

## Quick start

1. Install packages. This also runs `prisma generate`.

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values. `DATABASE_URL` must be a PostgreSQL connection string.

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

## What is inside

- **Public site:** home, about, 5 service pages, industries, employers (with the Request Talent form), process, why choose us, success stories, testimonials, FAQ, contact, blog, privacy, terms, 404.
- **Admin CMS (`/admin`):** leads, site content blocks, blog, success stories, FAQs, industries, testimonial approval, newsletter list, user roles, password change, audit log.
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
| `npx prisma studio` | Browse the database |

## Environment

See `.env.example` and CONTEXT.md §11.

```
DATABASE_URL="postgresql://..."
AUTH_SECRET="a-long-random-string"
AUTH_TRUST_HOST=true
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_EMAIL="..."      # seed only
ADMIN_PASSWORD="..."   # seed only
```
