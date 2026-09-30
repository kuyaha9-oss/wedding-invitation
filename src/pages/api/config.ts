import type { APIRoute } from "astro";
import { getConfig, setConfig, updateAdminCredentials } from "../../lib/db";

export const GET: APIRoute = async () => {
  try {
    const config = getConfig();
    const safeConfig = { ...config };
    delete safeConfig.TELEGRAM_BOT_TOKEN;
    delete safeConfig.TELEGRAM_CHAT_ID;
    return new Response(JSON.stringify(safeConfig), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch config" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = cookies.get("wedding_admin_auth")?.value;
  if (auth !== "true") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await request.json();
    if (typeof body.ADMIN_USERNAME === "string") {
      updateAdminCredentials(
        body.ADMIN_USERNAME,
        typeof body.ADMIN_PASSWORD_NEW === "string" &&
          body.ADMIN_PASSWORD_NEW.trim()
          ? body.ADMIN_PASSWORD_NEW
          : undefined
      );
      delete body.ADMIN_USERNAME;
      delete body.ADMIN_PASSWORD_NEW;
    }
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        setConfig(key, value);
      } else {
        setConfig(key, JSON.stringify(value));
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to save config" }), {
      status: 500,
    });
  }
};
