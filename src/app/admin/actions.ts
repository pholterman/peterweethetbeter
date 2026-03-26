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
