"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function castVote(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
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
