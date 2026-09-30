import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "../../lib/db";
import { isAdminRequest, unauthorized } from "../../lib/adminAuth";

const ROOT = path.resolve(process.cwd(), "public", "uploads");

const toPublicUrl = (filePath: string): string =>
  `/${path.relative(path.resolve(process.cwd(), "public"), filePath).replace(/\\/g, "/")}`;

const listFiles = async (dir: string): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map((entry) => {
        const full = path.join(dir, entry.name);
        return entry.isDirectory() ? listFiles(full) : Promise.resolve([full]);
      })
    );
    return nested.flat();
  } catch {
    return [];
  }
};

const isUsed = (url: string): boolean => {
  const config = getConfig();
  return Object.values(config).some((value) => value.includes(url));
};

export const GET: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const files = await listFiles(ROOT);
  const data = await Promise.all(
    files.map(async (file) => {
      const stat = await fs.stat(file);
      const url = toPublicUrl(file);
      return {
        name: path.basename(file),
        url,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
        type: url.includes("/audio/") ? "audio" : "image",
        used: isUsed(url),
      };
    })
  );
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
};

export const DELETE: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();
  const { url, force } = await context.request.json();
  if (typeof url !== "string" || !url.startsWith("/uploads/")) {
    return new Response(JSON.stringify({ error: "URL tidak valid" }), {
      status: 400,
    });
  }
  if (!force && isUsed(url)) {
    return new Response(JSON.stringify({ error: "File masih dipakai" }), {
      status: 409,
    });
  }
  const target = path.resolve(path.join(process.cwd(), "public", url.slice(1)));
  if (!target.startsWith(ROOT)) {
    return new Response(JSON.stringify({ error: "Path tidak valid" }), {
      status: 400,
    });
  }
  await fs.rm(target, { force: true });
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
