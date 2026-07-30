# 03 — Low-Fidelity Wireframes

**Deliverable 5.** Lo-fi structure for the highest-value templates. Desktop shown; mobile = single column, same order, filters/nav in sheets, sticky CTA bar. All remaining pages compose from these same section patterns.

---

## Home

```
┌────────────────────────────────────────────────────────────────────┐
│ ◆ Logo   Services▾ Industries▾ Jobs Employers Candidates About▾   │ ← sticky, glass on scroll
│                       Blog Contact      ☏ 98xxx  [Upload][Request]│
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌───────────────────────────┐  │
│  │ eyebrow: 15+ years · badge   │  │      hero illustration    │  │
│  │ H1: The right people,        │  │   (layered cards: job     │  │
│  │     faster.                  │  │    card, candidate card,  │  │
│  │ sub: 2 lines, plain-spoken   │  │    "Placed ✓" chip —      │  │
│  │ [Request Talent] [Browse →]  │  │    subtle float animation)│  │
│  │ ✓ free consult ✓ 24h reply   │  └───────────────────────────┘  │
│  └──────────────────────────────┘                                 │
├────────────────────────────────────────────────────────────────────┤
│         trusted by · ◻ ◻ ◻ ◻ ◻ ◻ ◻  (logo marquee, grayscale)     │
├────────────────────────────────────────────────────────────────────┤
│   12,000+          500+           15+           4.9★               │
│   candidates       client         years         Google             │ ← counters animate in
│   placed           companies      experience    rating             │
├────────────────────────────────────────────────────────────────────┤
│ H2: Recruitment services                                           │
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                            │
│ │ icon  │ │       │ │       │ │       │   (7 cards, 4+3 grid,     │
│ │ title │ │       │ │       │ │       │    hover lift + arrow)    │
│ │ 2-line│ │       │ │       │ │       │                            │
│ └───────┘ └───────┘ └───────┘ └───────┘                            │
├────────────────────────────────────────────────────────────────────┤
│ H2: Industries we serve     [IT][BFSI][Health][Mfg][Retail]...     │
├────────────────────────────────────────────────────────────────────┤
│ H2: How it works      ①──────②──────③──────④  (timeline, scroll   │
│                       brief  source shortlist place    reveal)     │
├────────────────────────────────────────────────────────────────────┤
│ H2: Featured openings                              [View all →]    │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐                       │
│ │ JobCard    │ │            │ │            │  ×6 (3×2)             │
│ └────────────┘ └────────────┘ └────────────┘                       │
├────────────────────────────────────────────────────────────────────┤
│ Why choose us: split — left sticky H2+copy, right 4 feature rows   │
├────────────────────────────────────────────────────────────────────┤
│ Testimonials: large quote card carousel, avatar, role, company     │
├────────────────────────────────────────────────────────────────────┤
│ Awards/certs strip · media logos                                   │
├────────────────────────────────────────────────────────────────────┤
│ Latest insights: 3 blog cards                                      │
├────────────────────────────────────────────────────────────────────┤
│ FAQ: accordion ×6                    [All FAQs →]                  │
├────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │  gradient CTA band: "Hiring?" [Request Talent]               │   │
│ │                     "Looking?" [Browse Jobs]                 │   │
│ └──────────────────────────────────────────────────────────────┘   │
│ FOOTER: newsletter / 4 link cols / certs / social / legal          │
└────────────────────────────────────────────────────────────────────┘
```

## Jobs — listing

```
┌ Breadcrumb: Home / Jobs ───────────────────────────────────────────┐
│ H1: Current openings (128)                                         │
│ ┌[🔍 keyword________][📍 location______][ Search ]┐                │
├──────────────┬─────────────────────────────────────────────────────┤
│ FILTERS      │  sort: [Newest ▾]        active chips: [React ×]    │
│ Department ▾ │  ┌───────────────────────────────────────────┐      │
│ Experience ▾ │  │ JobCard: title            [♡ save][↗ share]│     │
│ Salary ─○──  │  │ company · 📍 loc · ₹ range                 │     │
│ Type    ☐☐☐  │  │ [Full-time][Hybrid][3-5y]      Apply →     │     │
│ Mode    ☐☐☐  │  └───────────────────────────────────────────┘      │
│ Posted  ◉◉   │  ... ×10                                            │
│ [Clear all]  │  ◀ 1 2 3 … 13 ▶                                     │
└──────────────┴─────────────────────────────────────────────────────┘
  mobile: [Filters (3)] button → bottom sheet; sticky bottom bar
```

