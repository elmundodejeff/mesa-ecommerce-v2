"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { obtenerToken } from "@/lib/auth";
import { useCarrito } from "@/lib/carrito";

interface Validacion { valido: boolean; tipo?: string; valor?: number; codigoId?: number; }
interface ResumenPuntos { saldo: number; }
interface DescuentoPersonal { codigoId: number; codigo: string; monto: number; }

const DESC_KEY = "mesa_descuento";
const PUNTOS_KEY = "mesa_puntos";

// Hook con toda la logica del carrito (compartido lateral/movil)
export function useCarritoLogica() {
  const { items, cambiarCantidad, quitar, total } = useCarrito();
  const [codigo, setCodigo] = useState("");
  const [aplicado, setAplicado] = useState<{ codigo: string; tipo: string; valor: number } | null>(null);
  const [validando, setValidando] = useState(false);
  const [error, setError] = useState("");
  const [logueado, setLogueado] = useState(false);
  const [saldoPuntos, setSaldoPuntos] = useState(0);
  const [puntosAUsar, setPuntosAUsar] = useState(0);
  const [personal, setPersonal] = useState<DescuentoPersonal | null>(null);

  useEffect(() => {
    const guardado = localStorage.getItem(DESC_KEY);
    if (guardado) { try { setAplicado(JSON.parse(guardado)); } catch { /* ignore */ } }
    const pg = localStorage.getItem(PUNTOS_KEY);
    if (pg) { const n = Number(pg); if (!isNaN(n)) setPuntosAUsar(n); }
    if (obtenerToken()) {
      setLogueado(true);
      api<ResumenPuntos>("/loyalty/me", { auth: true }).then((r) => setSaldoPuntos(r.saldo)).catch(() => setSaldoPuntos(0));
    }
  }, []);

  useEffect(() => {
    if (!logueado || total <= 0) { setPersonal(null); return; }
    api<DescuentoPersonal | null>(`/discounts/mi-descuento?subtotal=${total}`, { auth: true })
      .then((r) => setPersonal(r)).catch(() => setPersonal(null));
  }, [logueado, total]);

  async function aplicar() {
    if (!codigo.trim()) return;
    setError(""); setValidando(true);
    try {
      const r = await api<Validacion>(`/discounts/validar?codigo=${encodeURIComponent(codigo.trim().toUpperCase())}`);
      if (r.valido && r.tipo && r.valor !== undefined) {
        const dato = { codigo: codigo.trim().toUpperCase(), tipo: r.tipo, valor: r.valor };
        setAplicado(dato);
        localStorage.setItem(DESC_KEY, JSON.stringify(dato));
        setCodigo("");
      } else { setError("Código no válido"); }
    } catch (e) { setError(e instanceof Error ? e.message : "Código no válido"); }
    finally { setValidando(false); }
  }

  function quitarDescuento() {
    setAplicado(null);
    localStorage.removeItem(DESC_KEY);
    setError("");
  }

  const montoManual = aplicado
    ? aplicado.tipo === "porcentaje" ? Math.round(total * (aplicado.valor / 100)) : Math.min(aplicado.valor, total)
    : 0;
  const montoPersonal = personal ? Math.min(personal.monto, total) : 0;
  const usaPersonal = montoPersonal > montoManual;
  const montoDescuento = Math.max(montoManual, montoPersonal);
  const etiquetaDescuento = usaPersonal ? personal?.codigo ?? "Descuento" : aplicado?.codigo ?? "Descuento";
  const totalTrasDescuento = Math.max(0, total - montoDescuento);
  const maxPuntos = Math.min(saldoPuntos, totalTrasDescuento);
  const puntosEfectivos = Math.min(Math.max(0, puntosAUsar), maxPuntos);
  const totalFinal = Math.max(0, totalTrasDescuento - puntosEfectivos);

  function setPuntos(n: number) {
    const val = Math.min(Math.max(0, Math.floor(n)), maxPuntos);
    setPuntosAUsar(val);
    localStorage.setItem(PUNTOS_KEY, String(val));
  }

  return {
    items, cambiarCantidad, quitar, total,
    codigo, setCodigo, aplicado, aplicar, quitarDescuento, validando, error,
    logueado, saldoPuntos, puntosAUsar, setPuntos, maxPuntos,
    personal, montoPersonal, usaPersonal, montoDescuento, etiquetaDescuento,
    puntosEfectivos, totalFinal,
  };
}

type Logica = ReturnType<typeof useCarritoLogica>;

