"use client";

import { useEffect, useState } from "react";
import { api, apiUpload } from "@/lib/api";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
import EditorSobreNosotros from "@/components/EditorSobreNosotros";
import BancoAvatares from "@/components/BancoAvatares";
import type { SobreNosotrosData } from "@/components/SobreNosotrosContenido";

interface ConfigData {
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
  envioComunaOrigen: string | null;
  envioDireccionOrigen: string | null;
  sobreNosotros?: SobreNosotrosData;
  bloquesHome?: Record<string, unknown>;
}

const FUENTES = ["Poppins", "Roboto", "Inter", "Montserrat", "Lato"];

export default function AdminConfig() {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  async function subirLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setError("");
    setSubiendoLogo(true);
    try {
      const fd = new FormData();
      fd.append("imagen", f);
      const res = await apiUpload<{ url: string }>("/content/upload", fd);
      set("logo", res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir logo");
    } finally {
      setSubiendoLogo(false);
      e.target.value = "";
    }
  }

  useEffect(() => {
    api<ConfigData>("/content/config")
      .then(setConfig)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Error al cargar"),
      );
  }, []);

  function set(campo: keyof ConfigData, valor: string) {
    setConfig((prev) => (prev ? { ...prev, [campo]: valor } : prev));
    setGuardado(false);
  }

  async function guardar() {
    if (!config) return;
    setError("");
    setCargando(true);
    try {
      await api("/content/config", {
        method: "PATCH",
        auth: true,
        body: {
          nombreSitio: config.nombreSitio,
          logo: config.logo ?? "",
          logoUrl: config.logoUrl || undefined,
          fuente: config.fuente,
          colorMarca: config.colorMarca,
          colorHeader: config.colorHeader,
          colorHeaderTexto: config.colorHeaderTexto,
          contactoCorreo: config.contactoCorreo || undefined,
          contactoTelefono: config.contactoTelefono || undefined,
          contactoDireccion: config.contactoDireccion || undefined,
          contactoHorario: config.contactoHorario || undefined,
          envioComunaOrigen: config.envioComunaOrigen || undefined,
          envioDireccionOrigen: config.envioDireccionOrigen || undefined,
          contactoInstagram: config.contactoInstagram || undefined,
          contactoTiktok: config.contactoTiktok || undefined,
        },
      });
      setGuardado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setCargando(false);
    }
  }

  if (!config) {
    return <p className="text-gray-500">Cargando configuración...</p>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Configuración de la tienda</h1>
          <p className="admin-subtitle">Identidad, colores, contacto y contenido</p>
        </div>
      </div>

      <Seccion titulo="Identidad" subtitulo="Nombre, logo y tipografía" defaultOpen>
        <div className="space-y-4">
          <Campo label="Nombre del sitio">
            <input
              value={config.nombreSitio}
              onChange={(e) => set("nombreSitio", e.target.value)}
              className="admin-input"
            />
          </Campo>
          <Campo label="Logo del sitio">
            <div className="flex items-center gap-4">
              {config.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={config.logo.startsWith("http") ? config.logo : `${API_BASE}${config.logo}`}
                  alt="Logo"
                  className="h-14 w-14 object-contain rounded border bg-gray-50 p-1"
                />
              ) : (
                <div className="h-14 w-14 rounded border border-dashed flex items-center justify-center text-gray-300 text-xs">
                  Sin logo
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="btn-secundario cursor-pointer w-fit">
                  {subiendoLogo ? "Subiendo..." : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={subirLogo}
                    disabled={subiendoLogo}
                    className="hidden"
                  />
                </label>
                {config.logo && (
                  <button
                    type="button"
                    onClick={() => set("logo", "")}
                    className="link-peligro w-fit"
                  >
                    Quitar logo
                  </button>
                )}
              </div>
            </div>
          </Campo>
          <Campo label="URL de destino del logo (al hacer clic)">
            <input
              value={config.logoUrl || ""}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="/ (por defecto lleva al inicio)"
              className="admin-input"
            />
          </Campo>
          <Campo label="Tipografía">
            <select
              value={config.fuente}
              onChange={(e) => set("fuente", e.target.value)}
              className="admin-input"
            >
              {FUENTES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="Colores" subtitulo="Paleta de marca y header">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorCampo label="Marca" value={config.colorMarca} onChange={(v) => set("colorMarca", v)} />
          <ColorCampo label="Header fondo" value={config.colorHeader} onChange={(v) => set("colorHeader", v)} />
          <ColorCampo label="Header texto" value={config.colorHeaderTexto} onChange={(v) => set("colorHeaderTexto", v)} />
        </div>
      </Seccion>

      <Seccion titulo="Contacto y redes" subtitulo="Datos que se muestran en el sitio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Campo label="Correo">
            <input value={config.contactoCorreo || ""} onChange={(e) => set("contactoCorreo", e.target.value)} className="admin-input" />
          </Campo>
          <Campo label="Teléfono">
            <input value={config.contactoTelefono || ""} onChange={(e) => set("contactoTelefono", e.target.value)} className="admin-input" />
          </Campo>
          <Campo label="Dirección">
            <input value={config.contactoDireccion || ""} onChange={(e) => set("contactoDireccion", e.target.value)} className="admin-input" />
          </Campo>
          <Campo label="Comuna de origen (envíos)">
            <input value={config.envioComunaOrigen || ""} onChange={(e) => set("envioComunaOrigen", e.target.value)} placeholder="Providencia" className="admin-input" />
          </Campo>
          <Campo label="Dirección de despacho (envíos)">
            <input value={config.envioDireccionOrigen || ""} onChange={(e) => set("envioDireccionOrigen", e.target.value)} placeholder="Metro Tobalaba, Providencia" className="admin-input" />
          </Campo>
          <Campo label="Horario">
            <input value={config.contactoHorario || ""} onChange={(e) => set("contactoHorario", e.target.value)} className="admin-input" />
          </Campo>
          <Campo label="Instagram">
            <input value={config.contactoInstagram || ""} onChange={(e) => set("contactoInstagram", e.target.value)} className="admin-input" />
          </Campo>
          <Campo label="TikTok">
            <input value={config.contactoTiktok || ""} onChange={(e) => set("contactoTiktok", e.target.value)} className="admin-input" />
          </Campo>
        </div>
      </Seccion>

      <div className="sticky bottom-0 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-gray-50/95 backdrop-blur border-t border-gray-200 flex items-center gap-4 z-10">
        <button onClick={guardar} disabled={cargando} className="btn-primario">
          {cargando ? "Guardando..." : "Guardar cambios"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {guardado && (
          <p className="text-sm" style={{ color: "var(--color-marca)" }}>
            Guardado. Recarga la tienda para ver los cambios.
          </p>
        )}
      </div>

      <Seccion titulo="Página &quot;Sobre nosotros&quot;" subtitulo="Tiene su propio botón de guardar">
        <EditorSobreNosotros inicial={config.sobreNosotros || {}} />
      </Seccion>

      <Seccion titulo="Banco de avatares" subtitulo="Imágenes disponibles para los usuarios">
        <BancoAvatares />
      </Seccion>
    </>
  );
}

function Seccion({
  titulo,
  subtitulo,
  defaultOpen = false,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(defaultOpen);
  return (
    <div className="admin-card p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="admin-collapse-trigger"
      >
        <div>
          <h3 className="font-semibold text-gray-800">{titulo}</h3>
          {subtitulo && <p className="text-sm text-gray-500 mt-0.5">{subtitulo}</p>}
        </div>
        <svg
          className={`admin-chevron ${abierto ? "abierto" : ""}`}
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {abierto && <div className="admin-collapse-body">{children}</div>}
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      {children}
    </div>
  );
}

function ColorCampo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="admin-label">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 border rounded cursor-pointer shrink-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="admin-input text-sm"
        />
      </div>
    </div>
  );
}