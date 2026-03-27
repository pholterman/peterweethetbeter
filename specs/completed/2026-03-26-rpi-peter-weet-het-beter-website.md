---
phase: 7 of 7
last_worked_on: 2026-03-26T17:00:00+01:00
workflow: RPI
version: v1.2.0
attribution: This document was created using the RPI-workflow made possible by Zonneplan (https://www.zonneplan.nl)
---

# "Peter weet het beter" Website Implementation Plan

## Overview

Build "Peter weet het beter" — a playful, eye-catching daily voting/opinion website where Peter publishes his daily verdicts across multiple categories and visitors can vote to agree or disagree. The design is bold and fun with Kelly Green (#4CBB17) as the dominant color. Built with Next.js App Router, Tailwind CSS, and Neon Postgres (`@neondatabase/serverless`). Deployed on Vercel with the domain peterweethetbeter.nl connected from TransIP.

## Current State Analysis

The repository is empty — no code exists yet. The research document at `thoughts/shared/research/2026-03-26-tech-stack-architecture.md` provides the complete technical foundation.

### Key Decisions (from research + task):

- **Framework**: Next.js App Router with TypeScript
- **Styling**: Tailwind CSS — playful, bold, eye-catching design with Kelly Green #4CBB17 as dominant color
- **Database**: Neon Postgres (free tier via Vercel Marketplace) — no credit card needed
- **ORM**: Raw SQL via `@neondatabase/serverless` (lightweight, serverless-native Neon driver)
- **Admin auth**: Simple password via environment variable + HTTP-only cookie
- **Visitor voting**: Included in MVP ("67% is het eens met Peter")
- **Verdicts**: Peter can change his verdict until midnight (UPSERT on category_id + date)
- **Domain**: peterweethetbeter.nl at TransIP, connect to Vercel via DNS records or nameservers
- **Deployment**: `git push` to main triggers auto-deploy
- **Design philosophy**: Playful & eye-catching (speels & opvallend) — bold typography, chunky rounded elements, bouncy animations, fun hover effects. NOT minimalistic
- **Primary color**: Kelly Green (#4CBB17) — dominant color for backgrounds, buttons, cards, headings, and interactive elements

## Desired End State

A live website at peterweethetbeter.nl where:
1. The homepage shows today's verdict for each active category with visitor voting
2. Each category has a dedicated page (`/[slug]`) showing today's verdict and history
3. Peter can log in at `/admin` with a password, submit/change daily verdicts, and manage categories
4. Visitors can vote once per category per day (duplicate prevention via IP hash)
5. Vote results display as percentages ("67% is het eens met Peter")

### How to verify:
- Visit peterweethetbeter.nl — homepage loads with active categories
- Click a category — dedicated page shows today's verdict
- Vote on a verdict — percentage updates, duplicate vote prevented
- Go to /admin — password prompt appears
- Log in, submit a verdict — it appears on the homepage
- Change a verdict — it updates (not duplicates)
- Add a new category via admin — it appears on homepage without code changes

## What We're NOT Doing

- No full authentication system (no user accounts, only admin password)
- No comments or social features
- No dark mode (future enhancement)
- No RSS feed (future enhancement)
- No analytics/statistics dashboard (future enhancement)
- No i18n — the site is Dutch-only
- No automated testing framework in MVP (manual verification, tests can be added later)
- No CI/CD pipeline beyond Vercel's auto-deploy

## Implementation Approach

Build incrementally in 7 phases, each producing a working increment:
1. Project scaffolding and configuration
2. Database schema and connection
3. Homepage with today's verdicts
4. Admin authentication and verdict management
5. Visitor voting system
6. Category pages (`/[slug]`)
7. Vercel deployment and domain connection

Each phase builds on the previous one. The site is deployable after Phase 3.

---

## Phase 1: Project Setup

### Overview

Scaffold the Next.js project with TypeScript and Tailwind CSS. Configure the project structure and basic layout.

### Changes Required:

#### 1. Initialize Next.js project

Run at project root:
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

This creates the standard Next.js App Router structure with TypeScript and Tailwind CSS pre-configured.

#### 2. Project structure

After initialization, the project will have:
```
src/
  app/
    layout.tsx          # Root layout
    page.tsx            # Homepage
    globals.css         # Tailwind imports
  lib/                  # Shared utilities (create manually)
public/                 # Static assets
tailwind.config.ts      # Tailwind configuration
tsconfig.json           # TypeScript configuration
next.config.ts          # Next.js configuration
package.json
```

Create the additional directories:
```bash
mkdir -p src/lib src/app/admin src/app/\[slug\]
```

#### 3. Configure Tailwind with Kelly Green `tailwind.config.ts`

Extend the default Tailwind config with a custom `kelly` color palette:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kelly: {
          50: "#f0fbe8",
          100: "#ddf6cc",
          200: "#bceda0",
          300: "#93df68",
          400: "#6ecf3a",
          500: "#4CBB17",  // Primary Kelly Green
          600: "#3b960f",
          700: "#2f7211",
          800: "#295a13",
          900: "#244c14",
          950: "#0f2a05",
        },
      },
      keyframes: {
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-green": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(76, 187, 23, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(76, 187, 23, 0)" },
        },
      },
      animation: {
        "bounce-in": "bounce-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-green": "pulse-green 2s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
```

#### 4. Update `src/app/layout.tsx`

Set up the root layout with Dutch language, bold playful typography, Kelly Green as dominant color, and a fun site-wide structure:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peter weet het beter",
  description: "Peter weet het altijd beter. Maar ben jij het met hem eens?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={`${inter.className} bg-kelly-50 text-gray-900 min-h-screen`}>
        <header className="bg-kelly-500 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-5">
            <a href="/" className="group flex items-center gap-3">
              <span className="text-4xl" role="img" aria-label="wijzend">&#9757;</span>
              <span className="text-3xl font-extrabold text-white group-hover:scale-105 transition-transform">
                Peter weet het beter
              </span>
            </a>
            <p className="text-kelly-100 text-sm mt-1 font-medium">
              Dagelijks een mening. Altijd gelijk. Toch?
            </p>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-kelly-500 mt-16">
          <div className="max-w-2xl mx-auto px-4 py-6 text-sm text-kelly-100 font-medium">
            &copy; {new Date().getFullYear()} Peter weet het beter &mdash; altijd gelijk, nooit bescheiden
          </div>
        </footer>
      </body>
    </html>
  );
}
```

#### 4. Update `src/app/page.tsx`

Placeholder homepage:

```tsx
export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-extrabold mb-4 text-kelly-600 animate-bounce-in">
        Peter weet het beter
      </h1>
      <p className="text-xl text-kelly-700 font-medium">
        Binnenkort: Peter deelt zijn dagelijkse mening.
      </p>
      <p className="text-6xl mt-6 animate-bounce-in">&#129300;</p>
    </div>
  );
}
```

#### 5. Update `src/app/globals.css`

Tailwind imports plus playful base styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run dev` starts without errors
- [x] `npm run build` completes successfully
- [x] `npm run lint` passes with no errors
- [x] Homepage loads at `http://localhost:3000`
- [x] Project structure matches the layout above: `ls src/app/ src/lib/`

#### Manual Verification:

- [x] Homepage displays "Peter weet het beter" heading with bounce animation and thinking emoji
- [x] Layout shows header with Kelly Green background, bold white text, and pointing finger emoji
- [x] Footer has Kelly Green background with playful tagline
- [x] Page background is kelly-50 (light green tint), NOT plain white
- [x] Header text scales on hover
- [x] Layout shows header, content area, and footer
- [x] Page is in Dutch (`<html lang="nl">`)

---

## Phase 2: Database Schema and Connection

### Overview

Set up Neon Postgres database connection via `@neondatabase/serverless` and the schema with three tables: categories, daily_verdicts, and visitor_votes. Create a migration script and database utility.

### Changes Required:

#### 1. Install dependencies

```bash
npm install @neondatabase/serverless
```

#### 2. Create database utility `src/lib/db.ts`

```typescript
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export { sql };
```

#### 3. Create migration script `src/lib/migrate.ts`

This script creates the tables if they don't exist:

```typescript
import { sql } from "@/lib/db";

export async function migrate() {
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      option_left VARCHAR(100) NOT NULL,
      option_right VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_verdicts (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      date DATE NOT NULL,
      verdict VARCHAR(10) NOT NULL CHECK (verdict IN ('left', 'right')),
      reason TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(category_id, date)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS visitor_votes (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      date DATE NOT NULL,
      vote VARCHAR(10) NOT NULL CHECK (vote IN ('left', 'right')),
      voter_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(category_id, date, voter_hash)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_visitor_votes_category_date
    ON visitor_votes(category_id, date)
  `;
}
```

#### 4. Create migration API route `src/app/api/migrate/route.ts`

A one-time endpoint to run migrations (protected by a secret):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { migrate } from "@/lib/migrate";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await migrate();
    return NextResponse.json({ success: true, message: "Migration completed" });
  } catch (error) {
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
```