// Cuerpo del carrito, compartido por lateral y movil
export function CuerpoCarrito({ c, colorMarca }: { c: Logica; colorMarca: string }) {
  if (c.items.length === 0) {
    return <p className="text-sm text-gray-400 py-6 text-center">Tu carrito está vacío.</p>;
  }
  return (
    <>
      <div className="space-y-3 mb-4">
        {c.items.map((i) => (
          <div key={i.productoId} className="flex items-center gap-2 text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{i.nombre}</p>
              <p className="text-xs text-gray-400">${i.precio.toLocaleString("es-CL")} c/u</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => i.cantidad <= 1 ? c.quitar(i.productoId) : c.cambiarCantidad(i.productoId, i.cantidad - 1)} className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center" aria-label="Restar">&minus;</button>
              <span className="w-6 text-center">{i.cantidad}</span>
              <button onClick={() => c.cambiarCantidad(i.productoId, i.cantidad + 1)} disabled={i.stock != null && i.cantidad >= i.stock} className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Sumar" title={i.stock != null && i.cantidad >= i.stock ? "Máximo disponible" : ""}>+</button>
            </div>
            <span className="w-20 text-right font-medium text-gray-800">${(i.precio * i.cantidad).toLocaleString("es-CL")}</span>
            <button onClick={() => c.quitar(i.productoId)} className="text-gray-300 hover:text-red-500 ml-1" aria-label="Quitar">&times;</button>
          </div>
        ))}
      </div>

      {c.personal && c.montoPersonal > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: `${colorMarca}12` }}>
            <span className="font-medium" style={{ color: colorMarca }}>
              Descuento aplicado automáticamente
              <span className="text-xs ml-1 opacity-80">({c.personal.codigo})</span>
            </span>
          </div>
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 mb-3">
        {c.aplicado ? (
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
            <span className="font-medium text-gray-700">
              {c.aplicado.codigo}
              <span className="text-gray-400 ml-1">({c.aplicado.tipo === "porcentaje" ? `${c.aplicado.valor}%` : `$${c.aplicado.valor.toLocaleString("es-CL")}`})</span>
              {c.usaPersonal && <span className="text-xs text-amber-600 ml-2">(se usa el automático)</span>}
            </span>
            <button onClick={c.quitarDescuento} className="text-red-500 text-xs hover:underline">Quitar</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input value={c.codigo} onChange={(e) => c.setCodigo(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && c.aplicar()} placeholder="¿Tienes un código?" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            <button onClick={c.aplicar} disabled={c.validando} className="text-white px-4 py-2 text-sm font-medium btn-pill" style={{ backgroundColor: colorMarca }}>{c.validando ? "..." : "Aplicar"}</button>
          </div>
        )}
        {c.error && <p className="text-red-600 text-xs mt-1">{c.error}</p>}
      </div>

      {c.logueado && c.saldoPuntos > 0 && (
        <div className="border-t border-gray-100 pt-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Canjear puntos</span>
            <span className="text-xs text-gray-400">Saldo: {c.saldoPuntos.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex gap-2">
            <input type="number" min={0} max={c.maxPuntos} value={c.puntosAUsar || ""} onChange={(e) => c.setPuntos(Number(e.target.value))} placeholder="0" className="flex-1 border rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => c.setPuntos(c.maxPuntos)} className="border px-3 py-2 text-sm rounded-full text-gray-600 btn-pill whitespace-nowrap">Usar todo</button>
          </div>
          <p className="text-xs text-gray-400 mt-1">1 punto = $1</p>
        </div>
      )}

      <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${c.total.toLocaleString("es-CL")}</span></div>
        {c.montoDescuento > 0 && (
          <div className="flex justify-between" style={{ color: colorMarca }}>
            <span>Descuento ({c.etiquetaDescuento})</span><span>-${c.montoDescuento.toLocaleString("es-CL")}</span>
          </div>
        )}
        {c.puntosEfectivos > 0 && (
          <div className="flex justify-between" style={{ color: colorMarca }}>
            <span>Puntos ({c.puntosEfectivos.toLocaleString("es-CL")})</span><span>-${c.puntosEfectivos.toLocaleString("es-CL")}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg text-gray-900 pt-1"><span>Total</span><span>${c.totalFinal.toLocaleString("es-CL")}</span></div>
      </div>

      <Link href="/checkout" className="block text-center text-white py-3 mt-4 font-medium btn-pill" style={{ backgroundColor: colorMarca }}>
        Continuar al envío
      </Link>
      <p className="text-xs text-gray-400 text-center mt-2">El total final se confirma en el checkout.</p>
    </>
  );
}

// Carrito lateral (desktop)
export default function CarritoLateral({ colorMarca }: { colorMarca: string }) {
  const c = useCarritoLogica();
  return (
    <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tu carrito</h2>
      <CuerpoCarrito c={c} colorMarca={colorMarca} />
    </aside>
  );
}