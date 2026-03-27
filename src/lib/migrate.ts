import { sql } from "@/lib/db";

export async function migrate() {
  // V1: Core tables
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      option_left VARCHAR(100) NOT NULL DEFAULT '',
      option_right VARCHAR(100) NOT NULL DEFAULT '',
      options JSONB DEFAULT '[]',
      is_daily BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_verdicts (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      date DATE NOT NULL,
      verdict VARCHAR(20) NOT NULL,
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
      vote VARCHAR(20) NOT NULL,
      voter_hash VARCHAR(64),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(category_id, date, voter_hash)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_visitor_votes_category_date
    ON visitor_votes(category_id, date)
  `;

  // V2: Add options and is_daily columns (idempotent)
  await sql`
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'
  `;
  await sql`
    ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_daily BOOLEAN DEFAULT true
  `;

  // Migrate existing categories that still use option_left/option_right
  await sql`
    UPDATE categories
    SET options = jsonb_build_array(option_left, option_right)
    WHERE (options IS NULL OR options = '[]'::jsonb)
      AND option_left != '' AND option_right != ''
  `;

  // Drop old CHECK constraints if they exist (allows multi-option values)
  await sql`
    DO $$
    BEGIN
      ALTER TABLE daily_verdicts DROP CONSTRAINT IF EXISTS daily_verdicts_verdict_check;
      ALTER TABLE visitor_votes DROP CONSTRAINT IF EXISTS visitor_votes_vote_check;
    EXCEPTION WHEN OTHERS THEN NULL;
    END $$
  `;
}
