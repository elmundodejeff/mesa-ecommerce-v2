"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Mensaje {
  id: number;
  nombre: string;
  email: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

interface Suscriptor {
  id: number;
  email: string;
  nombre: string | null;
  activo: boolean;
  createdAt: string;
}

export default function AdminContacto() {
  const [items, setItems] = useState<Mensaje[]>([]);
  const [suscriptores, setSuscriptores] = useState<Suscriptor[]>([]);
  const [error, setError] = useState("");

  async function cargar() {
    try {
      const [msgs, subs] = await Promise.all([
        api<Mensaje[]>("/contact", { auth: true }),
        api<Suscriptor[]>("/contact/suscriptores", { auth: true }),
      ]);
      setItems(msgs);
      setSuscriptores(subs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function marcarLeido(id: number) {
    try {
      await api(`/contact/${id}/leido`, { method: "PATCH", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  async function eliminar(id: number) {
    if (!confirm("Eliminar mensaje?")) return;
    try {
      await api(`/contact/${id}`, { method: "DELETE", auth: true });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  const sinLeer = items.filter((m) => !m.leido).length;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Comunicaciones</h1>
          <p className="admin-subtitle">Mensajes de contacto y suscriptores del newsletter</p>
        </div>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Seccion
        titulo="Mensajes de contacto"
        subtitulo="Bandeja de entrada del formulario"
        badge={sinLeer > 0 ? `${sinLeer} sin leer` : undefined}
        badgeRojo
        defaultOpen
      >
        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin mensajes.</p>
        ) : (
          <div className="space-y-3">
            {items.map((m) => (
              <div
                key={m.id}
                className={`rounded-xl border border-gray-100 p-4 ${m.leido ? "opacity-60" : ""}`}
                style={!m.leido ? { borderLeft: "3px solid var(--color-marca)" } : {}}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">
                      {m.nombre}{" "}
                      <span className="text-gray-400 text-sm font-normal">
                        &lt;{m.email}&gt;
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(m.fecha).toLocaleString("es-CL")}
                    </p>
                  </div>
                  <div className="flex gap-4 shrink-0">
                    {!m.leido && (
                      <button onClick={() => marcarLeido(m.id)} className="link-accion">
                        Marcar leído
                      </button>
                    )}
                    <button onClick={() => eliminar(m.id)} className="link-peligro">Eliminar</button>
                  </div>
                </div>
                <p className="text-gray-700 mt-2 whitespace-pre-wrap">{m.mensaje}</p>
              </div>
            ))}
          </div>
        )}
      </Seccion>

      <Seccion
        titulo="Suscriptores del newsletter"
        subtitulo="Personas registradas para recibir novedades"
        badge={String(suscriptores.length)}
      >
        {suscriptores.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin suscriptores aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Nombre</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {suscriptores.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-gray-800">{s.email}</td>
                    <td>{s.nombre || "-"}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString("es-CL")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Seccion>
    </>
  );
}

function Seccion({
  titulo,
  subtitulo,
  badge,
  badgeRojo = false,
  defaultOpen = false,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  badge?: string;
  badgeRojo?: boolean;
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
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">{titulo}</h3>
            {subtitulo && <p className="text-sm text-gray-500 mt-0.5">{subtitulo}</p>}
          </div>
          {badge && (
            <span
              className="admin-badge"
              style={badgeRojo ? { background: "#fee2e2", color: "#dc2626" } : {}}
            >
              {badge}
            </span>
          )}
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