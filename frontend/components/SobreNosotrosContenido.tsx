"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface SobreNosotrosData {
  hero?: { titulo?: string; subtitulo?: string; imagen?: string };
  historia?: { titulo?: string; texto?: string; imagen?: string; lado?: "izq" | "der" }[];
  valores?: { icono?: string; titulo?: string; texto?: string }[];
  stats?: { numero?: string; label?: string }[];
  galeria?: string[];
  video?: { url?: string; titulo?: string };
  cta?: { titulo?: string; texto?: string; botonTexto?: string; botonEnlace?: string };
}

function img(src?: string) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API_BASE}${src}`;
}

// Convierte URL de YouTube/Vimeo a embed
function embedUrl(url?: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return url;
}

export default function SobreNosotrosContenido({
  data,
  colorMarca,
}: {
  data: SobreNosotrosData;
  colorMarca: string;
}) {
  const { hero, historia, valores, stats, galeria, video, cta } = data;

  return (
    <div>
      {/* HERO */}
      {hero && (hero.titulo || hero.imagen) && (
        <div className="relative w-full h-80 md:h-96 overflow-hidden flex items-center justify-center">
          {hero.imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img(hero.imagen)} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${colorMarca}, ${colorMarca}dd)` }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative text-center text-white px-4">
            {hero.titulo && <h1 className="text-4xl md:text-6xl font-bold drop-shadow">{hero.titulo}</h1>}
            {hero.subtitulo && <p className="mt-3 text-lg md:text-xl drop-shadow max-w-2xl mx-auto">{hero.subtitulo}</p>}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-20">
        {/* HISTORIA (columnas alternadas) */}
        {historia && historia.length > 0 && (
          <div className="space-y-16">
            {historia.map((h, i) => (
              <div key={i} className={`grid md:grid-cols-2 gap-8 items-center ${h.lado === "der" ? "md:[direction:rtl]" : ""}`}>
                <div className="[direction:ltr]">
                  {h.titulo && <h2 className="text-2xl font-bold text-gray-900 mb-3">{h.titulo}</h2>}
                  {h.texto && <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{h.texto}</p>}
                </div>
                {h.imagen && (
                  <div className="[direction:ltr]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img(h.imagen)} alt="" className="w-full h-64 object-cover rounded-2xl shadow-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* VALORES (tarjetas) */}
        {valores && valores.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {valores.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
                {v.icono && <div className="text-4xl mb-3">{v.icono}</div>}
                {v.titulo && <h3 className="font-bold text-gray-900 mb-2">{v.titulo}</h3>}
                {v.texto && <p className="text-sm text-gray-500 leading-relaxed">{v.texto}</p>}
              </div>
            ))}
          </div>
        )}

        {/* STATS */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 rounded-2xl" style={{ backgroundColor: `${colorMarca}0d` }}>
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: colorMarca }}>{s.numero}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* VIDEO */}
        {video && video.url && embedUrl(video.url) && (
          <div>
            {video.titulo && <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{video.titulo}</h2>}
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl(video.url)!}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={video.titulo || "video"}
              />
            </div>
          </div>
        )}

        {/* GALERIA */}
        {galeria && galeria.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galeria.map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={img(g)} alt="" className="w-full h-48 object-cover rounded-xl shadow-sm" />
            ))}
          </div>
        )}

        {/* CTA */}
        {cta && (cta.titulo || cta.botonTexto) && (
          <div className="text-center rounded-2xl p-10" style={{ backgroundColor: `${colorMarca}0d` }}>
            {cta.titulo && <h2 className="text-2xl font-bold text-gray-900 mb-2">{cta.titulo}</h2>}
            {cta.texto && <p className="text-gray-600 mb-6 max-w-xl mx-auto">{cta.texto}</p>}
            {cta.botonTexto && (
              <a href={cta.botonEnlace || "/tienda"} className="inline-block text-white px-8 py-3 font-medium btn-pill" style={{ backgroundColor: colorMarca }}>
                {cta.botonTexto}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}