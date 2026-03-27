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
  const isDaily = formData.get("is_daily") === "true";

  if (!categoryId || !verdict) {
    return;
  }

  const date = isDaily ? "CURRENT_DATE" : "9999-12-31";

  if (isDaily) {
    await sql`
      INSERT INTO daily_verdicts (category_id, date, verdict, reason, updated_at)
      VALUES (${categoryId}, CURRENT_DATE, ${verdict}, ${reason}, NOW())
      ON CONFLICT (category_id, date)
      DO UPDATE SET verdict = ${verdict}, reason = ${reason}, updated_at = NOW()
    `;
  } else {
    await sql`
      INSERT INTO daily_verdicts (category_id, date, verdict, reason, updated_at)
      VALUES (${categoryId}, '9999-12-31'::date, ${verdict}, ${reason}, NOW())
      ON CONFLICT (category_id, date)
      DO UPDATE SET verdict = ${verdict}, reason = ${reason}, updated_at = NOW()
    `;
  }

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
  const isDaily = formData.get("is_daily") === "on";

  // Collect options from form
  const options: string[] = [];
  let i = 0;
  while (formData.has(`option_${i}`)) {
    const val = (formData.get(`option_${i}`) as string).trim();
    if (val) options.push(val);
    i++;
  }

  if (!name || !slug || options.length < 2) {
    return;
  }

  const optionLeft = options[0];
  const optionRight = options[1];

  await sql`
    INSERT INTO categories (slug, name, description, option_left, option_right, options, is_daily)
    VALUES (${slug}, ${name}, ${description}, ${optionLeft}, ${optionRight}, ${JSON.stringify(options)}, ${isDaily})
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
