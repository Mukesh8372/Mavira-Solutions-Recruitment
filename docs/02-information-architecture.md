# 02 — Sitemap & Information Architecture

**Deliverables 3–4.** URL design is final: SEO-friendly, shallow (≤ 3 levels), breadcrumb-mapped.

---

## 1. Sitemap

```
/                                Home
├── /about                       About Us (story, team, certifications, awards, media)
├── /services                    Services hub
│   ├── /services/permanent-hiring
│   ├── /services/contract-staffing
│   ├── /services/executive-search
│   ├── /services/bulk-hiring
│   ├── /services/campus-hiring
│   ├── /services/payroll-services
│   └── /services/hr-consulting
├── /industries                  Industries hub
│   └── /industries/[slug]       IT, BFSI, Healthcare, Manufacturing, Retail, Logistics, Hospitality, Engineering
├── /jobs                        Current Openings (search, filters, sort, pagination)
│   ├── /jobs/[slug]             Job Detail (JobPosting schema)
│   └── /jobs/category/[slug]    Job Categories landing pages (SEO)
├── /employers                   Employer Solutions hub (+ Request Talent form)
├── /candidates                  Candidate Services hub (+ Resume Upload)
├── /why-choose-us               Differentiators, stats, certifications
├── /process                     Our Process (recruitment lifecycle timeline)
├── /success-stories             Case studies index
│   └── /success-stories/[slug]
├── /testimonials                Testimonials (clients + candidates, filterable)
├── /blog                        Blog index (categories: Career Advice, Hiring Insights, Industry News)
│   ├── /blog/[slug]             Article (Article schema)
│   └── /blog/category/[slug]
├── /resources                   Downloadables: salary guides, resume templates, interview checklists
├── /faq                         FAQ (candidate + employer tabs, FAQPage schema)
├── /contact                     Contact (map, form, phone, WhatsApp, hours)
├── /privacy-policy
├── /terms
├── /login  /register  /forgot-password
├── /dashboard                   Candidate dashboard (auth: CANDIDATE)
├── /employer                    Employer dashboard (auth: EMPLOYER)
├── /admin                       Admin dashboard (auth: ADMIN/STAFF)
├── /sitemap.xml  /robots.txt  /manifest.webmanifest
└── /*                           404 (designed, helpful links + job search box)
```

## 2. Global Navigation

**Header (sticky, glass on scroll):**
Logo · Services ▾ (mega-menu: 7 services + featured CTA card) · Industries ▾ · Jobs · Employers · Candidates · About ▾ (About, Why Us, Process, Success Stories, Testimonials) · Blog · Contact
Right side: phone number (desktop) · `Upload Resume` (secondary) · `Request Talent` (primary) · theme toggle · avatar (if authed)

**Mobile:** hamburger → full-screen sheet, accordion groups, both CTAs pinned at bottom, phone/WhatsApp row.

**Breadcrumbs:** on every page below level 1, with BreadcrumbList schema. Pattern: `Home / Jobs / Senior React Developer – Bengaluru`.

## 3. Footer IA (4 columns + bottom bar)

| Company | For Employers | For Candidates | Resources |
|---|---|---|---|
| About Us | Permanent Hiring | Browse Jobs | Blog |
| Why Choose Us | Contract Staffing | Upload Resume | Salary Guides |
| Our Process | Executive Search | Career Advice | FAQ |
| Success Stories | Bulk Hiring | Interview Prep | Contact |
| Testimonials | Request Talent | Job Categories | Sitemap |

Above columns: newsletter block (single email field + consent note). Below: certifications strip, social icons, © line, Privacy · Terms. NAP (name/address/phone) in schema-marked block for local SEO.

## 4. Page-level IA (key templates)

### Home (section order = conversion narrative)
1. Hero (headline, subhead, dual CTA, product-style illustration, floating stat chips)
2. Client logo marquee ("Trusted by 500+ companies")
3. Stats band (animated counters ×4)
4. Services grid (7 cards → service pages)
5. Industries strip (8 chips/cards)
6. Process (4-step horizontal timeline)
7. Featured Jobs (6 cards + "View all")
8. Why Choose Us (split layout, 4 differentiators)
9. Testimonials (carousel, client + candidate mix)
10. Achievements/awards + media logos
11. Latest from Blog (3 cards)
12. FAQ (top 6, accordion)
13. Final CTA band (dual path: hire / get hired)

### Jobs (listing)
Search bar (keyword + location + search btn) → filter rail (department, experience, salary range, employment type, work mode, posted date) → sort (relevance/newest/salary) → results grid → pagination. Filters in URL query params (shareable, crawlable canonical rules). Mobile: filters in bottom sheet, active-filter chips.

### Job Detail
Title block (role, company, location, badges: type/mode/experience) → Apply CTA (sticky on mobile) → salary + meta card → Responsibilities → Requirements → Skills (chips) → Benefits → About company → Apply form (inline, anchored) → Related jobs (4) → JobPosting JSON-LD.

### Employers hub
Hero (employer-specific) → pain/solution intro → 7 service cards → process → stats → success story highlight → testimonials (clients only) → Request Talent form → FAQ (employer tab).

### Candidates hub
Hero → service cards (job search, resume help, interview prep, skill development, placement support) → resume upload block → latest jobs (4) → how tracking works → testimonials (candidates) → FAQ.

### Contact
Split: form (name, email, phone, I am [employer/candidate], message) | info card (address, phone, WhatsApp deep link, email, hours, map embed lazy-loaded, social).

## 5. URL & taxonomy rules
- Slugs: kebab-case, ≤ 60 chars; job slugs `role-title-location-shortid` (shortid guarantees uniqueness, e.g. `senior-react-developer-bengaluru-a8x2`).
- Categories and industries are CMS-managed taxonomies; adding one auto-creates its landing page + sitemap entry.
- Filtered job URLs: `canonical` → `/jobs`; only category/industry landing pages are indexable filtered views.
- Expired jobs: page stays live 30 days with "no longer accepting applications" + related jobs, `JobPosting.validThrough` respected, then 410.

## 6. Internal linking strategy
Service pages ↔ relevant industry pages ↔ relevant job-category pages (contextual link blocks, CMS-driven). Blog posts link to job categories and services via inline links + "related roles" footer module. Every dead-end page gets a next-step CTA block.
