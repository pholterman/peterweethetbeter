import { sql } from "@/lib/db";

export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  option_left: string;
  option_right: string;
  options: string[];
  is_daily: boolean;
  is_active: boolean;
};

export type Verdict = {
  id: number;
  category_id: number;
  date: string;
  verdict: string;
  reason: string | null;
};

export type VoteCounts = Record<string, number> & { total: number };

// Non-daily categories use a sentinel date
const PERSISTENT_DATE = "9999-12-31";

export function getOptions(category: Category): string[] {
  if (category.options && category.options.length > 0) {
    return category.options;
  }
  // Fallback for old categories
  return [category.option_left, category.option_right].filter(Boolean);
}

export function resolveVerdictLabel(category: Category, verdict: string): string {
  const options = getOptions(category);
  // Handle legacy "left"/"right" values
  if (verdict === "left") return options[0] || "Links";
  if (verdict === "right") return options[1] || "Rechts";
  // New format: option index
  const idx = parseInt(verdict);
  if (!isNaN(idx) && idx >= 0 && idx < options.length) {
    return options[idx];
  }
  return verdict;
}

export function getVerdictDate(category: Category): string {
  return category.is_daily ? new Date().toISOString().split("T")[0] : PERSISTENT_DATE;
}

export async function getActiveCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT id, slug, name, description, option_left, option_right, options, is_daily, is_active
    FROM categories
    WHERE is_active = true
    ORDER BY created_at ASC
  `;
  return rows as Category[];
}

export async function getTodayVerdicts(): Promise<Verdict[]> {
  const rows = await sql`
    SELECT dv.id, dv.category_id, dv.date::text, dv.verdict, dv.reason
    FROM daily_verdicts dv
    JOIN categories c ON c.id = dv.category_id
    WHERE (c.is_daily = true AND dv.date = CURRENT_DATE)
       OR (c.is_daily = false AND dv.date = ${PERSISTENT_DATE}::date)
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

  const counts: VoteCounts = { total: 0 };
  for (const row of rows) {
    const count = parseInt(row.count);
    counts[row.vote] = count;
    counts.total += count;
  }

  return counts;
}

export type VerdictWithCategory = Verdict & {
  option_left: string;
  option_right: string;
  category_name: string;
};

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const rows = await sql`
    SELECT id, slug, name, description, option_left, option_right, options, is_daily, is_active
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
      AND date != ${PERSISTENT_DATE}::date
    ORDER BY date DESC
    LIMIT ${limit}
  `;
  return rows as Verdict[];
}

export async function getLatestVerdict(categoryId: number): Promise<Verdict | null> {
  const rows = await sql`
    SELECT id, category_id, date::text, verdict, reason
    FROM daily_verdicts
    WHERE category_id = ${categoryId} AND date = ${PERSISTENT_DATE}::date
  `;
  return (rows[0] as Verdict) || null;
}
