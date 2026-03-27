"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export async function castVote(_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const categoryId = parseInt(formData.get("category_id") as string);
  const vote = formData.get("vote") as string;
  const fingerprint = formData.get("fingerprint") as string;

  if (!categoryId || !["left", "right"].includes(vote)) {
    return { error: "Ongeldige stem." };
  }

  if (!fingerprint) {
    return { error: "Kon browser niet identificeren." };
  }

  try {
    await sql`
      INSERT INTO visitor_votes (category_id, date, vote, voter_hash)
      VALUES (${categoryId}, CURRENT_DATE, ${vote}, ${fingerprint})
      ON CONFLICT (category_id, date, voter_hash) DO NOTHING
    `;
  } catch {
    return { error: "Kon stem niet opslaan." };
  }

  revalidatePath("/");
  return {};
}
