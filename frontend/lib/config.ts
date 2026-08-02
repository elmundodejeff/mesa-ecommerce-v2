export interface Config {
  colorMarca: string;
  nombreSitio: string;
  logo: string | null;
  logoUrl: string | null;
  colorHeader: string;
  colorHeaderTexto: string;
  fuente: string;
  contactoCorreo: string | null;
  contactoInstagram: string | null;
  contactoTiktok: string | null;
  contactoTelefono: string | null;
  contactoDireccion: string | null;
  contactoHorario: string | null;
  sobreNosotros?: unknown;
  bloquesHome?: unknown;
}

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Fetch server-side de la config. Se ejecuta en el servidor de Next,
// antes de enviar el HTML -> sin parpadeo.
export async function getConfig(): Promise<Config> {
  const res = await fetch(`${BASE}/content/config`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("No se pudo cargar la config");
  }
  return res.json();
}