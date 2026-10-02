import type { APIContext } from "astro";
import crypto from "node:crypto";

const COOKIE_NAME = "wedding_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const sessions = new Map<string, number>();

const pruneSessions = () => {
  const now = Date.now();
  for (const [token, expiresAt] of sessions.entries()) {
    if (expiresAt <= now) sessions.delete(token);
  }
};

export const createAdminSession = (
  cookies: APIContext["cookies"],
  secure: boolean
): void => {
  pruneSessions();
  const token = crypto.randomUUID();
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  cookies.set(COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: SESSION_TTL_MS / 1000,
  });
};

export const destroyAdminSession = (cookies: APIContext["cookies"]): void => {
  const token = cookies.get(COOKIE_NAME)?.value;
  if (token) sessions.delete(token);
  cookies.delete(COOKIE_NAME, { path: "/" });
};

export const isAdminRequest = (
  context: Pick<APIContext, "cookies">
): boolean => {
  pruneSessions();
  const token = context.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expiresAt = sessions.get(token);
  return typeof expiresAt === "number" && expiresAt > Date.now();
};

export const unauthorized = (): Response =>
  new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
