import type { APIRoute } from "astro";
import db, { getConfig } from "../../lib/db";
import { checkRateLimit } from "../../lib/rateLimit";
import { sendTelegramNotification } from "../../utils/telegram";

const cleanText = (value: unknown): string =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, "").trim()
    : "";

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async () => {
  try {
    const wishes = db
      .prepare("SELECT * FROM wishes ORDER BY created_at DESC")
      .all();
    return new Response(JSON.stringify(wishes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const ip = clientAddress || "unknown";

  if (!checkRateLimit(ip, 5, 60000)) {
    return json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, 429);
  }

  try {
    const rawData = await request.json();
    const name = cleanText(rawData.name);
    const message = cleanText(rawData.message);

    if (name.length < 2) {
      return json({ error: "Nama minimal 2 karakter." }, 400);
    }
    if (name.length > 80) {
      return json({ error: "Nama maksimal 80 karakter." }, 400);
    }
    if (message.length < 2) {
      return json({ error: "Ucapan minimal 2 karakter." }, 400);
    }
    if (message.length > 500) {
      return json({ error: "Ucapan maksimal 500 karakter." }, 400);
    }

    const existing = db
      .prepare("SELECT id FROM wishes WHERE name = ?")
      .get(name) as { id: number } | undefined;

    let actionType = "";
    let resultId = 0;

    if (existing) {
      db.prepare("UPDATE wishes SET message=?, created_at=? WHERE id=?").run(
        message,
        new Date().toISOString(),
        existing.id
      );
      actionType = "updated";
      resultId = existing.id;
    } else {
      const result = db
        .prepare(
          "INSERT INTO wishes (name, message, created_at) VALUES (?, ?, ?)"
        )
        .run(name, message, new Date().toISOString());
      actionType = "created";
      resultId = Number(result.lastInsertRowid);
    }

    const config = getConfig();
    const title =
      actionType === "created"
        ? "<b>UCAPAN & DOA BARU!</b>"
        : "<b>UCAPAN DIPERBARUI!</b>";

    const notifMsg = `
${title}

<b>Dari:</b> ${escapeHtml(name)}

<i>"${escapeHtml(message)}"</i>
    `.trim();

    sendTelegramNotification(
      notifMsg,
      config.TELEGRAM_BOT_TOKEN,
      config.TELEGRAM_CHAT_ID
    );

    return json({ success: true, id: resultId, action: actionType });
  } catch {
    return json({ error: "Database error" }, 500);
  }
};
