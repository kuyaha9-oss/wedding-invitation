import type { APIRoute } from "astro";
import db, { getConfig } from "../../lib/db";
import { checkRateLimit } from "../../lib/rateLimit";
import { sendTelegramNotification } from "../../utils/telegram";

const VALID_ATTENDANCE = new Set(["hadir", "ragu", "tidak_hadir"]);

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
    const rsvps = db
      .prepare(
        "SELECT id, guest_name, attendance, guest_count, message, created_at FROM rsvps ORDER BY created_at DESC"
      )
      .all();
    return new Response(JSON.stringify(rsvps), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch RSVPs" }), {
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
    const guest_name = cleanText(rawData.guest_name);
    const phone = cleanText(rawData.phone);
    const message = cleanText(rawData.message);
    const attendance = rawData.attendance;
    const config = getConfig();
    const maxGuests = Math.max(
      1,
      Number.parseInt(config.RSVP_MAX_GUESTS || "10", 10) || 10
    );
    const requestedGuestCount = Number(rawData.guest_count);

    if (guest_name.length < 2) {
      return json({ error: "Nama minimal 2 karakter." }, 400);
    }
    if (guest_name.length > 80) {
      return json({ error: "Nama maksimal 80 karakter." }, 400);
    }
    if (!VALID_ATTENDANCE.has(attendance)) {
      return json({ error: "Status kehadiran tidak valid." }, 400);
    }
    if (phone.length > 30) {
      return json({ error: "Nomor kontak terlalu panjang." }, 400);
    }
    if (message.length > 500) {
      return json({ error: "Pesan maksimal 500 karakter." }, 400);
    }

    let guest_count = 1;
    if (attendance === "hadir") {
      if (
        !Number.isInteger(requestedGuestCount) ||
        requestedGuestCount < 1 ||
        requestedGuestCount > maxGuests
      ) {
        return json(
          { error: `Jumlah tamu harus antara 1 sampai ${maxGuests}.` },
          400
        );
      }
      guest_count = requestedGuestCount;
    }

    const existing = db
      .prepare("SELECT id FROM rsvps WHERE guest_name = ?")
      .get(guest_name) as { id: number } | undefined;

    let actionType = "";
    let resultId = 0;

    if (existing) {
      db.prepare(
        "UPDATE rsvps SET phone=?, attendance=?, guest_count=?, message=?, created_at=? WHERE id=?"
      ).run(
        phone,
        attendance,
        guest_count,
        message || "",
        new Date().toISOString(),
        existing.id
      );
      actionType = "updated";
      resultId = existing.id;
    } else {
      const result = db
        .prepare(
          "INSERT INTO rsvps (guest_name, phone, attendance, guest_count, message, created_at) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .run(
          guest_name,
          phone,
          attendance,
          guest_count,
          message || "",
          new Date().toISOString()
        );
      actionType = "created";
      resultId = Number(result.lastInsertRowid);
    }

    const title =
      actionType === "created"
        ? "<b>RSVP BARU MASUK!</b>"
        : "<b>PEMBARUAN DATA RSVP!</b>";

    const notifMsg = `
${title}

<b>Nama:</b> ${escapeHtml(guest_name)}
<b>Status:</b> ${escapeHtml(attendance.toUpperCase())}
<b>Jml:</b> ${attendance === "hadir" ? guest_count + " Orang" : "-"}
<b>Kontak:</b> ${escapeHtml(phone || "-")}

<b>Pesan:</b>
<i>"${escapeHtml(message || "-")}"</i>
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
