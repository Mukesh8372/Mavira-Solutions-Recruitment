<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Mavira Solutions website — agent rules

Read `CONTEXT.md` first. It describes the system, the routes, the data flow and the known issues.
This file holds the rules for changing the code.

## Before you change anything

- This is a brochure site with an admin CMS. It is not a job portal. Do not add job, candidate or employer features unless the user asks.
- `.env` points at a live Neon Postgres database. Treat it as production unless the user says otherwise.
- **Never run `npx prisma db seed` without asking.** The seed deletes every row in every table.
- Never run `prisma migrate dev`, `prisma migrate reset`, `prisma db push` or SQL that writes, unless the user asks. The migration history is broken (CONTEXT.md §10, issue 1).
- Do not merge the `production-readiness` branch. It belongs to the old job portal.

## Next.js 16 rules

- `params` and `searchParams` are Promises. Write `const { slug } = await props.params`.
- The route guard file is `src/proxy.ts` with an exported `proxy` function. `middleware.ts` is deprecated. Do not create it.
- `next lint` does not exist. Use `npx eslint src`.
- Do not turn on `cacheComponents` or `"use cache"`. The app uses standard static rendering plus `revalidatePath`.
- `revalidatePath` refreshes only the path you name. A dynamic pattern needs the type argument: `revalidatePath("/blog/[slug]", "page")`.

## Code conventions

- Server components by default. Add `"use client"` only to interactive leaf components.
- Put feature code in `src/features/<feature>/`: `actions.ts` (`"use server"`), `queries.ts` (`import "server-only"`), and client form components.
- Every server action must:
  1. Call `requireRole([...])` from `@/lib/auth` when it is not a public action.
  2. Validate input with zod and return `{ ok: false, error }` with the first issue message.
  3. Write an `AuditLog` row for admin mutations (use the local `audit()` helper).
  4. Call `revalidatePath` for **every** public page that reads the changed table. Use the route table in CONTEXT.md §5 to find them.
  5. Return `{ ok: true, message? } | { ok: false, error }`.
- Public form actions also need the honeypot field `website: z.string().max(0).optional()` and `rateLimit(await clientKey("<scope>"), { limit, windowMs })`.
- `Json` columns hold JSON strings. Write `JSON.stringify(value)`. Read with `jsonArray()` or `jsonValue()` from `@/lib/utils`. Never cast the raw value.
- Admin-editable content blocks go in the `Setting` table. Add a zod schema and a key in `src/features/site-content/schemas.ts`, a code default and getter in `queries.ts`, and a save action in `actions.ts`. The getter must fall back to the default.
- Every public page exports `metadata` or `generateMetadata` with `title`, `description` and `alternates.canonical`.
- Pages below the top level render `<Breadcrumb items={...} />` and `<JsonLd data={breadcrumbJsonLd(items)} />`.
- New public routes go in `src/app/sitemap.ts`. Admin and auth routes go in the `disallow` list in `src/app/robots.ts`.
- Use the design tokens in `src/app/globals.css`: `bg-background`, `bg-background-alt`, `bg-surface`, `text-foreground`, `text-body`, `text-faint`, `border-line`, `primary`, `secondary`, `accent`, `rounded-btn`, `rounded-card`, `shadow-soft`, `shadow-card`. Do not add raw hex colors in components.
- Use `BrandIcon` from `@/components/shared/brand-icons` for social logos. `lucide-react` has none.
- Brand and legal facts come from `src/config/site.ts` or the contact setting. Do not hard-code them in pages.
- Do not add npm packages without a clear need. Several unused packages are already installed (CONTEXT.md §2).

## Content rules

- Do not publish invented testimonials, ratings, client names, placement counts or certifications. Seeded samples stay unapproved or in draft.
- Copy is India-specific: salaries in LPA, INR, Indian cities.

## Verification before you finish

Run all three and report the result:

```bash
npx tsc --noEmit
npx eslint src --max-warnings 0
npm run build
```

`npm run build` reads the database in `DATABASE_URL` to prerender static pages. It does not write.

## Keep the docs current

When a change makes a statement in `CONTEXT.md` wrong, update `CONTEXT.md` in the same change. This includes routes, tables, environment variables, known issues and legacy code. Fixing a known issue means removing it from CONTEXT.md §10.
