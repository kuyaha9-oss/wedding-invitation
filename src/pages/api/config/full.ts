import type { APIRoute } from "astro";
import { getAdminUsername, getConfig } from "../../../lib/db";

export const GET: APIRoute = async ({ cookies }) => {
  const auth = cookies.get("wedding_admin_auth")?.value;
  if (auth !== "true") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    const config = { ...getConfig(), ADMIN_USERNAME: getAdminUsername() };
    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
};
