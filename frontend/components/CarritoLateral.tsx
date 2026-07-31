"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { obtenerToken } from "@/lib/auth";
import { useCarrito } from "@/lib/carrito";

interface Validacion {
  valido: boolean;
  tipo?: string;
  valor?: number;
  codigoId?: number;
}

interface ResumenPuntos {
  saldo: number;
}

const DESC_KEY = "mesa_descuento";
const PUNTOS_KEY = "mesa_puntos";

export default function CarritoLateral({ colorMarca }: { colorMarca: string }) {
  const { items, cambiarCantidad, quitar, total } = useCarrito();
  const [codigo, setCodigo] = useState("");
  const [aplicado, setAplicado] = useState<{ codigo: string; tipo: string; valor: number } | null>(null);
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState("");

  const [logueado, setLogueado] = useState(false);
  const [saldoPuntos, setSaldoPuntos] = useState(0);
  const [puntosAUsar, setPuntosAUsar] = useState(0);

  useEffect(() => {
    const guardado = localStorage.getItem(DESC_KEY);
    if (guardado) {
      try {
        setAplicado(JSON.parse(guardado));
      } catch {
        // ignore
      }
    }
    const puntosGuardados = localStorage.getItem(PUNTOS_KEY);
    if (puntosGuardados) {
      const n = Number(puntosGuardados);
      if (!isNaN(n)) setPuntosAUsar(n);
    }
    if (obtenerToken()) {
      setLogueado(true);
      api<ResumenPuntos>("/loyalty/me", { auth: true })
        .then((r) => setSaldoPuntos(r.saldo))
        .catch(() => setSaldoPuntos(0));
    }
  }, []);

  async function aplicar() {
    if (!codigo.trim()) return;
    setError("");
    setValidando(true);
    try {
      const r = await api<Validacion>(
        `/discounts/validar?codigo=${encodeURIComponent(codigo.trim().toUpperCase())}`,
      );
      if (r.valido && r.tipo && r.valor !== undefined) {
        const dato = { codigo: codigo.trim().toUpperCase(), tipo: r.tipo, valor: r.valor };
        setAplicado(dato);
        localStorage.setItem(DESC_KEY, JSON.stringify(dato));
        setCodigo("");
      } else {
        setError("Codigo no valido");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Codigo no valido");
    } finally {
      setValidando(false);
    }
  }

  function quitarDescuento() {
    setAplicado(null);
    localStorage.removeItem(DESC_KEY);
    setError("");
  }

  const montoDescuento = aplicado
    ? aplicado.tipo === "porcentaje"
      ? Math.round(total * (aplicado.valor / 100))
      : Math.min(aplicado.valor, total)
    : 0;

  const totalTrasDescuento = Math.max(0, total - montoDescuento);

  // Tope de puntos: no mas que el saldo, ni mas que el total tras descuento
  const maxPuntos = Math.min(saldoPuntos, totalTrasDescuento);
  const puntosEfectivos = Math.min(Math.max(0, puntosAUsar), maxPuntos);
  const totalFinal = Math.max(0, totalTrasDescuento - puntosEfectivos);

  function setPuntos(n: number) {
    const val = Math.min(Math.max(0, Math.floor(n)), maxPuntos);
    setPuntosAUsar(val);
    localStorage.setItem(PUNTOS_KEY, String(val));
  }

  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tu carrito</h2>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">
          Tu carrito esta vacio.
        </p>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {items.map((i) => (
              <div key={i.productoId} className="flex items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{i.nombre}</p>
                  <p className="text-xs text-gray-400">
                    ${i.precio.toLocaleString("es-CL")} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      i.cantidad <= 1
                        ? quitar(i.productoId)
                        : cambiarCantidad(i.productoId, i.cantidad - 1)
                    }
                    className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Restar"
                  >
                    &minus;
                  </button>
                  <span className="w-6 text-center">{i.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(i.productoId, i.cantidad + 1)}
                    className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right font-medium text-gray-800">
                  ${(i.precio * i.cantidad).toLocaleString("es-CL")}
                </span>
                <button
                  onClick={() => quitar(i.productoId)}
                  className="text-gray-300 hover:text-red-500 ml-1"
                  aria-label="Quitar"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>

          {/* Codigo de descuento */}
          <div className="border-t border-gray-100 pt-3 mb-3">
            {aplicado ? (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span className="font-medium text-gray-700">
                  {aplicado.codigo}
                  <span className="text-gray-400 ml-1">
                    ({aplicado.tipo === "porcentaje" ? `${aplicado.valor}%` : `$${aplicado.valor.toLocaleString("es-CL")}`})
                  </span>
                </span>
                <button onClick={quitarDescuento} className="text-red-500 text-xs hover:underline">
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && aplicar()}
                  placeholder="Codigo de descuento"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={aplicar}
                  disabled={validando}
                  className="text-white px-4 py-2 text-sm font-medium btn-pill"
                  style={{ backgroundColor: colorMarca }}
                >
                  {validando ? "..." : "Aplicar"}
                </button>
              </div>
            )}
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>

          {/* Canje de puntos (solo logueados con saldo) */}
          {logueado && saldoPuntos > 0 && (
            <div className="border-t border-gray-100 pt-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Canjear puntos</span>
                <span className="text-xs text-gray-400">Saldo: {saldoPuntos.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={maxPuntos}
                  value={puntosAUsar || ""}
                  onChange={(e) => setPuntos(Number(e.target.value))}
                  placeholder="0"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={() => setPuntos(maxPuntos)}
                  className="border px-3 py-2 text-sm rounded-full text-gray-600 btn-pill whitespace-nowrap"
                >
                  Usar todo
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">1 punto = $1</p>
            </div>
          )}

          {/* Totales */}
          <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${total.toLocaleString("es-CL")}</span>
            </div>
            {montoDescuento > 0 && (
              <div className="flex justify-between" style={{ color: colorMarca }}>
                <span>Descuento</span>
                <span>-${montoDescuento.toLocaleString("es-CL")}</span>
              </div>
            )}
            {puntosEfectivos > 0 && (
              <div className="flex justify-between" style={{ color: colorMarca }}>
                <span>Puntos ({puntosEfectivos.toLocaleString("es-CL")})</span>
                <span>-${puntosEfectivos.toLocaleString("es-CL")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-1">
              <span>Total</span>
              <span>${totalFinal.toLocaleString("es-CL")}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block text-center text-white py-3 mt-4 font-medium btn-pill"
            style={{ backgroundColor: colorMarca }}
          >
            Continuar al envio
          </Link>
          <p className="text-xs text-gray-400 text-center mt-2">
            El total final se confirma en el checkout.
          </p>
        </>
      )}
    </aside>
  );
}