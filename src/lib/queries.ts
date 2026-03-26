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
