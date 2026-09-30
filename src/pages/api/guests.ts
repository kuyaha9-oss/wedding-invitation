import type { APIRoute } from "astro";
import db from "../../lib/db";
import { isAdminRequest, unauthorized } from "../../lib/adminAuth";

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "tamu";

const uniqueSlug = (name: string, id?: number): string => {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  const exists = db.prepare(
    "SELECT id FROM guests WHERE slug = ? AND (? IS NULL OR id != ?)"
  );
  while (exists.get(slug, id ?? null, id ?? null)) {
    slug = `${base}-${index}`;
    index += 1;
  }
  return slug;
};

export const GET: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const guests = db.prepare("SELECT * FROM guests ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(guests), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const body = await context.request.json();
  const items = Array.isArray(body.guests) ? body.guests : [body];
  const insert = db.prepare(
    `INSERT INTO guests (name, slug, phone, address, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const created = db.transaction(() =>
    items
      .filter((item) => item?.name?.toString().trim())
      .map((item) => {
        const name = item.name.toString().trim();
        const slug = uniqueSlug(item.slug?.toString() || name);
        const info = insert.run(
          name,
          slug,
          item.phone?.toString() || "",
          item.address?.toString() || "",
          item.notes?.toString() || "",
          new Date().toISOString()
        );
        return { id: info.lastInsertRowid, name, slug };
      })
  )();
  return new Response(JSON.stringify({ success: true, guests: created }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const PUT: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const body = await context.request.json();
  const id = Number(body.id);
  if (!id || !body.name) {
    return new Response(JSON.stringify({ error: "Data tidak lengkap" }), {
      status: 400,
    });
  }
  const slug = uniqueSlug(body.slug?.toString() || body.name.toString(), id);
  db.prepare(
    `UPDATE guests
     SET name = ?, slug = ?, phone = ?, address = ?, notes = ?
     WHERE id = ?`
  ).run(
    body.name.toString(),
    slug,
    body.phone?.toString() || "",
    body.address?.toString() || "",
    body.notes?.toString() || "",
    id
  );
  return new Response(JSON.stringify({ success: true, slug }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const body = await context.request.json();
  const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [Number(body.id)];
  const validIds = ids.filter(Boolean);
  if (validIds.length === 0) {
    return new Response(JSON.stringify({ error: "ID tidak valid" }), {
      status: 400,
    });
  }
  const placeholders = validIds.map(() => "?").join(",");
  db.prepare(`DELETE FROM guests WHERE id IN (${placeholders})`).run(...validIds);
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
