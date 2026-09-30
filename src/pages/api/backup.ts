import type { APIRoute } from "astro";
import db, { getConfig, setConfig } from "../../lib/db";
import { isAdminRequest, unauthorized } from "../../lib/adminAuth";

export const GET: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    config: getConfig(),
    rsvps: db.prepare("SELECT * FROM rsvps ORDER BY id").all(),
    wishes: db.prepare("SELECT * FROM wishes ORDER BY id").all(),
    guests: db.prepare("SELECT * FROM guests ORDER BY id").all(),
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="wedding-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
};

export const POST: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const body = await context.request.json();
  if (!body || typeof body !== "object") {
    return new Response(JSON.stringify({ error: "Backup tidak valid" }), {
      status: 400,
    });
  }

  const trx = db.transaction(() => {
    if (body.config && typeof body.config === "object") {
      for (const [key, value] of Object.entries(body.config)) {
        if (typeof value === "string") setConfig(key, value);
      }
    }

    if (Array.isArray(body.rsvps)) {
      db.prepare("DELETE FROM rsvps").run();
      const insert = db.prepare(
        `INSERT INTO rsvps
          (guest_name, phone, attendance, guest_count, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const row of body.rsvps) {
        insert.run(
          row.guest_name,
          row.phone ?? "",
          row.attendance,
          row.guest_count ?? 1,
          row.message ?? "",
          row.created_at ?? new Date().toISOString()
        );
      }
    }

    if (Array.isArray(body.wishes)) {
      db.prepare("DELETE FROM wishes").run();
      const insert = db.prepare(
        "INSERT INTO wishes (name, message, created_at) VALUES (?, ?, ?)"
      );
      for (const row of body.wishes) {
        insert.run(
          row.name,
          row.message,
          row.created_at ?? new Date().toISOString()
        );
      }
    }

    if (Array.isArray(body.guests)) {
      db.prepare("DELETE FROM guests").run();
      const insert = db.prepare(
        `INSERT OR IGNORE INTO guests
          (name, slug, phone, address, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      );
      for (const row of body.guests) {
        insert.run(
          row.name,
          row.slug,
          row.phone ?? "",
          row.address ?? "",
          row.notes ?? "",
          row.created_at ?? new Date().toISOString()
        );
      }
    }
  });

  trx();
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
