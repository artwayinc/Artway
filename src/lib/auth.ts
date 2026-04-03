import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_SECRET = process.env.ADMIN_PASSWORD || "default-secret";

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value === SESSION_SECRET;
  } catch {
    return false;
  }
}

export async function setSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function verifyCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || "artway-admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  
  return username === adminUsername && password === adminPassword;
}
