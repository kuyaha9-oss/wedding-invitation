import type { APIContext } from "astro";

export const isAdminRequest = (context: Pick<APIContext, "cookies">): boolean =>
  context.cookies.get("wedding_admin_auth")?.value === "true";

export const unauthorized = (): Response =>
  new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
