# Mavira Solutions — Step-by-Step Deployment Guide

> **Warning: parts of this guide are out of date (checked 2026-11-07).** It was written for the old job portal.
>
> - **Do not do Step 0.** The `production-readiness` branch belongs to the job portal and predates the rebrand.
> - `schema.prisma` already uses `postgresql`. The migration folder is still SQLite, so `prisma migrate deploy` fails (P3019). Fix the migration baseline before you use `prisma migrate deploy` in the build command. See `CONTEXT.md` §10, issue 1.
> - The seed no longer creates jobs or demo candidate and employer users. It still deletes all data.
> - `CRON_SECRET`, `LEADS_INBOX`, `RESEND_API_KEY`, `EMAIL_FROM`, `BLOB_READ_WRITE_TOKEN`, Upstash, `/api/health`, `vercel.json` and the job-alert cron do not exist in `main`.
> - Steps 1, 3 (without the extra variables), 7 and 10 still apply.

**Goal:** take the project from this repository to a live website on your own GoDaddy domain, on free tiers, with database, emails, file uploads, rate limiting and cron jobs working.

**Final architecture:**

```
Your GoDaddy domain ──DNS──▶ Vercel (Next.js app, free Hobby plan)
                                │
                ┌───────────────┼──────────────────┐
                ▼               ▼                  ▼
        Neon Postgres     Vercel Blob         Resend (emails)
        (database, free)  (resume/image       (free: 3,000/month)
                           storage, free)
                                │
                          Upstash Redis (rate limiting, free — optional)
```

**Time needed:** ~60–90 minutes end to end.
**Accounts you'll create (all free):** Vercel, Neon, Resend, Upstash. You already have GitHub and GoDaddy.

---

## Step 0 — Merge the `production-readiness` branch first

The `main` branch has the full site; the `production-readiness` branch adds email delivery, cloud file storage, tests, OG images, invoices, media library and job alerts. Deploy **once, with everything merged**, instead of deploying twice.

```bash
cd /Users/vivek/Projects/talentbridge

# Option A — via GitHub (recommended: you see the diff)
gh pr create --base main --head production-readiness \
  --title "Production readiness" --body "Email, tests, SEO, media, invoices, alerts"
# then open the PR on github.com, review, click "Merge pull request"

git checkout main && git pull

# Option B — directly on the command line
git checkout main
git merge production-readiness
git push
```

✅ **Check:** `git log --oneline | head -3` on main shows the "Production readiness" commit.

---

## Step 1 — Create the production database (Neon)

