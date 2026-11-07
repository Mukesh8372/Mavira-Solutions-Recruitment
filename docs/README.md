# Planning documents (historical)

These documents were written before the build, for the original "TalentBridge" job portal. The site was later cut down to a brochure site with an admin CMS (commits `7e02aa6` and `ebbd83b`).

**Do not use these files as a description of the current code.** For the current system, read:

- [../CONTEXT.md](../CONTEXT.md): what the application is, routes, data model, known issues.
- [../AGENTS.md](../AGENTS.md): rules and conventions for changing the code.

| Doc | Still useful for | Out of date |
|---|---|---|
| [01-product-strategy.md](01-product-strategy.md) | Audience and tone | Candidate and job-seeker journeys |
| [02-information-architecture.md](02-information-architecture.md) | Page list for the brochure pages | Jobs, candidates, dashboards |
| [03-wireframes.md](03-wireframes.md) | Layout intent | Job and dashboard wireframes |
| [04-design-system.md](04-design-system.md) | Design intent | Colors: the real tokens are in `src/app/globals.css` |
| [05-technical-architecture.md](05-technical-architecture.md) | General approach | Stack versions, folder structure, API, schema |
| [06-quality-plan.md](06-quality-plan.md) | Checklists | Test and deploy tooling that does not exist in `main` |
| [07-deployment-guide.md](07-deployment-guide.md) | Vercel, Neon and GoDaddy DNS steps | Step 0, demo users, jobs, email, Blob, cron (see the note at the top of the file) |
| [design-preview.html](design-preview.html) | Visual direction | — |
| [conventions.md](conventions.md) | — | Replaced by `AGENTS.md` |
