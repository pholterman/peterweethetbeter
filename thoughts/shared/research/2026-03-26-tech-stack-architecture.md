---
date: 2026-03-26T15:00:00+01:00
researcher: full-stack-dev-2
git_commit: no-commits-yet
branch: main
repository: peterweethetbeter
topic: "Tech stack and architecture for peterweethetbeter.nl"
tags: [research, codebase, next.js, vercel, database, architecture]
status: complete
last_updated: 2026-03-26
last_updated_by: full-stack-dev-1
last_updated_note: "Merged additional research findings on Neon free tier specifics, TransIP DNS details, and security considerations"
---

# Research: Tech Stack and Architecture for peterweethetbeter.nl

**Date**: 2026-03-26T15:00:00+01:00
**Researcher**: full-stack-dev-2
**Git Commit**: no-commits-yet
**Branch**: main
**Repository**: peterweethetbeter

## Research Question

What is the best tech stack and architecture for building "Peter weet het beter" — a daily voting/opinion website hosted on Vercel, built for a Python-only developer, with extensibility for future categories?

## Summary

**Recommended stack:**
- **Framework**: Next.js (App Router) with TypeScript — Vercel's first-class citizen, best DX, and simplest deployment
- **Styling**: Tailwind CSS — zero-config with Next.js, utility-first, fast iteration
- **Database**: Vercel Postgres (powered by Neon) — free tier is generous, integrates natively, no extra accounts needed
- **Admin**: Simple password-protected `/admin` route using Next.js Server Actions — no separate backend needed
- **Deployment**: `git push` to main triggers auto-deploy on Vercel
- **Domain**: Point TransIP nameservers to Vercel nameservers, or add A/CNAME records

This stack requires learning some JavaScript/TypeScript, but Next.js with AI-assisted development (Claude Code) makes this very manageable for a Python developer. The alternative of using a Python backend (Flask/FastAPI) adds unnecessary complexity for this use case.

## Detailed Findings

### 1. Framework Choice: Next.js App Router

**Why Next.js over alternatives:**
- Vercel is the company behind Next.js — it gets first-class support, zero-config deployment, and automatic optimizations
- The App Router (stable since Next.js 13.4) provides React Server Components, Server Actions, and built-in API routes — everything needed without a separate backend
- Alternatives like SvelteKit or Remix work on Vercel but lack the native integration depth
- A Python backend (Flask/FastAPI) would require Vercel's serverless functions which add complexity and cold-start latency