1. Go to **https://neon.tech** → *Sign up* → continue with GitHub.
2. Click **New Project**. Name: `talentbridge`. Region: **Asia Pacific (Singapore)** (closest to India). Postgres version: default.
3. On the project dashboard, find **Connection string**. Select **Pooled connection** and copy it. It looks like:
   ```
   postgresql://neondb_owner:xxxx@ep-xxxx-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this somewhere safe — it is used in Steps 2 and 3. **Never commit it to git.**

> Free tier: 0.5 GB storage, auto-suspends when idle (first request after idle takes ~1s extra). Plenty for launch.

---

## Step 2 — Switch the project from SQLite to Postgres

SQLite (the dev database) cannot run on Vercel — its filesystem is wiped on every deploy. This is a one-time, three-command switch.

1. **Edit** `prisma/schema.prisma` — change one word:
   ```prisma
   datasource db {
     provider = "postgresql"   // was "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. **Regenerate migrations for Postgres** (the existing migration files are SQLite dialect):
   ```bash
   # point your local shell at Neon just for this step
   rm -rf prisma/migrations
   DATABASE_URL="<your Neon pooled connection string>" npx prisma migrate dev --name init
   ```
   This creates fresh Postgres migrations AND applies them to Neon.

3. **Seed the production database** (demo jobs, admin login, site content):
   ```bash
   DATABASE_URL="<your Neon pooled connection string>" npx prisma db seed
   ```
   > ⚠️ The seed script **wipes and refills** the database. Run it exactly once, now. Never run it against production again after you start entering real data.

4. **Update your local `.env`** so local development also uses Postgres (recommended: create a **second** Neon project called `talentbridge-dev`, or use Neon's Branches feature, so dev experiments never touch production data):
   ```
   DATABASE_URL="postgresql://...your-dev-database..."
   ```

5. **Commit and push:**
   ```bash
   git add prisma && git commit -m "Switch to Postgres for production" && git push
   ```

✅ **Check:** `DATABASE_URL="<neon url>" npx prisma studio` opens and shows 33 rows in the Job table.

---

## Step 3 — Deploy the app to Vercel

1. Go to **https://vercel.com** → *Sign up* → **Continue with GitHub**.
2. Click **Add New… → Project** → you'll see your GitHub repos → **Import** `talentbridge`.
3. Framework preset: *Next.js* (auto-detected). Root directory: `./` (default).
4. **Build & Development Settings** → override **Build Command**:
   ```
   npx prisma migrate deploy && next build
   ```
   (This applies any new database migrations automatically on every deploy.)
5. Expand **Environment Variables** and add:

   | Name | Value | Notes |
   |---|---|---|
   | `DATABASE_URL` | your Neon **pooled** connection string | from Step 1 |
   | `AUTH_SECRET` | output of `openssl rand -base64 32` | run in any terminal |
   | `AUTH_TRUST_HOST` | `true` | required by NextAuth on Vercel |
   | `NEXT_PUBLIC_SITE_URL` | `https://talentbridge.vercel.app` | temporary — updated to your domain in Step 7 |
   | `CRON_SECRET` | output of `openssl rand -base64 24` | protects the job-alerts cron |
   | `LEADS_INBOX` | your team email address | where lead/contact alerts go |

   (Email and storage variables come in Steps 4–5; the app runs without them.)
6. Click **Deploy**. First build takes 2–3 minutes.

✅ **Check:** open `https://<your-project>.vercel.app/api/health` → should show `{"ok":true,"db":true,...}`. Then open the homepage, log in with `admin@mavira.dev` / `Password@123`.

> 🔐 **Immediately** go to Admin → Settings → change the admin password. Also change or delete the demo candidate/employer accounts (Admin → Users) before real launch.

---

## Step 4 — File storage for resumes & images (Vercel Blob)

Without this, "Apply with resume" and the admin Media library will fail in production (local-disk storage doesn't persist on Vercel).

1. In your Vercel project → **Storage** tab → **Create Database** → choose **Blob** → name it `talentbridge-files` → Create.
2. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment variables — verify it appears under Settings → Environment Variables.
3. **Redeploy** (Deployments → ⋯ on the latest → Redeploy) so the app picks it up.

✅ **Check:** on the live site, apply to any job with a small PDF → success panel appears; in Admin → Applications the resume link opens.

---

## Step 5 — Email delivery (Resend) + GoDaddy DNS records

1. Go to **https://resend.com** → sign up (free: 3,000 emails/month, 100/day).
2. **Domains → Add Domain** → enter your GoDaddy domain (e.g. `yourcompany.com`).
3. Resend shows you **3 DNS records** (values are unique to you):
   - TXT record for SPF (name like `send`, value `v=spf1 include:amazonses.com ~all`)
   - TXT record for DKIM (name like `resend._domainkey`, long value)
   - MX record (name like `send`, value `feedback-smtp...amazonses.com`, priority 10)
4. In a second tab, open **GoDaddy → My Products → your domain → DNS / Manage DNS** and click **Add New Record** for each of the three, copying name/value/priority exactly. Save.
5. Back in Resend, click **Verify DNS Records**. Propagation usually takes 5–30 minutes (up to a few hours).
6. **API Keys → Create API Key** (Full access) → copy it.
7. In Vercel → Settings → Environment Variables, add:

   | Name | Value |
   |---|---|
   | `RESEND_API_KEY` | `re_...` (the key you copied) |
   | `EMAIL_FROM` | `Mavira Solutions <notifications@yourcompany.com>` |

8. Redeploy.

✅ **Check:** on the live site use *Forgot password* with the admin email → the reset email arrives in the inbox (check spam the first time and mark "not spam").

---

## Step 6 — Rate limiting (Upstash Redis) — optional but recommended

Protects public forms against spam across all of Vercel's servers (without it, an in-memory fallback still works per-server).

1. **https://upstash.com** → sign up → **Create Database** → Redis, region Singapore, free tier.
2. On the database page copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**.
3. Add both to Vercel environment variables → redeploy.

---

## Step 7 — Connect your GoDaddy domain

1. In Vercel → your project → **Settings → Domains** → **Add**:
   - add `yourcompany.com`
   - add `www.yourcompany.com` (choose "Redirect to yourcompany.com" when asked)
2. Vercel shows the DNS values it needs. In **GoDaddy → Manage DNS**:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | A | `@` | `76.76.21.21` | default |
   | CNAME | `www` | `cname.vercel-dns.com` | default |

   > Delete/edit any existing conflicting records first: GoDaddy usually parks domains with an `A @ → Parked` record and a `CNAME www` — replace those. Don't touch the MX/TXT records you added for Resend.
3. Wait for Vercel's Domains page to show ✅ **Valid Configuration** (minutes to a few hours). HTTPS certificates are issued automatically.
4. **Update the env var** `NEXT_PUBLIC_SITE_URL` → `https://yourcompany.com` and **redeploy**. (This fixes canonical URLs, sitemap entries, OG links and emailed links.)

✅ **Check:** `https://yourcompany.com` loads with a padlock; `https://www.yourcompany.com` redirects; `https://yourcompany.com/sitemap.xml` lists URLs on your domain.

---

## Step 8 — Verify the cron job (job-alert emails)

`vercel.json` already schedules `GET /api/cron/job-alerts` daily at 03:00 UTC (08:30 IST). Because you set `CRON_SECRET` in Step 3, Vercel automatically sends it as the Authorization header.

✅ **Check:** Vercel → project → **Settings → Cron Jobs** shows the job. Trigger a test run:
```bash
curl -H "Authorization: Bearer <your CRON_SECRET>" https://yourcompany.com/api/cron/job-alerts
# → {"processed":N,"sent":M}
```

---

## Step 9 — Replace demo content with real content (launch gate)

Everything below is editable in the **admin panel** — no code needed. This is legally required before public launch (fake testimonials/ratings/certifications violate consumer-protection and advertising rules):

- [ ] Admin → **Site content**: real stats, hero copy, client names in the logo strip, awards, team, **contact details** (real phone/WhatsApp/email/address — also feeds Google's structured data)
- [ ] Admin → **Testimonials**: delete seeded ones; add real, permissioned quotes
- [ ] Admin → **Success stories**: replace with real case studies (or unpublish all)
- [ ] Admin → **Jobs**: close/delete seeded demo jobs; post real openings
- [ ] Admin → **Blog**: unpublish or rewrite seeded posts
- [ ] Footer trust strip (ISO/NAPS/Google-rating claims) is in code — edit `src/components/layout/site-footer.tsx` to match reality
- [ ] `src/config/site.ts`: legal name, founding year, and brand name if rebranding
- [ ] Legal pages (`/privacy-policy`, `/terms`): have a lawyer review; edit in code
- [ ] Delete demo users (Admin → Users) and the demo-login hint box in `src/app/(auth)/login/page.tsx`

---

## Step 10 — Post-launch checklist

- [ ] **Google Search Console** (https://search.google.com/search-console): add your domain (DNS TXT verification via GoDaddy), submit `https://yourcompany.com/sitemap.xml`. Jobs become eligible for the Google Jobs panel via the built-in JobPosting structured data.
- [ ] **Analytics**: Vercel → project → Analytics tab → Enable (free tier).
- [ ] **Uptime**: point a free monitor (e.g. UptimeRobot) at `https://yourcompany.com/api/health`.
- [ ] **Lighthouse**: Chrome DevTools → Lighthouse → run on the homepage (mobile) — expect 90s+.
- [ ] **Backups**: Neon free tier keeps point-in-time restore history; for extra safety run `pg_dump "$DATABASE_URL" > backup.sql` monthly.

---

## How future changes go live

| You do | What happens |
|---|---|
| Push a commit to `main` | Vercel builds & deploys automatically (~2 min) |
| Open a PR | Vercel creates a **preview URL** for that branch — test before merging |
| Change the database schema | Edit `schema.prisma` → `npx prisma migrate dev --name <change>` locally (against the dev DB) → commit the migration → push; the build command applies it to production automatically |
| Edit content | Admin panel — live immediately, no deploy |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: "@prisma/client did not initialize" | `postinstall: prisma generate` must be in package.json (it is) — check build logs for a different root error |
| Build fails at `migrate deploy` | `DATABASE_URL` env var missing/wrong in Vercel, or Neon project is deleted/suspended |
| Login loops back to /login in production | `AUTH_SECRET` missing or `AUTH_TRUST_HOST` not `true` |
| Resume upload error in production | `BLOB_READ_WRITE_TOKEN` missing → Step 4 |
| Emails not arriving | Resend domain not verified (Step 5.5) or `RESEND_API_KEY`/`EMAIL_FROM` missing; check Resend dashboard → Logs |
| Emails land in spam | DNS records incomplete — verify all 3 records in Resend show green |
| Domain shows GoDaddy parking page | Old `A @` parking record still present in GoDaddy DNS — delete it, keep only `76.76.21.21` |
| `www` doesn't work | Missing `CNAME www → cname.vercel-dns.com` |
| Wrong URLs in sitemap/emails | `NEXT_PUBLIC_SITE_URL` still set to the vercel.app URL — update + redeploy |
| Site slow on first request after idle | Neon free-tier auto-suspend — normal; upgrades remove it |