#### 5. Create `.env.local.example`

Template for local development environment variables:

```
# Copy this to .env.local and fill in values
# Get the DATABASE_URL from Vercel Dashboard > Storage > your Neon database > Connection Details

DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Admin password for /admin route
ADMIN_PASSWORD=
```

#### 6. Add `.env.local` to `.gitignore`

Create/update `.gitignore` to include:

```
# dependencies
/node_modules

# next.js
/.next/
/out/

# environment variables
.env*.local

# vercel
.vercel

# misc
.DS_Store
*.pem
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully (schema file compiles)
- [x] `.env.local` is in `.gitignore`: `grep '.env' .gitignore`
- [x] Migration script exists: `ls src/lib/migrate.ts`
- [x] Database utility exists: `ls src/lib/db.ts`

#### Manual Verification:

- [x] After connecting to Neon database and running the migration endpoint, all three tables are created
- [x] Index `idx_visitor_votes_category_date` exists on visitor_votes(category_id, date)
- [x] Tables have correct columns and constraints (verify via Neon dashboard SQL console)

---

## Phase 3: Homepage — Today's Verdicts

### Overview

Build the homepage that displays today's verdict for each active category. This is the main public-facing page. Uses React Server Components for server-side data fetching.

### Changes Required:

#### 1. Create data fetching functions `src/lib/queries.ts`

```typescript
import { sql } from "@/lib/db";

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  option_left: string;
  option_right: string;
  is_active: boolean;
};

