import type { APIRoute } from "astro";
import { isAdminRequest, unauthorized } from "../../../lib/adminAuth";
import { getAdminUsername, getConfig } from "../../../lib/db";

export const GET: APIRoute = async ({ cookies }) => {
  if (!isAdminRequest({ cookies })) return unauthorized();
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
