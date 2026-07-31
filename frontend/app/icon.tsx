import { ImageResponse } from "next/og";
import { getConfig } from "@/lib/config";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Refresca el favicon como maximo cada 60s (evita cache eterno del navegador)
export const revalidate = 60;
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  try {
    const config = await getConfig();
    if (config.logo) {
      const url = config.logo.startsWith("http")
        ? config.logo
        : `${BASE}${config.logo}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          headers: {
            "Content-Type": res.headers.get("Content-Type") || "image/png",
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }
    // Fallback: inicial del nombre sobre color de marca
    const inicial = (config.nombreSitio || "M").charAt(0).toUpperCase();
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: config.colorMarca || "#4B1528",
            color: "#fff",
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          {inicial}
        </div>
      ),
      { ...size },
    );
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#4B1528",
            color: "#fff",
            fontSize: 44,
            fontWeight: 700,
          }}
        >
          M
        </div>
      ),
      { ...size },
    );
  }
}