export type Verdict = {
  id: number;
  category_id: number;
  date: string;
  verdict: "left" | "right";
  reason: string | null;
};

export type VoteCounts = {
  left: number;
  right: number;
  total: number;
};

export async function getActiveCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT id, slug, name, description, option_left, option_right, is_active
    FROM categories
    WHERE is_active = true
    ORDER BY created_at ASC
  `;
  return rows as Category[];
}

export async function getTodayVerdicts(): Promise<Verdict[]> {
  const rows = await sql`
    SELECT id, category_id, date::text, verdict, reason
    FROM daily_verdicts
    WHERE date = CURRENT_DATE
  `;
  return rows as Verdict[];
}

export async function getVoteCounts(
  categoryId: number,
  date: string
): Promise<VoteCounts> {
  const rows = await sql`
    SELECT vote, COUNT(*)::text as count
    FROM visitor_votes
    WHERE category_id = ${categoryId} AND date = ${date}::date
    GROUP BY vote
  `;

  let left = 0;
  let right = 0;
  for (const row of rows) {
    if (row.vote === "left") left = parseInt(row.count);
    if (row.vote === "right") right = parseInt(row.count);
  }

  return { left, right, total: left + right };
}
```

#### 2. Create verdict card component `src/app/components/verdict-card.tsx`

```tsx
import Link from "next/link";
import { Category, Verdict, VoteCounts } from "@/lib/queries";
import { VoteButtons } from "./vote-buttons";

type Props = {
  category: Category;
  verdict: Verdict | null;
  voteCounts: VoteCounts;
};

export function VerdictCard({ category, verdict, voteCounts }: Props) {
  const winnerLabel =
    verdict?.verdict === "left"
      ? category.option_left
      : verdict?.verdict === "right"
      ? category.option_right
      : null;

  return (
    <div className="bg-white border-2 border-kelly-300 rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg hover:border-kelly-400 hover:-translate-y-1 transition-all duration-200 animate-slide-up">
      <Link href={`/${category.slug}`}>
        <h2 className="text-2xl font-extrabold mb-1 text-kelly-600 hover:text-kelly-500 transition-colors">
          {category.name}
        </h2>
      </Link>
      {category.description && (
        <p className="text-gray-500 text-sm mb-4">{category.description}</p>
      )}

      {verdict ? (
        <div>
          <p className="mb-2 text-lg">
            <span className="text-kelly-500 font-bold">&#9757; Peter kiest vandaag:</span>{" "}
            <span className="font-extrabold text-kelly-700 text-xl">{winnerLabel}</span>
          </p>
          {verdict.reason && (
            <p className="text-gray-600 text-sm italic mb-4 bg-kelly-50 rounded-xl px-4 py-2">
              &ldquo;{verdict.reason}&rdquo;
            </p>
          )}
          <VoteButtons
            categoryId={category.id}
            optionLeft={category.option_left}
            optionRight={category.option_right}
            voteCounts={voteCounts}
          />
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-4xl mb-2">&#129300;</p>
          <p className="text-gray-400 font-medium">
            Peter heeft zich nog niet uitgesproken vandaag.
          </p>
        </div>
      )}
    </div>
  );
}
```

#### 3. Update homepage `src/app/page.tsx`

```tsx
import { getActiveCategories, getTodayVerdicts, getVoteCounts } from "@/lib/queries";
import { VerdictCard } from "./components/verdict-card";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [categories, verdicts] = await Promise.all([
    getActiveCategories(),
    getTodayVerdicts(),
  ]);

  const voteCountsMap = new Map<number, { left: number; right: number; total: number }>();
  const today = new Date().toISOString().split("T")[0];

  await Promise.all(
    categories.map(async (cat) => {
      const counts = await getVoteCounts(cat.id, today);
      voteCountsMap.set(cat.id, counts);
    })
  );

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-2 text-kelly-600">Vandaag &#128227;</h1>
        <p className="text-xl text-kelly-700 font-medium">
          Peter weet het altijd beter. Maar ben jij het met hem eens?
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
          <p className="text-5xl mb-3">&#128566;</p>
          <p className="text-kelly-600 font-bold text-lg">Nog geen categorieën actief.</p>
          <p className="text-gray-400 text-sm mt-1">Peter is nog aan het nadenken...</p>
        </div>
      ) : (
        categories.map((category) => {
          const verdict = verdicts.find((v) => v.category_id === category.id) || null;
          const voteCounts = voteCountsMap.get(category.id) || {
            left: 0,
            right: 0,
            total: 0,
          };
          return (
            <VerdictCard
              key={category.id}
              category={category}
              verdict={verdict}
              voteCounts={voteCounts}
            />
          );
        })
      )}
    </div>
  );
}
```

