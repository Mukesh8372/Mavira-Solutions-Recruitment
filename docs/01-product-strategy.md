# 01 — Product Strategy & UX Research

**Project:** Mavira Solutions — Recruitment & Placement Agency Platform
**Phase:** Pre-implementation strategy (Deliverables 1–2, 22 partial)
**Date:** 2026-07-28

---

## 1. Positioning

Mavira Solutions is a full-service recruitment and placement agency connecting employers with vetted talent across IT, BFSI, manufacturing, healthcare, retail, and logistics. The website's job is to do three things within 5 seconds of landing:

1. **Signal credibility** — this is an established, professional firm (stats, logos, testimonials, certifications).
2. **Route the visitor** — every visitor is one of two people: *"I need to hire"* or *"I need a job."* The IA splits on this axis immediately.
3. **Capture the lead** — Request Talent (employer) or Apply/Upload Resume (candidate). Everything funnels to these two conversions.

**Brand promise:** "The right people, faster." Precision + speed + human touch.

**Anti-goals:** No LinkedIn clone, no job-board marketplace ambitions in v1. This is an agency site with a jobs engine and lead capture, executed at SaaS-product quality.

## 2. Competitive Analysis (functional, not visual)

| Reference | What works (keep the function) | What fails (fix in ours) |
|---|---|---|
| rudraplacements.com | Clear service taxonomy (permanent/contract/executive), industry list, dual employer/candidate paths | Dated visuals, weak trust signals, no real job search, poor mobile, no conversion focus |
| kwalityjobs.com | Job categories, registration flows, process explanation | Cluttered layout, stock-photo fatigue, no filtering/sorting, weak SEO structure |

**Our edge:** a real searchable jobs engine, structured data (JobPosting schema) for Google Jobs indexing, dashboards for all three roles, and a design language borrowed from Stripe/Linear/Vercel rather than 2012 corporate India.

## 3. User Personas

### P1 — Priya, HR Manager (Employer, primary revenue persona)
- 34, HR Manager at a 400-person fintech. Hires 8–15 roles/quarter; overloaded.
- **Goals:** shortlists of pre-screened candidates in days, not weeks; a partner who understands the domain.
- **Pain:** agencies that spam irrelevant CVs; no visibility into pipeline status.
- **Trust triggers:** client logos in her industry, placement stats, time-to-shortlist claims, named success stories, certifications (ISO, NAPS).
- **Key journey:** Google → Employer Solutions → service detail → **Request Talent form** → dashboard to track requisitions.
- **Device:** 70% desktop.

### P2 — Arjun, Mid-career Software Engineer (Candidate, volume persona)
- 29, 6 YOE, passively looking, browses on phone at night.
- **Goals:** relevant roles fast; salary transparency; apply in under 2 minutes; never re-type a resume.
- **Pain:** black-hole applications, forced account creation before seeing jobs, clunky mobile forms.
- **Trust triggers:** real job details (salary range, company stage), application status tracking, quick response.
- **Key journey:** Google Jobs / search → Job Detail → **Apply (resume upload, 3 fields)** → account auto-created → track status.
- **Device:** 85% mobile.

### P3 — Sneha, Fresh Graduate (Candidate, growth persona)
- 22, B.Com, first job hunt, low confidence, high anxiety.
- **Goals:** guidance, not just listings — resume help, interview prep, "what am I qualified for?"
- **Trust triggers:** free career guidance content, campus-hiring credibility, testimonials from people like her.
- **Key journey:** Instagram/blog → Career Advice → Candidate Services → **Register + upload resume**.

### P4 — Vikram, Operations Director (Employer, bulk/contract persona)
- 45, logistics firm, needs 200 warehouse staff in 6 weeks + seasonal contract staffing.
- **Goals:** one vendor for bulk + payroll compliance; SLA clarity; a phone number that answers.
- **Key journey:** referral → Bulk Hiring page → case study → **call / WhatsApp / Request Talent**.

### P5 — Internal: Admin/Recruiter (staff persona for dashboards)
- Manages jobs, parses inbound resumes, matches candidates to requisitions, schedules interviews, publishes blogs, answers leads. Needs speed, keyboard-friendly tables, and zero-friction status updates.

## 4. User Journeys (conversion-mapped)

### Employer journey
```
Awareness        Consideration              Conversion            Retention
Google/referral → Employer Solutions hub → Service detail page → Request Talent form
                  Success stories           Process (4 steps)     ↓ (< 24h SLA promise)
                  Stats / logos             FAQ                   Employer dashboard:
                                            Pricing signal        post jobs, view pipeline,
                                                                  shortlist, schedule, invoices
```
**Friction removals:** form ≤ 6 fields, no account needed to submit lead, sticky "Request Talent" CTA on all employer pages, WhatsApp/phone escape hatch always visible.

### Candidate journey
```
Awareness           Consideration           Conversion              Retention
Google Jobs/SEO  →  Job Detail (full,     → Apply: name, email,   → Dashboard: application
Blog/social         honest, salary shown)   phone, resume, note     status, saved jobs,
                    Related jobs                                    interview schedule,
                    Company/role clarity    OR Upload Resume        profile completion meter
                                            (general pool)
```
**Friction removals:** jobs fully browsable without login; apply creates the account (email verification after, not before); resume drag-and-drop; autofill from resume filename where possible.

### Micro-conversions (measured)
Newsletter signup · job save · job share · FAQ expand · blog read-through · WhatsApp click · phone click.

## 5. Conversion & Trust Strategy

- **Above the fold, always:** one primary CTA + one secondary CTA, phone number in header.
- **Trust bar** under hero: years in business, candidates placed, client companies, avg. time-to-shortlist — animated counters, sourced from CMS.
- **Social proof cadence:** logos → stats → testimonials → success stories → Google review rating, spread through every landing page, never all clustered.
- **Certifications/awards** in footer + About; media mentions strip on Home.
- **Sticky mobile CTA bar** on Jobs and Employer pages (Apply / Request Talent).
- **Response SLA promises** stated next to every form ("We respond within 1 business day").

## 6. Success Metrics (v1 targets)

| Metric | Target |
|---|---|
| Employer lead conversion (visit → Request Talent) | ≥ 2.5% |
| Candidate apply conversion (job detail → apply) | ≥ 12% |
| Lighthouse (mobile, all core pages) | ≥ 95 all categories |
| LCP / INP / CLS | ≤ 1.8s / ≤ 200ms / ≤ 0.05 |
| Google Jobs indexing | 100% of published jobs |
| WCAG | AA, zero critical axe violations |

## 7. Scope of v1 vs later

**v1 (this build):** full public site (all pages in IA), jobs engine with search/filter/apply, three dashboards (admin full-featured; candidate + employer core features), auth, blog/CMS via admin, SEO/schema complete, dark mode.
**v1.1+ (documented in scalability plan):** payments/invoicing automation, resume parsing AI, email drip campaigns, multi-language, mobile app.
