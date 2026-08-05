# 06 — SEO, Performance, Accessibility, Testing, Deployment & Scalability

**Deliverables 22–26, 29.**

---

## 1. SEO strategy

### Technical
- **Metadata API:** per-page `generateMetadata` — title template `%s | Mavira Solutions`, unique descriptions, canonical, OG + Twitter cards (dynamic OG images for jobs/blog via `next/og`).
- **JSON-LD helpers (`lib/seo.ts`), typed:**
  - `Organization` + `LocalBusiness` (NAP, geo, hours) — root layout
  - `WebSite` + SearchAction (sitelinks search box) — home
  - `JobPosting` — every job (title, description, datePosted, validThrough, employmentType, hiringOrganization, jobLocation/`jobLocationType: TELECOMMUTE`, baseSalary) → **Google Jobs eligibility**
  - `BreadcrumbList` everywhere; `FAQPage` on /faq + service pages; `Article` on blog; `Review`/`AggregateRating` on testimonials (policy-compliant placement)
- `sitemap.ts` (static + dynamic jobs/blog/categories, lastModified) · `robots.ts` (block /admin, /dashboard, /employer, /api) · expired jobs → 30-day grace then 410 · filtered job URLs canonical → /jobs.

### Content architecture
- Programmatic landing pages: `/jobs/category/[slug]` + `/industries/[slug]` target "X jobs in Y" and "X recruitment agency" queries with unique CMS intro copy.
- Blog clusters: Career Advice (candidate keywords) and Hiring Insights (employer keywords) each interlink to their conversion pages.
- One `h1`/page, semantic sectioning, descriptive anchors, image alt discipline, internal-link modules on every template.

## 2. Performance plan (Lighthouse ≥ 95 mobile)

| Budget | Target |
|---|---|
| LCP / INP / CLS / TTFB | ≤ 1.8s / ≤ 200ms / ≤ 0.05 / ≤ 200ms |
| First-load JS (marketing pages) | ≤ 120KB gz |
| Hero image | ≤ 60KB AVIF (ours is SVG/DOM ≈ 0) |

**How:** RSC-first — marketing pages ship near-zero client JS; Client Components are leaf nodes (`"use client"` at menu/carousel/form level, not sections). Static + ISR with tag revalidation; jobs listing streams with Suspense + skeletons. `next/font` self-hosted variable font (one file, swap, preload). `next/image` AVIF/WebP, exact `sizes`, priority only on LCP element. Dynamic `import()` for Tiptap, map embed (click-to-load facade), dashboard charts. No layout-shifting animation (transform/opacity only), fixed aspect boxes for media, skeletons match final dimensions (CLS). Prefetch on viewport for primary CTA routes; `preconnect` only to origins actually used. Bundle analyzer in CI + Lighthouse CI budget gate.

## 3. Accessibility checklist (WCAG 2.2 AA)

- [ ] Keyboard: full traversal, logical order, no traps; mega-menu & mobile sheet arrow/Escape support; focus return on dialog close
- [ ] Visible focus ring everywhere (2px + offset); skip-to-content link
- [ ] Landmarks + heading hierarchy validated per page
- [ ] Contrast: all token pairs ≥ 4.5:1 (text) / 3:1 (UI) — checked in both themes
- [ ] Forms: labels, `autocomplete`, inline errors with `aria-describedby` + `role="alert"`, error summary focus on submit fail
- [ ] Media: alt text meaningful or `""`; icon-only buttons labeled; decorative SVG `aria-hidden`
- [ ] Motion: `prefers-reduced-motion` honored globally; no autoplay carousels; marquee pausable
- [ ] Tables → responsive card fallback keeps header association (`scope`, `aria`)
- [ ] Touch targets ≥ 44×44; zoom to 200% without loss; no horizontal scroll at 320px
- [ ] Tooling: eslint-plugin-jsx-a11y (CI), axe-core in Playwright on every template, manual NVDA/VoiceOver pass on Home, Jobs, Apply, Contact

## 4. Testing strategy

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest + Testing Library | utils, hooks, zod schemas, JSON-LD builders |
| Component | Vitest + Testing Library | primitives states, forms (error/loading/success), JobCard, filters |
| Integration | Vitest + Prisma (SQLite) | server actions & route handlers: authz matrix, rate limits, status transitions |
| E2E | Playwright (chromium + mobile Safari viewport) | 6 critical flows: browse→filter→apply · request talent · register/login · candidate tracks application · employer posts job→shortlists · admin publishes blog |
| A11y | axe in Playwright | every public template, both themes |
| Perf | Lighthouse CI | budget gate on PR |

CI (GitHub Actions): typecheck → lint → unit/integration → build → E2E → LHCI. Seed factories give deterministic data.

## 5. Deployment strategy

**Vercel** (fits Next 15: ISR, image opt, edge middleware) + **Neon/Supabase Postgres** + Upstash Redis (rate limit) + S3/UploadThing (resumes) + Resend (email).
Environments: preview per-PR (seeded branch DB) → staging → production. Migrations: `prisma migrate deploy` step before promote. Monitoring: Vercel Analytics + Speed Insights, Sentry (client+server), uptime check on `/api/health`. Backups: daily DB snapshot, 30-day retention. DNS/HTTPS managed; www→apex redirect; security headers verified post-deploy. Rollback = redeploy previous build + `migrate resolve` runbook.

## 6. Future scalability plan

- **Phase 1.1:** resume parsing (text extraction → skill tags), saved-search job alerts (email digests), WhatsApp Business API notifications.
- **Phase 1.2:** employer self-serve billing (Stripe/Razorpay + invoice PDFs), granular staff permissions, interview calendar sync (Google/Outlook).
- **Phase 2:** candidate–recruiter matching scores, multi-office/multi-language (next-intl; schema already locale-ready), public employer profiles, mobile app (API surface already versioned at /v1).
- **Architecture headroom:** features are vertical slices → extractable; DB indexed for the listing/filter hot paths; search can graduate from Postgres full-text (v1) to Meilisearch/Typesense behind the same data-layer interface; all public reads behind tag-cached functions so a CDN/cache layer swap is invisible to pages.