#### 4. Create placeholder VoteButtons `src/app/components/vote-buttons.tsx`

This is a client component (uses interactivity). The actual voting logic is added in Phase 5, but we need the component to exist for Phase 3 to compile:

```tsx
"use client";

type Props = {
  categoryId: number;
  optionLeft: string;
  optionRight: string;
  voteCounts: { left: number; right: number; total: number };
};

export function VoteButtons({ optionLeft, optionRight, voteCounts }: Props) {
  const leftPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.left / voteCounts.total) * 100)
      : 0;
  const rightPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.right / voteCounts.total) * 100)
      : 0;

  return (
    <div className="mt-4">
      <p className="text-sm font-bold text-kelly-600 mb-2">Ben jij het eens met Peter?</p>
      <div className="flex gap-3">
        <button
          className="flex-1 bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
          disabled
        >
          {optionLeft}
          {voteCounts.total > 0 && (
            <span className="block text-sm font-extrabold mt-1">{leftPercent}%</span>
          )}
        </button>
        <button
          className="flex-1 bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
          disabled
        >
          {optionRight}
          {voteCounts.total > 0 && (
            <span className="block text-sm font-extrabold mt-1">{rightPercent}%</span>
          )}
        </button>
      </div>
      {voteCounts.total > 0 && (
        <p className="text-xs text-kelly-600 font-medium mt-2 text-center">
          &#128200; {voteCounts.total} stem{voteCounts.total !== 1 ? "men" : ""}
        </p>
      )}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully
- [x] `npm run lint` passes
- [x] Files exist: `ls src/lib/queries.ts src/app/components/verdict-card.tsx src/app/components/vote-buttons.tsx`

#### Manual Verification:

- [x] Homepage loads and shows "Nog geen categorieën actief." when database is empty
- [x] After inserting a test category and verdict via SQL, homepage displays the verdict card
- [x] Category name links to `/[slug]` page
- [x] Vote percentages display correctly when votes exist
- [x] Page revalidates within 60 seconds of data changes

---

## Phase 4: Admin Authentication and Verdict Management

### Overview

Build the password-protected admin area where Peter can log in, submit daily verdicts for each category, change existing verdicts, and manage categories (add/toggle active).

### Changes Required:

#### 1. Create admin session utilities `src/lib/auth.ts`

```typescript
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

