import type { APIRoute } from "astro";
import { getWeddingMeta } from "../utils/meta";

export const GET: APIRoute = async () => {
  const meta = getWeddingMeta();

  return new Response(
    JSON.stringify({
      name: meta.title,
      short_name: meta.shortName,
      description: meta.description,
      theme_color: "#020617",
      background_color: "#020617",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: "/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "no-store",
      },
    }
  );
};
