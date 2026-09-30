import type { APIRoute } from "astro";
import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { isAdminRequest, unauthorized } from "../../lib/adminAuth";

const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const IMAGE_DIR = path.join(PUBLIC_DIR, "uploads", "images");
const AUDIO_DIR = path.join(PUBLIC_DIR, "uploads", "audio");
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_AUDIO_SIZE = 15 * 1024 * 1024;

const safeName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "upload";

export const POST: APIRoute = async (context) => {
  if (!isAdminRequest(context)) return unauthorized();

  const form = await context.request.formData();
  const file = form.get("file");
  const kind = form.get("kind")?.toString() || "image";

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "File wajib diisi" }), {
      status: 400,
    });
  }

  const isImage = file.type.startsWith("image/");
  const isAudio = file.type.startsWith("audio/");
  if (kind === "audio" && !isAudio) {
    return new Response(JSON.stringify({ error: "File harus audio" }), {
      status: 400,
    });
  }
  if (kind !== "audio" && !isImage) {
    return new Response(JSON.stringify({ error: "File harus gambar" }), {
      status: 400,
    });
  }
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return new Response(JSON.stringify({ error: "Gambar maksimal 5MB" }), {
      status: 400,
    });
  }
  if (isAudio && file.size > MAX_AUDIO_SIZE) {
    return new Response(JSON.stringify({ error: "Audio maksimal 15MB" }), {
      status: 400,
    });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const stamp = Date.now();

  if (isAudio) {
    await fs.mkdir(AUDIO_DIR, { recursive: true });
    const ext = path.extname(file.name).toLowerCase() || ".mp3";
    const filename = `${stamp}-${safeName(file.name)}${ext}`;
    await fs.writeFile(path.join(AUDIO_DIR, filename), bytes);
    return new Response(
      JSON.stringify({ url: `/uploads/audio/${filename}`, name: filename }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  await fs.mkdir(IMAGE_DIR, { recursive: true });
  const filename = `${stamp}-${safeName(file.name)}.webp`;
  await sharp(bytes)
    .rotate()
    .resize({ width: 1800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(IMAGE_DIR, filename));

  return new Response(
    JSON.stringify({ url: `/uploads/images/${filename}`, name: filename }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
