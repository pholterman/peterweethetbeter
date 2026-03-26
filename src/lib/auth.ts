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
