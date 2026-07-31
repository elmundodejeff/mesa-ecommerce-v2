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
  sobreNosotros?: SobreNosotrosData;
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
          logo: config.logo || undefined,
          logoUrl: config.logoUrl || undefined,
          fuente: config.fuente,
          colorMarca: config.colorMarca,
          colorHeader: config.colorHeader,
          colorHeaderTexto: config.colorHeaderTexto,
          contactoCorreo: config.contactoCorreo || undefined,
          contactoTelefono: config.contactoTelefono || undefined,
          contactoDireccion: config.contactoDireccion || undefined,
          contactoHorario: config.contactoHorario || undefined,
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
    return <p className="text-gray-500">Cargando configuracion...</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Configuracion de la tienda
      </h2>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-medium text-gray-800">Identidad</h3>
        <Campo label="Nombre del sitio">
          <input
            value={config.nombreSitio}
            onChange={(e) => set("nombreSitio", e.target.value)}
            className="w-full border rounded px-3 py-2"
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
              <label className="text-sm px-3 py-1.5 border rounded cursor-pointer hover:bg-gray-50 inline-block w-fit">
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
                  className="text-sm text-red-600 hover:underline w-fit"
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
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="Tipografia">
          <select
            value={config.fuente}
            onChange={(e) => set("fuente", e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            {FUENTES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Campo>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-medium text-gray-800">Colores</h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorCampo
            label="Marca"
            value={config.colorMarca}
            onChange={(v) => set("colorMarca", v)}
          />
          <ColorCampo
            label="Header fondo"
            value={config.colorHeader}
            onChange={(v) => set("colorHeader", v)}
          />
          <ColorCampo
            label="Header texto"
            value={config.colorHeaderTexto}
            onChange={(v) => set("colorHeaderTexto", v)}
          />
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-medium text-gray-800">Contacto y redes</h3>
        <Campo label="Correo">
          <input
            value={config.contactoCorreo || ""}
            onChange={(e) => set("contactoCorreo", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="Telefono">
          <input
            value={config.contactoTelefono || ""}
            onChange={(e) => set("contactoTelefono", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="Direccion">
          <input
            value={config.contactoDireccion || ""}
            onChange={(e) => set("contactoDireccion", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="Horario">
          <input
            value={config.contactoHorario || ""}
            onChange={(e) => set("contactoHorario", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="Instagram">
          <input
            value={config.contactoInstagram || ""}
            onChange={(e) => set("contactoInstagram", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
        <Campo label="TikTok">
          <input
            value={config.contactoTiktok || ""}
            onChange={(e) => set("contactoTiktok", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </Campo>
      </section>

      {error && <p className="text-red-600">{error}</p>}
      {guardado && (
        <p className="text-marca">
          Guardado. Recarga la tienda para ver los cambios.
        </p>
      )}
      <button
        onClick={guardar}
        disabled={cargando}
        className="text-white px-6 py-2 btn-pill bg-marca disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Guardar cambios"}
      </button>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-medium text-gray-800">Pagina &quot;Sobre nosotros&quot;</h3>
        <p className="text-sm text-gray-500">
          Edita el contenido de la pagina. Tiene su propio boton de guardar.
        </p>
        <EditorSobreNosotros inicial={config.sobreNosotros || {}} />
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="font-medium text-gray-800">Banco de avatares</h3>
        <BancoAvatares />
      </section>
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
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
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
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 border rounded cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border rounded px-2 py-2 text-sm"
        />
      </div>
    </div>
  );
}