**Why this works for a Python developer:**
- Vercel provides a [Next.js Flask Starter](https://vercel.com/templates/next.js/nextjs-flask-starter) template, but for this simple project, pure Next.js is simpler than maintaining two runtimes
- Next.js Server Actions feel similar to Python function calls — you write a function, it runs on the server
- With Claude Code assisting development, the JS/TS learning curve is minimal
- The [official Next.js tutorial](https://nextjs.org/learn) is excellent for beginners

**App Router structure for this project:**
```
app/
  page.tsx              # Homepage: today's question + vote buttons
  layout.tsx            # Shared layout (header, footer)
  admin/
    page.tsx            # Admin: submit daily "best" choices
  api/
    vote/route.ts       # API: record votes (optional, can use Server Actions)
  globals.css           # Tailwind imports
```

### 2. Data Storage: Vercel Postgres (Neon)

**Recommendation: Vercel Postgres via Neon integration**

**Why Vercel Postgres:**
- Provisioned directly from Vercel dashboard — no separate account needed
- Free tier (Neon Free Plan) includes:
  - 100 compute-unit hours/month (doubled from 50 in October 2025; enough to run a 0.25 CU instance for ~400 hours/month — way more than needed)
  - 3 GiB storage per branch (this app will use < 1 MB for years)
  - Point-in-time restore (6 hours history, capped at 1 GB of changes)
  - Scale to zero after 5 min idle (zero cost when not in use)
  - Neon Auth included for up to 60,000 MAU
  - No credit card required
- Native `@vercel/postgres` SDK for easy querying
- Serverless-friendly: auto-scales, no connection management needed

**Alternatives considered:**
- **Vercel KV (Upstash Redis)**: Too simple for relational data (categories, votes, daily topics)
- **Supabase**: Excellent but overkill — adds another platform to manage, and the built-in auth/storage isn't needed
- **JSON file / Vercel Blob**: No querying capability, would become painful as categories grow
- **SQLite / Turso**: Viable but less integrated with Vercel than Neon

**Proposed database schema:**
```sql
-- Categories of things Peter knows better about
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,      -- e.g., 'koffiemachine'
  name VARCHAR(100) NOT NULL,            -- e.g., 'Koffiemachine'
  description TEXT,                       -- e.g., 'Welke koffiemachine is de beste?'
  option_left VARCHAR(100) NOT NULL,     -- e.g., 'Links'
  option_right VARCHAR(100) NOT NULL,    -- e.g., 'Rechts'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Peter's daily verdicts
CREATE TABLE daily_verdicts (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  date DATE NOT NULL,
  verdict VARCHAR(10) NOT NULL,          -- 'left' or 'right'
  reason TEXT,                            -- Optional: why Peter chose this
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(category_id, date)              -- One verdict per category per day
);

-- Optional: track visitor votes (for fun comparison)
CREATE TABLE visitor_votes (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  date DATE NOT NULL,
  vote VARCHAR(10) NOT NULL,             -- 'left' or 'right'
  voter_hash VARCHAR(64),                -- Hashed IP for duplicate prevention
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Why this schema is extensible:**
- Adding a new category (e.g., "Beste lunch spot") is just an INSERT into `categories`
- Each category has its own left/right options
- Daily verdicts are per-category, so multiple categories can run simultaneously
- Visitor votes are optional but fun ("67% of visitors agree with Peter!")

### 3. Admin Interface

**Recommendation: Password-protected `/admin` route with Server Actions**

**Why this approach:**
- No separate admin framework needed
- Next.js middleware can protect the `/admin` route with a simple password check
- Server Actions handle form submissions server-side — no API routes to build
- Peter fills in a form, clicks submit, done

**Implementation approach:**
```
app/
  admin/
    page.tsx            # Form: select category, pick today's winner, optional reason
    actions.ts          # Server Actions: save verdict to database
  middleware.ts         # Password protection for /admin routes
```

**Authentication**: Simple environment variable password (`ADMIN_PASSWORD`) checked via middleware or basic auth. No need for a full auth system — this is a single-user admin.

**Alternatives considered:**
- **Separate admin app**: Overkill for one user
- **CMS (Sanity, Contentful)**: Adds external dependency for a simple daily choice
- **Direct database edits**: Not user-friendly enough

### 4. Extensibility for Future Categories

The proposed architecture handles extensibility through the database schema:

1. **Adding a new category**: Admin page has "Add Category" form -> inserts into `categories` table
2. **Homepage dynamically renders all active categories**: No code changes needed for new categories
3. **Each category is independent**: Own verdicts, own visitor votes, own display

**URL structure for extensibility:**
```
peterweethetbeter.nl/                    # Homepage: all active categories
peterweethetbeter.nl/koffiemachine       # Dedicated page for coffee machine category
peterweethetbeter.nl/[slug]              # Dynamic route for any category
peterweethetbeter.nl/admin               # Admin panel
```

### 5. Deployment Flow

**Simplest path for someone new to web dev:**

1. **Initial setup** (one-time):
   - Create Vercel project linked to this GitHub repo
   - Provision Vercel Postgres from Vercel dashboard (one click)
   - Run database migrations (schema setup)
   - Set `ADMIN_PASSWORD` environment variable in Vercel dashboard

2. **Daily workflow for Peter:**
   - Go to `peterweethetbeter.nl/admin`
   - Enter password
   - Select category, pick today's winner, optionally add a reason
   - Click submit — done

3. **Code changes:**
   - Edit code locally or via GitHub
   - `git push` to main -> Vercel auto-deploys in ~30 seconds
   - Preview deployments for branches (automatic)

### 6. TransIP Domain to Vercel

**Two options:**

**Option A: Change nameservers (recommended)**
1. Log in to TransIP control panel
2. Go to Domain -> click on peterweethetbeter.nl
3. Scroll to "Advanced domain management" > "Nameservers"
4. Disable "TransIP settings" to enable advanced management
5. Replace TransIP nameservers with Vercel nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
6. In Vercel: add `peterweethetbeter.nl` as custom domain
7. Propagation takes 4-24 hours

**Option B: Add DNS records (keep TransIP nameservers)**
1. In TransIP DNS settings, add:
   - A record: `@` -> `76.76.21.21` (Vercel's IP)
   - CNAME record: `www` -> `cname.vercel-dns.com`
2. In Vercel: add `peterweethetbeter.nl` as custom domain
3. Vercel auto-provisions SSL certificate

Option A is cleaner (Vercel manages all DNS), Option B gives more control if other services use the domain.

**Important TransIP notes:**
- A record can be set for root domain (`@`) directly in TransIP control panel
- CNAME can only be set for subdomains (e.g., `www`), not for the root domain
- TransIP also supports ALIAS records as an alternative to A records for root domains
- When setting CNAME to an external domain, always add a trailing dot (e.g., `cname.vercel-dns.com.`)
- DNS changes at TransIP can take up to 24 hours for global propagation
- If CAA records exist on the domain, add `0 issue "letsencrypt.org"` to allow Vercel's SSL provisioning

## Architecture Insights

### Design Principles
- **Keep it simple**: One repo, one framework, one database, one deployment target
- **Server-first**: Use React Server Components and Server Actions to minimize client-side JavaScript
- **Database-driven extensibility**: New categories are data, not code changes
- **Progressive enhancement**: Site works without JavaScript for basic viewing

### Technology Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js App Router | Native Vercel support, all-in-one |
| Language | TypeScript | Better DX with autocomplete, catch errors early |
| Styling | Tailwind CSS | Fast iteration, no CSS files to manage |
| Database | Vercel Postgres (Neon) | Free, integrated, relational |
| ORM | Drizzle ORM or raw SQL | Drizzle is lightweight; raw SQL is simpler |
| Auth (admin) | Simple password via middleware | Single user, no need for auth framework |
| Deployment | Vercel (auto-deploy on push) | Zero-config for Next.js |

### Security Considerations
- Admin password stored as environment variable in Vercel (never committed to code)
- Use HTTP-only cookies for admin session (prevents XSS access to session)
- Rate limiting on vote API endpoint to prevent spam
- Voter IP hashing for basic duplicate vote prevention (no personal data stored)
- HTTPS automatic via Vercel + Let's Encrypt
- Input validation on all Server Actions (prevent SQL injection via parameterized queries)

### Potential Future Enhancements
- Visitor voting with results comparison ("X% agrees with Peter")
- Historical archive page ("What did Peter think last month?")
- RSS feed for daily verdicts
- Share buttons for social media
- Dark mode toggle
- Statistics/analytics page

## Open Questions

1. **ORM choice**: Should we use Drizzle ORM for type-safe queries, or keep it simpler with raw SQL via `@vercel/postgres`? Drizzle adds a dependency but provides better DX. For this simple schema, raw SQL with `@vercel/postgres` is probably sufficient.

2. **Visitor voting**: Should the MVP include visitor voting, or just Peter's daily verdicts? Including it from the start is low-effort and makes the site more engaging.

3. **Design**: Does Peter have a specific visual design in mind, or should we go with a clean, minimal default? Tailwind + shadcn/ui components could provide a polished look quickly.

4. **Multiple verdicts per day**: Can Peter change his mind during the day, or is the first verdict final? The schema supports updates via the UNIQUE constraint.

## Sources

- [Vercel Storage Overview](https://vercel.com/docs/storage)
- [Neon for Vercel Marketplace](https://vercel.com/marketplace/neon)
- [Neon Pricing (Free Tier Details)](https://neon.com/pricing)
- [Neon Vercel Postgres Transition Guide](https://neon.com/docs/guides/vercel-postgres-transition-guide)
- [Vercel Custom Domain Setup](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel A Record and CAA Configuration](https://vercel.com/kb/guide/a-record-and-caa-with-vercel)
- [TransIP: Setting an A Record](https://www.transip.eu/knowledgebase/405-setting-an-a-record)
- [TransIP: Setting a CNAME Record](https://www.transip.eu/knowledgebase/407-setting-a-cname-record)
- [TransIP: DNS and Nameservers Control Panel](https://www.transip.nl/knowledgebase/305-dns-nameservers-aanpassen-via-controlepaneel)
- [TransIP: Linking Domain to External Server](https://www.transip.eu/knowledgebase/25-linking-your-domain-external-server)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Password Protecting Routes in Next.js App Router](https://www.alexchantastic.com/password-protecting-next)
- [Vercel Roadmap Voting Starter Kit Template](https://vercel.com/templates/next.js/roadmap-voting-starter-kit)
- [Neon Free Tier Explained (DevRadar)](https://devradar.dev/guides/neon-database-on-vercel-free-tier-explained-cost-clarification)