export async function verifyPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function createSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === "authenticated";
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
```

#### 2. Create admin login page `src/app/admin/page.tsx`

```tsx
import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { AdminDashboard } from "./dashboard";

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
```

#### 3. Create login form component `src/app/admin/login-form.tsx`

```tsx
"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(login, null);

  return (
    <div className="max-w-sm mx-auto mt-16">
      <div className="text-center mb-6">
        <p className="text-5xl mb-3">&#128274;</p>
        <h1 className="text-3xl font-extrabold text-kelly-600">Admin Login</h1>
        <p className="text-gray-500 text-sm mt-1">Alleen voor Peter zelf!</p>
      </div>
      <form action={formAction} className="bg-white rounded-2xl border-2 border-kelly-200 p-6 shadow-md">
        <input
          type="password"
          name="password"
          placeholder="Wachtwoord"
          className="w-full border-2 border-kelly-200 rounded-xl px-4 py-3 mb-4 focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
          required
          autoFocus
        />
        {error && (
          <p className="text-red-500 text-sm mb-4 bg-red-50 rounded-lg px-3 py-2 font-medium">
            &#128683; {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-3 text-lg hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? "Bezig... &#9203;" : "Inloggen &#128073;"}
        </button>
      </form>
    </div>
  );
}
```

#### 4. Create admin server actions `src/app/admin/actions.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { verifyPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";

export async function login(
  _prevState: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get("password") as string;

  if (!await verifyPassword(password)) {
    return "Onjuist wachtwoord.";
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export async function submitVerdict(formData: FormData): Promise<void> {
  if (!await isAuthenticated()) {
    redirect("/admin");
  }

  const categoryId = parseInt(formData.get("category_id") as string);
  const verdict = formData.get("verdict") as string;
  const reason = (formData.get("reason") as string) || null;

  if (!categoryId || !["left", "right"].includes(verdict)) {
    return;
  }

  // UPSERT: insert or update if Peter changes his mind today
  await sql`
    INSERT INTO daily_verdicts (category_id, date, verdict, reason, updated_at)
    VALUES (${categoryId}, CURRENT_DATE, ${verdict}, ${reason}, NOW())
    ON CONFLICT (category_id, date)
    DO UPDATE SET verdict = ${verdict}, reason = ${reason}, updated_at = NOW()
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function addCategory(formData: FormData): Promise<void> {
  if (!await isAuthenticated()) {
    redirect("/admin");
  }

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const optionLeft = formData.get("option_left") as string;
  const optionRight = formData.get("option_right") as string;

  if (!name || !slug || !optionLeft || !optionRight) {
    return;
  }

  await sql`
    INSERT INTO categories (slug, name, description, option_left, option_right)
    VALUES (${slug}, ${name}, ${description}, ${optionLeft}, ${optionRight})
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleCategory(formData: FormData): Promise<void> {
  if (!await isAuthenticated()) {
    redirect("/admin");
  }

  const categoryId = parseInt(formData.get("category_id") as string);
  const isActive = formData.get("is_active") === "true";

  await sql`
    UPDATE categories SET is_active = ${!isActive} WHERE id = ${categoryId}
  `;

  revalidatePath("/");
  revalidatePath("/admin");
}
```

#### 5. Create admin dashboard `src/app/admin/dashboard.tsx`

```tsx
import { sql } from "@/lib/db";
import { Category, Verdict } from "@/lib/queries";
import { logout, submitVerdict, addCategory, toggleCategory } from "./actions";

export async function AdminDashboard() {
  const categories = await sql`
    SELECT id, slug, name, description, option_left, option_right, is_active
    FROM categories ORDER BY created_at ASC
  ` as Category[];

  const todayVerdicts = await sql`
    SELECT category_id, verdict, reason
    FROM daily_verdicts WHERE date = CURRENT_DATE
  ` as Verdict[];

  const verdictMap = new Map(
    todayVerdicts.map((v) => [v.category_id, v])
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-kelly-600">&#128736; Admin</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-kelly-600 bg-kelly-100 rounded-lg px-3 py-1.5 hover:bg-kelly-200 transition-colors"
          >
            Uitloggen
          </button>
        </form>
      </div>

      {/* Submit verdicts */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#128227; Dagelijks oordeel</h2>
        {categories.filter((c: Category) => c.is_active).length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-4xl mb-2">&#128566;</p>
            <p className="text-kelly-600 font-bold">Geen actieve categorieën. Voeg er een toe!</p>
          </div>
        ) : (
          categories
            .filter((c: Category) => c.is_active)
            .map((cat: Category) => {
              const existing = verdictMap.get(cat.id);
              return (
                <div key={cat.id} className="bg-white border-2 border-kelly-200 rounded-2xl p-5 mb-4 shadow-sm">
                  <h3 className="font-extrabold text-lg text-kelly-700 mb-2">{cat.name}</h3>
                  {existing && (
                    <p className="text-sm text-gray-500 mb-2">
                      Huidige keuze: <strong>{existing.verdict === "left" ? cat.option_left : cat.option_right}</strong>
                      {existing.reason && <span> — &ldquo;{existing.reason}&rdquo;</span>}
                    </p>
                  )}
                  <form action={submitVerdict} className="flex flex-col gap-2">
                    <input type="hidden" name="category_id" value={cat.id} />
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="verdict"
                          value="left"
                          defaultChecked={existing?.verdict === "left"}
                          required
                        />
                        {cat.option_left}
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="verdict"
                          value="right"
                          defaultChecked={existing?.verdict === "right"}
                        />
                        {cat.option_right}
                      </label>
                    </div>
                    <input
                      type="text"
                      name="reason"
                      placeholder="Waarom? (optioneel)"
                      defaultValue={existing?.reason || ""}
                      className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
                    />
                    <button
                      type="submit"
                      className="self-start bg-kelly-500 text-white font-bold text-sm rounded-xl px-5 py-2 hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
                    >
                      {existing ? "Wijzigen &#9999;" : "Opslaan &#128190;"}
                  </form>
                </div>
              );
            })
        )}
      </section>

      {/* Add category */}
      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#10133; Nieuwe categorie</h2>
        <form action={addCategory} className="bg-white border-2 border-kelly-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm">
          <input
            type="text"
            name="name"
            placeholder="Naam (bijv. Koffiemachine)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
            required
          />
          <input
            type="text"
            name="slug"
            placeholder="Slug (bijv. koffiemachine)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
            required
            pattern="[a-z0-9\-]+"
            title="Alleen kleine letters, cijfers en streepjes"
          />
          <input
            type="text"
            name="description"
            placeholder="Beschrijving (optioneel)"
            className="border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="option_left"
              placeholder="Optie links"
              className="flex-1 border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
              required
            />
            <input
              type="text"
              name="option_right"
              placeholder="Optie rechts"
              className="flex-1 border-2 border-kelly-200 rounded-xl px-3 py-2 text-sm focus:border-kelly-500 focus:outline-none focus:ring-2 focus:ring-kelly-200 transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="self-start bg-kelly-500 text-white font-bold text-sm rounded-xl px-5 py-2 hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md"
          >
            Categorie toevoegen &#128640;
          </button>
        </form>
      </section>

      {/* Manage categories */}
      <section>
        <h2 className="text-xl font-extrabold text-kelly-700 mb-4">&#128221; Categorieën beheren</h2>
        {categories.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-2xl border-2 border-dashed border-kelly-300">
            <p className="text-gray-400 font-medium">Nog geen categorieën.</p>
          </div>
        ) : (
          categories.map((cat: Category) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white border-2 border-kelly-200 rounded-2xl p-4 mb-2 shadow-sm"
            >
              <div>
                <span className={cat.is_active ? "font-bold text-kelly-700" : "text-gray-400 line-through"}>
                  {cat.name}
                </span>
                <span className="text-xs text-kelly-400 ml-2 font-medium">/{cat.slug}</span>
              </div>
              <form action={toggleCategory}>
                <input type="hidden" name="category_id" value={cat.id} />
                <input type="hidden" name="is_active" value={String(cat.is_active)} />
                <button
                  type="submit"
                  className={`text-xs font-bold rounded-lg px-3 py-1.5 transition-all ${
                    cat.is_active
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-kelly-600 bg-kelly-100 hover:bg-kelly-200"
                  }`}
                >
                  {cat.is_active ? "Deactiveren" : "Activeren"}
                </button>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully
- [x] `npm run lint` passes
- [x] Files exist: `ls src/lib/auth.ts src/app/admin/page.tsx src/app/admin/actions.ts src/app/admin/login-form.tsx src/app/admin/dashboard.tsx`

#### Manual Verification:

- [x] Visiting `/admin` shows login form
- [x] Wrong password shows "Onjuist wachtwoord." error
- [x] Correct password logs in and shows admin dashboard
- [x] Can add a new category via the form
- [x] Can submit a verdict for a category
- [x] Can change an existing verdict (UPSERT works)
- [x] Can toggle category active/inactive
- [x] Logout button works
- [x] Session persists across page refreshes (cookie-based)
- [x] Verdicts submitted in admin appear on homepage

---

## Phase 5: Visitor Voting System

### Overview

Enable visitors to vote on Peter's daily verdicts. Each visitor can vote once per category per day (enforced via hashed IP). Results show as percentages.

### Changes Required:

#### 1. Create vote server action `src/app/actions/vote.ts`

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function castVote(formData: FormData): Promise<{ error?: string }> {
  const categoryId = parseInt(formData.get("category_id") as string);
  const vote = formData.get("vote") as string;

  if (!categoryId || !["left", "right"].includes(vote)) {
    return { error: "Ongeldige stem." };
  }

  // Hash the IP for duplicate prevention
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const voterHash = crypto.createHash("sha256").update(ip + categoryId).digest("hex");

  try {
    await sql`
      INSERT INTO visitor_votes (category_id, date, vote, voter_hash)
      VALUES (${categoryId}, CURRENT_DATE, ${vote}, ${voterHash})
      ON CONFLICT (category_id, date, voter_hash) DO NOTHING
    `;
  } catch {
    return { error: "Kon stem niet opslaan." };
  }

  revalidatePath("/");
  return {};
}
```

#### 2. Update VoteButtons component `src/app/components/vote-buttons.tsx`

Replace the placeholder with the interactive voting component:

```tsx
"use client";

import { useActionState } from "react";
import { castVote } from "@/app/actions/vote";

type Props = {
  categoryId: number;
  optionLeft: string;
  optionRight: string;
  voteCounts: { left: number; right: number; total: number };
};

export function VoteButtons({ categoryId, optionLeft, optionRight, voteCounts }: Props) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string }, formData: FormData) => {
      return await castVote(formData);
    },
    {}
  );

  const leftPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.left / voteCounts.total) * 100)
      : 0;
  const rightPercent =
    voteCounts.total > 0
      ? Math.round((voteCounts.right / voteCounts.total) * 100)
      : 0;

  return (
    <div className="mt-4">
      <p className="text-sm font-bold text-kelly-600 mb-2">Ben jij het eens met Peter?</p>
      <div className="flex gap-3">
        <form action={formAction} className="flex-1">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="vote" value="left" />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100 animate-pulse-green"
          >
            {optionLeft}
            {voteCounts.total > 0 && (
              <span className="block text-sm font-extrabold mt-1">{leftPercent}%</span>
            )}
          </button>
        </form>
        <form action={formAction} className="flex-1">
          <input type="hidden" name="category_id" value={categoryId} />
          <input type="hidden" name="vote" value="right" />
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-kelly-500 text-white font-bold rounded-xl px-4 py-4 text-base hover:bg-kelly-400 hover:scale-105 active:scale-95 transition-all duration-150 shadow-md disabled:opacity-50 disabled:hover:scale-100 animate-pulse-green"
          >
            {optionRight}
            {voteCounts.total > 0 && (
              <span className="block text-sm font-extrabold mt-1">{rightPercent}%</span>
            )}
          </button>
        </form>
      </div>
      {state.error && (
        <p className="text-red-500 text-xs mt-2 bg-red-50 rounded-lg px-3 py-2 font-medium">
          &#128683; {state.error}
        </p>
      )}
      {voteCounts.total > 0 && (
        <p className="text-xs text-kelly-600 font-medium mt-2 text-center">
          &#128200; {voteCounts.total} stem{voteCounts.total !== 1 ? "men" : ""}
        </p>
      )}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully
- [x] `npm run lint` passes
- [x] Vote action file exists: `ls src/app/actions/vote.ts`

#### Manual Verification:

- [x] Clicking a vote button records the vote
- [x] Percentages update after voting
- [x] Voting again from the same IP does not create a duplicate (ON CONFLICT DO NOTHING)
- [x] Total vote count displays correctly
- [x] "Ben jij het eens met Peter?" text appears above vote buttons
- [x] Buttons show loading state while vote is being submitted

---

## Phase 6: Dynamic Category Pages

### Overview

Create individual category pages at `/[slug]` that show today's verdict with voting, plus a history of past verdicts.

### Changes Required:

#### 1. Add history query to `src/lib/queries.ts`

Append to the existing file:

```typescript
export type VerdictWithCategory = Verdict & {
  option_left: string;
  option_right: string;
  category_name: string;
};

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await sql`
    SELECT id, slug, name, description, option_left, option_right, is_active
    FROM categories WHERE slug = ${slug}
  `;
  return (rows[0] as Category) || null;
}

export async function getVerdictHistory(
  categoryId: number,
  limit: number = 30
): Promise<Verdict[]> {
  const rows = await sql`
    SELECT id, category_id, date::text, verdict, reason
    FROM daily_verdicts
    WHERE category_id = ${categoryId}
    ORDER BY date DESC
    LIMIT ${limit}
  `;
  return rows as Verdict[];
}
```

#### 2. Create category page `src/app/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  getVoteCounts,
  getVerdictHistory,
} from "@/lib/queries";
import { VoteButtons } from "../components/vote-buttons";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Peter weet het beter`,
    description: category.description || `Peter's mening over ${category.name}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const history = await getVerdictHistory(category.id);
  const today = new Date().toISOString().split("T")[0];
  const todayVerdict = history.find((v) => v.date === today) || null;
  const pastVerdicts = history.filter((v) => v.date !== today);
  const voteCounts = await getVoteCounts(category.id, today);

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-1 text-kelly-600 animate-bounce-in">{category.name}</h1>
      {category.description && (
        <p className="text-lg text-kelly-700 font-medium mb-6">{category.description}</p>
      )}

      {/* Today's verdict */}
      <section className="bg-white border-2 border-kelly-300 rounded-2xl p-6 mb-8 shadow-md">
        <h2 className="text-sm font-extrabold text-kelly-500 uppercase tracking-wide mb-2">&#128197; Vandaag</h2>
        {todayVerdict ? (
          <div>
            <p className="text-xl mb-1">
              <span className="text-kelly-500 font-bold">&#9757; Peter kiest:</span>{" "}
              <span className="font-extrabold text-kelly-700 text-2xl">
                {todayVerdict.verdict === "left"
                  ? category.option_left
                  : category.option_right}
              </span>
            </p>
            {todayVerdict.reason && (
              <p className="text-gray-600 text-sm italic mb-4 bg-kelly-50 rounded-xl px-4 py-2">
                &ldquo;{todayVerdict.reason}&rdquo;
              </p>
            )}
            <VoteButtons
              categoryId={category.id}
              optionLeft={category.option_left}
              optionRight={category.option_right}
              voteCounts={voteCounts}
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-4xl mb-2">&#129300;</p>
            <p className="text-gray-400 font-medium">
              Peter heeft zich nog niet uitgesproken vandaag.
            </p>
          </div>
        )}
      </section>

      {/* History */}
      {pastVerdicts.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold mb-4 text-kelly-700">&#128218; Geschiedenis</h2>
          <div className="space-y-3">
            {pastVerdicts.map((v) => (
              <div
                key={v.id}
                className="bg-white border-2 border-kelly-100 rounded-2xl p-4 text-sm hover:border-kelly-300 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">
                    {new Date(v.date).toLocaleDateString("nl-NL", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-extrabold text-kelly-600 bg-kelly-100 rounded-lg px-3 py-1">
                    {v.verdict === "left"
                      ? category.option_left
                      : category.option_right}
                  </span>
                </div>
                {v.reason && (
                  <p className="text-gray-500 italic mt-2 bg-kelly-50 rounded-lg px-3 py-1.5">
                    &ldquo;{v.reason}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully
- [x] `npm run lint` passes
- [x] Category page file exists: `ls src/app/\[slug\]/page.tsx`

#### Manual Verification:

- [x] Visiting `/koffiemachine` (or any valid slug) shows the category page
- [x] Visiting a non-existent slug returns 404
- [x] Today's verdict displays with voting buttons
- [x] History section shows past verdicts in reverse chronological order
- [x] Dates are formatted in Dutch (e.g., "woensdag 26 maart 2026")
- [x] Page metadata (title, description) is correct
- [x] Vote buttons work on category pages too

---

## Phase 7: Vercel Deployment and Domain Connection

### Overview

Deploy the application to Vercel, provision the Postgres database, run migrations, configure environment variables, and connect the TransIP domain.

### Changes Required:

#### 1. Create `vercel.json` (optional, for custom config)

For this project, Vercel's zero-config deployment for Next.js should work without a `vercel.json`. Only create one if specific configuration is needed. The default behavior:
- Auto-detects Next.js
- Builds with `npm run build`
- Serves from `.next` output

#### 2. Deployment steps (manual)

These are one-time setup steps to be performed by Peter:

**Step A: Create Vercel Project**
1. Go to vercel.com, sign in with GitHub
2. Click "Add New Project"
3. Import the `peterweethetbeter` repository
4. Framework preset will auto-detect "Next.js"
5. Click "Deploy" (first deploy will fail because no database yet — that's OK)

**Step B: Provision Neon Database (via Vercel Marketplace)**
1. In Vercel dashboard, go to the project
2. Click "Storage" tab
3. Click "Create Database" > "Neon" (from Vercel Marketplace)
4. Select the Free plan
5. Choose region: `eu-central-1` (Frankfurt) for lowest latency from Netherlands
6. Click "Create"
7. Vercel auto-populates `DATABASE_URL` in the project environment variables

**Step C: Set Environment Variables**
1. In Vercel dashboard > Project > Settings > Environment Variables
2. Add: `ADMIN_PASSWORD` = (choose a strong password)
3. Verify `DATABASE_URL` is already set from Step B

**Step D: Run Database Migration**
After deployment succeeds:
```bash
curl -X POST https://peterweethetbeter.vercel.app/api/migrate \
  -H "Authorization: Bearer YOUR_ADMIN_PASSWORD"
```

**Step E: Connect Domain (Option B — DNS records at TransIP)**
1. In Vercel dashboard > Project > Settings > Domains
2. Add `peterweethetbeter.nl`
3. Add `www.peterweethetbeter.nl`
4. Vercel shows the required DNS records
5. In TransIP control panel:
   - Add A record: `@` -> `76.76.21.21`
   - Add CNAME record: `www` -> `cname.vercel-dns.com.`
6. Wait for DNS propagation (up to 24 hours)
7. Vercel auto-provisions SSL certificate

**Step F: Remove Migration Endpoint**
After migration is confirmed working, delete `src/app/api/migrate/route.ts` and redeploy. The migration endpoint is a one-time tool.

### Success Criteria:

#### Automated Verification:

- [x] `npm run build` completes successfully locally
- [x] Vercel deployment succeeds (check Vercel dashboard)
- [x] `curl -I https://peterweethetbeter.vercel.app` returns 200

#### Manual Verification:

- [x] Site loads at the Vercel preview URL
- [x] Site loads at peterweethetbeter.nl (after DNS propagation)
- [x] HTTPS works correctly (automatic via Vercel)
- [x] Admin login works in production
- [x] Can create a category and submit a verdict in production
- [x] Visitor voting works in production
- [x] www.peterweethetbeter.nl redirects to peterweethetbeter.nl

---

## Testing Strategy

### During Development (per phase):

- Run `npm run build` after each phase to catch compilation errors
- Run `npm run lint` to catch code quality issues
- Test locally with `npm run dev` connected to a Neon database via DATABASE_URL

### Manual Testing Checklist (before going live):

1. **Homepage**: Shows all active categories with today's verdicts
2. **Empty state**: Homepage gracefully handles no categories / no verdicts
3. **Admin login**: Password protection works, wrong password rejected
4. **Admin: Add category**: New category appears on homepage
5. **Admin: Submit verdict**: Verdict appears on homepage
6. **Admin: Change verdict**: UPSERT updates existing verdict, doesn't duplicate
7. **Admin: Toggle category**: Deactivated category disappears from homepage
8. **Visitor vote**: Vote is recorded, percentages update
9. **Duplicate vote**: Same IP cannot vote twice per category per day
10. **Category page**: `/[slug]` shows today's verdict and history
11. **404 page**: Non-existent slug returns 404
12. **Responsive**: Site works on mobile screens
13. **Performance**: Pages load quickly (server components, minimal JS)

## Performance Considerations

- **React Server Components**: All data-heavy pages are server-rendered, minimizing client JS
- **Revalidation**: `revalidate = 60` means pages are cached and rebuilt at most once per minute
- **Neon scale-to-zero**: Database sleeps after 5 minutes of inactivity — first request after idle has ~500ms cold start. Acceptable for this site's traffic level
- **No heavy client components**: Only VoteButtons and LoginForm are client components

## Migration Notes

- No existing data to migrate — this is a greenfield project
- Database schema uses `CREATE TABLE IF NOT EXISTS` for safe re-runs
- The migration endpoint is a temporary tool — remove after initial setup
- For future schema changes, add new migration functions to `src/lib/migrate.ts`

## References

- Research document: `thoughts/shared/research/2026-03-26-tech-stack-architecture.md`
- [Next.js App Router docs](https://nextjs.org/docs/app)
- [@neondatabase/serverless docs](https://neon.tech/docs/serverless/serverless-driver)
- [Neon Free Tier](https://neon.com/pricing)
- [TransIP DNS setup](https://www.transip.nl/knowledgebase/305-dns-nameservers-aanpassen-via-controlepaneel)
