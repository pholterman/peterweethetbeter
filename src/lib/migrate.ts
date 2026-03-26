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