## Job Detail

```
┌ Breadcrumb ┐                                    ┌ STICKY ASIDE ┐
│ H1 role title                                   │ ₹ salary     │
│ company · 📍 location                           │ exp · type   │
│ [Full-time][Hybrid][3-5y][Urgent]               │ mode · dept  │
│ posted 2d ago · 47 applicants                   │ [Apply now]  │
├─────────────────────────────────────────────────│ [♡] [↗]      │
│ About the role (2 paras)                        │ ─────────    │
│ Responsibilities  • • • • •                     │ recruiter    │
│ Requirements      • • • • •                     │ contact card │
│ Skills: [React][TS][Node][AWS] chips            └──────────────┘
│ Benefits: ✓ ✓ ✓ ✓                                               
│ About company (collapsible)                                     
├─ APPLY (anchor) ────────────────────────────────────────────────┤
│ name / email / phone / resume dropzone / note   [Submit]        │
├─────────────────────────────────────────────────────────────────┤
│ Related jobs ×4                                                 │
└─────────────────────────────────────────────────────────────────┘
  mobile: aside collapses to sticky bottom bar [₹ range | Apply now]
```

## Employers hub

```
Hero (employer headline, [Request Talent] [Talk to us]) 
→ 3 pain-point cards → 7 service cards → 4-step process
→ stats band → featured case study (large split card)
→ client testimonials → REQUEST TALENT FORM (2-col: pitch | form:
  company, name, email, phone, roles needed, hiring type ▾, message)
→ employer FAQ → CTA band
```

## Candidates hub

```
Hero ([Browse Jobs] [Upload Resume]) → 5 service cards
→ RESUME DROPZONE band (drag & drop, "PDF/DOC up to 5MB")
→ latest jobs ×4 → "track your application" 3-step explainer
→ candidate testimonials → FAQ → CTA
```

## Contact

```
H1 + intro
┌ FORM ──────────────────┐ ┌ INFO ─────────────────┐
│ name / email / phone   │ │ 📍 address             │
│ I am: (Employer|Cand.) │ │ ☏ phone  💬 WhatsApp   │
│ message                │ │ ✉ email  🕘 hours      │
│ [Send message]         │ │ socials               │
│ "reply in 1 biz day"   │ │ ┌─ map (lazy) ─┐      │
└────────────────────────┘ └───────────────────────┘
```

## Dashboards (shared shell)

```
┌ sidebar ──────┬──────────────────────────────────────────────┐
│ ◆ logo        │ topbar: search ⌘K · notifications 🔔 · avatar │
│ nav items     ├──────────────────────────────────────────────┤
│ (role-based)  │ H1 + page actions                            │
│               │ stat cards ×4                                │
│ ─────         │ data table / kanban / forms                  │
│ settings      │ (TanStack table: sort, filter, paginate,     │
│ logout        │  row actions, bulk select, empty states)     │
└───────────────┴──────────────────────────────────────────────┘
Admin nav:    Overview · Jobs · Applications · Candidates · Employers ·
              Resumes · Interviews · Blog · Testimonials · Leads ·
              Contact queries · Newsletter · Media · SEO · Users & roles ·
              Reports · Audit log · Settings
Candidate nav: Overview · My applications · Saved jobs · Resume & docs ·
              Interviews · Profile (completion meter) · Notifications · Settings
Employer nav: Overview · Company profile · Post a job · My jobs ·
              Applications · Shortlist · Interviews · Reports · Invoices · Settings
```

## 404

```
Large "404" with gradient text · "This page moved on to a better opportunity."
[Go home] [Browse jobs] + mini job-search input + 4 popular links
```
