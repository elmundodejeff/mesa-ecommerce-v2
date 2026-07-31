"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, apiUpload } from "@/lib/api";
import SeccionDirecciones from "@/components/SeccionDirecciones";
import SeccionHistorial from "@/components/SeccionHistorial";
import SeccionPeligro from "@/components/SeccionPeligro";
import {
  obtenerToken,
  obtenerUsuario,
  guardarUsuario,
  type UsuarioSesion,
} from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Avatar {
  id: number;
  url: string;
}

interface MeData {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  rut: string | null;
  avatar: string | null;
  rol: string;
}

function imgUrl(u?: string | null) {
  if (!u) return "";
  return u.startsWith("http") ? u : `${API_BASE}${u}`;
}

export default function CuentaPage() {
  const router = useRouter();
  const [me, setMe] = useState<MeData | null>(null);
  const [avatares, setAvatares] = useState<Avatar[]>([]);

  // datos editables
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rut, setRut] = useState("");
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [okDatos, setOkDatos] = useState(false);
  const [errorDatos, setErrorDatos] = useState("");

  const [subiendo, setSubiendo] = useState(false);
  const [errorAvatar, setErrorAvatar] = useState("");

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
      return;
    }
    api<MeData>("/users/me", { auth: true })
      .then((d) => {
        setMe(d);
        setNombre(d.nombre || "");
        setTelefono(d.telefono || "");
        setRut(d.rut || "");
      })
      .catch(() => router.replace("/login"));
    api<Avatar[]>("/content/avatares").then(setAvatares).catch(() => {});
  }, [router]);

  function sincronizarSesion(avatar: string | null, nombreNuevo?: string) {
    const u = obtenerUsuario();
    if (u) {
      const actualizado: UsuarioSesion = {
        ...u,
        avatar: avatar ?? u.avatar,
        nombre: nombreNuevo ?? u.nombre,
      };
      guardarUsuario(actualizado);
    }
  }

  async function guardarDatos() {
    setErrorDatos(""); setOkDatos(false); setGuardandoDatos(true);
    try {
      const d = await api<MeData>("/users/me", {
        method: "PATCH",
        auth: true,
        body: { nombre, telefono, rut: rut || undefined },
      });
      setMe(d);
      setRut(d.rut || "");
      sincronizarSesion(d.avatar, d.nombre || undefined);
      setOkDatos(true);
    } catch (e) {
      setErrorDatos(e instanceof Error ? e.message : "Error");
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function elegirDelBanco(url: string) {
    setErrorAvatar("");
    try {
      const r = await api<{ avatar: string }>("/users/me/avatar-banco", {
        method: "PATCH",
        auth: true,
        body: { url },
      });
      setMe((m) => (m ? { ...m, avatar: r.avatar } : m));
      sincronizarSesion(r.avatar);
    } catch (e) {
      setErrorAvatar(e instanceof Error ? e.message : "Error");
    }
  }

  async function subirPropia(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErrorAvatar(""); setSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("avatar", f);
      const r = await apiUpload<{ avatar: string }>("/users/me/avatar", fd);
      setMe((m) => (m ? { ...m, avatar: r.avatar } : m));
      sincronizarSesion(r.avatar);
    } catch (err) {
      setErrorAvatar(err instanceof Error ? err.message : "Error");
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
          <Link href="/" className="text-sm text-gray-500 hover:underline">Volver</Link>
        </div>

        {/* AVATAR */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Mi avatar</h2>
          <div className="flex items-center gap-5 mb-4">
            {me.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgUrl(me.avatar)} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-100" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: "var(--color-marca)" }}>
                {(me.nombre || me.email).charAt(0).toUpperCase()}
              </div>
            )}
            <label className="cursor-pointer text-sm text-white px-4 py-2 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
              {subiendo ? "Subiendo..." : "Subir mi foto"}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={subirPropia} disabled={subiendo} className="hidden" />
            </label>
          </div>
          {avatares.length > 0 && (
            <>
              <p className="text-xs text-gray-500 mb-2">O elige uno de la galeria:</p>
              <div className="flex flex-wrap gap-3">
                {avatares.map((a) => (
                  <button key={a.id} onClick={() => elegirDelBanco(a.url)} className="rounded-full overflow-hidden border-2 transition" style={{ borderColor: me.avatar === a.url ? "var(--color-marca)" : "transparent" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl(a.url)} alt="" className="w-14 h-14 object-cover" />
                  </button>
                ))}
              </div>
            </>
          )}
          {errorAvatar && <p className="text-red-600 text-sm mt-2">{errorAvatar}</p>}
        </section>

        {/* DATOS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Mis datos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Telefono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">RUT</label>
              <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12345678-9" className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Correo: {me.email}</p>
          {errorDatos && <p className="text-red-600 text-sm mt-2">{errorDatos}</p>}
          {okDatos && <p className="text-sm mt-2" style={{ color: "var(--color-marca)" }}>Datos guardados.</p>}
          <button onClick={guardarDatos} disabled={guardandoDatos} className="mt-4 text-white px-6 py-2 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
            {guardandoDatos ? "Guardando..." : "Guardar datos"}
          </button>
        </section>

        <SeccionDirecciones />

        <SeccionHistorial />

        <SeccionPeligro />
      </div>
    </div>
  );
}