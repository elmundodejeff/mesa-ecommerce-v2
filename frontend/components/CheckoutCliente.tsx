"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { obtenerToken } from "@/lib/auth";
import { useCarrito } from "@/lib/carrito";

interface OrdenResp {
  id: number;
  total: number;
  subtotal: number;
  descuentoMonto: number;
  descuentoCodigo: string | null;
  puntosUsados: number;
  puntosGanados: number;
  avisoDescuento: string | null;
  avisoPuntos: string | null;
}

interface LoyaltyResp { saldo: number; }

interface Direccion {
  id: string;
  alias: string;
  calle: string;
  ciudad: string;
  region: string;
  comuna?: string | null;
  esPrincipal: boolean;
}

interface Perfil {
  nombre: string | null;
  telefono: string | null;
  rut: string | null;
}

interface Validacion {
  valido: boolean;
  tipo?: string;
  valor?: number;
}

interface DescuentoPersonal {
  codigoId: number;
  codigo: string;
  monto: number;
}

interface OpcionEnvio {
  servicio: string;
  codigo: number;
  precio: number;
  pesoFinal: string;
}

export default function CheckoutCliente() {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCarrito();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [region, setRegion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nota, setNota] = useState("");
  const [codigo, setCodigo] = useState("");
  const [puntosAUsar, setPuntosAUsar] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [orden, setOrden] = useState<OrdenResp | null>(null);

  const [logueado, setLogueado] = useState(false);
  const [saldoPuntos, setSaldoPuntos] = useState<number | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [dirSeleccionada, setDirSeleccionada] = useState<string>("nueva");

  // Descuento
  const [aplicado, setAplicado] = useState<{ codigo: string; tipo: string; valor: number } | null>(null);
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [errorCodigo, setErrorCodigo] = useState("");
  const [personal, setPersonal] = useState<DescuentoPersonal | null>(null);

  // Envio (Chilexpress)
  const [comuna, setComuna] = useState("");
  const [regionCodigo, setRegionCodigo] = useState("");
  const [regiones, setRegiones] = useState<{ codigo: string; nombre: string }[]>([]);
  const [comunasDisp, setComunasDisp] = useState<{ codigo: string; nombre: string }[]>([]);
  const [pendienteComuna, setPendienteComuna] = useState<{ region: string; comuna: string } | null>(null);
  const [opcionesEnvio, setOpcionesEnvio] = useState<OpcionEnvio[]>([]);
  const [envioElegido, setEnvioElegido] = useState<OpcionEnvio | null>(null);
  const [cotizandoEnvio, setCotizandoEnvio] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");

  // Pre-cargar codigo y puntos del carrito lateral
  useEffect(() => {
    const guardado = localStorage.getItem("mesa_descuento");
    if (guardado) {
      try {
        const d = JSON.parse(guardado);
        if (d.codigo && d.tipo && d.valor !== undefined) setAplicado(d);
      } catch { /* ignore */ }
    }
    const p = localStorage.getItem("mesa_puntos");
    if (p) {
      const n = Number(p);
      if (!isNaN(n) && n > 0) setPuntosAUsar(String(n));
    }
  }, []);

  // Cargar perfil, puntos y direcciones si esta logueado
  useEffect(() => {
    const token = obtenerToken();
    if (!token) return;
    setLogueado(true);
    api<LoyaltyResp>("/loyalty/me", { auth: true }).then((r) => setSaldoPuntos(r.saldo)).catch(() => setSaldoPuntos(null));
    api<Perfil>("/users/me", { auth: true }).then((u) => {
      if (u.nombre) setNombre(u.nombre);
      if (u.telefono) setTelefono(u.telefono);
    }).catch(() => {});
    api<Direccion[]>("/users/me/direcciones", { auth: true }).then((dirs) => {
      setDirecciones(dirs);
      const principal = dirs.find((d) => d.esPrincipal) || dirs[0];
      if (principal) {
        setDirSeleccionada(principal.id);
        setDireccion(principal.calle);
        setCiudad(principal.ciudad);
        setRegion(principal.region);
        setPendienteComuna({ region: principal.region, comuna: principal.comuna || "" });
      }
    }).catch(() => {});
  }, []);

  // Descuento personal automatico
  useEffect(() => {
    if (!logueado || total <= 0) { setPersonal(null); return; }
    api<DescuentoPersonal | null>(`/discounts/mi-descuento?subtotal=${total}`, { auth: true })
      .then(setPersonal).catch(() => setPersonal(null));
  }, [logueado, total]);

  // Aplica region + comuna de una direccion guardada: resuelve el codigo de region,
  // carga sus comunas, y recien ahi setea la comuna (para que el select la encuentre).
  async function aplicarRegionComuna(nombreRegion: string, nombreComuna: string) {
    // Reset total: al cambiar de direccion nunca debe quedar la region/comuna anterior.
    setOpcionesEnvio([]);
    setEnvioElegido(null);
    setComuna("");
    setComunasDisp([]);
    setRegionCodigo("");

    const r = nombreRegion ? regiones.find((x) => x.nombre === nombreRegion) : null;
    if (!r) {
      // Direccion sin region valida: dropdowns quedan vacios, el cliente debe elegir.
      setRegion("");
      return;
    }
    setRegion(nombreRegion);
    setRegionCodigo(r.codigo);
    try {
      const cs = await api<{ codigo: string; nombre: string }[]>(`/shipping/comunas?region=${r.codigo}`);
      setComunasDisp(cs);
      // Solo setear la comuna si existe en la lista (evita valores fantasma).
      if (nombreComuna && cs.some((c) => c.nombre === nombreComuna)) {
        setComuna(nombreComuna);
      }
    } catch {
      setComunasDisp([]);
    }
  }

  function elegirDireccion(id: string) {
    setDirSeleccionada(id);
    if (id === "nueva") {
      setDireccion(""); setCiudad(""); setRegion(""); setComuna(""); setOpcionesEnvio([]); setEnvioElegido(null);
      return;
    }
    const d = direcciones.find((x) => x.id === id);
    if (d) { setDireccion(d.calle); setCiudad(d.ciudad); aplicarRegionComuna(d.region, d.comuna || ""); }
  }

  async function aplicarCodigo() {
    if (!codigo.trim()) return;
    setErrorCodigo("");
    setValidandoCodigo(true);
    try {
      const r = await api<Validacion>(`/discounts/validar?codigo=${encodeURIComponent(codigo.trim().toUpperCase())}`);
      if (r.valido && r.tipo && r.valor !== undefined) {
        const dato = { codigo: codigo.trim().toUpperCase(), tipo: r.tipo, valor: r.valor };
        setAplicado(dato);
        localStorage.setItem("mesa_descuento", JSON.stringify(dato));
        setCodigo("");
      } else {
        setErrorCodigo("Código no válido");
      }
    } catch (e) {
      setErrorCodigo(e instanceof Error ? e.message : "Código no válido");
    } finally {
      setValidandoCodigo(false);
    }
  }

  function quitarCodigo() {
    setAplicado(null);
    localStorage.removeItem("mesa_descuento");
    setErrorCodigo("");
  }

  // Calculo de totales (mismo criterio que el backend: gana el de mayor ahorro)
  const montoManual = aplicado
    ? aplicado.tipo === "porcentaje"
      ? Math.round(total * (aplicado.valor / 100))
      : Math.min(aplicado.valor, total)
    : 0;
  const montoPersonal = personal ? Math.min(personal.monto, total) : 0;
  const usaPersonal = montoPersonal > montoManual;
  const montoDescuento = Math.max(montoManual, montoPersonal);
  const etiquetaDescuento = usaPersonal ? personal?.codigo : aplicado?.codigo;

  const totalTrasDescuento = Math.max(0, total - montoDescuento);
  const maxPuntos = Math.min(saldoPuntos ?? 0, totalTrasDescuento);
  const puntosNum = Math.min(Math.max(0, Number(puntosAUsar) || 0), maxPuntos);
  useEffect(() => {
    api<{ codigo: string; nombre: string }[]>("/shipping/regiones")
      .then(setRegiones)
      .catch(() => {});
  }, []);

  // Cuando las regiones ya cargaron y hay una comuna pendiente (de la direccion principal),
  // aplicarla ahora que si podemos resolver el codigo de region.
  useEffect(() => {
    if (pendienteComuna && regiones.length > 0) {
      aplicarRegionComuna(pendienteComuna.region, pendienteComuna.comuna);
      setPendienteComuna(null);
    }
  }, [pendienteComuna, regiones]);

  async function cargarComunasDeRegion(codigo: string, nombreRegion: string) {
    setRegionCodigo(codigo);
    setRegion(nombreRegion);
    setComuna("");
    setComunasDisp([]);
    setOpcionesEnvio([]);
    setEnvioElegido(null);
    if (!codigo) return;
    try {
      const cs = await api<{ codigo: string; nombre: string }[]>(`/shipping/comunas?region=${codigo}`);
      setComunasDisp(cs);
    } catch {
      setComunasDisp([]);
    }
  }

  async function cotizarEnvio() {
    if (!comuna.trim()) {
      setErrorEnvio("Ingresa tu comuna");
      return;
    }
    setErrorEnvio("");
    setCotizandoEnvio(true);
    setOpcionesEnvio([]);
    setEnvioElegido(null);
    try {
      const ops = await api<OpcionEnvio[]>("/shipping/cotizar-carrito", {
        method: "POST",
        body: {
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
          comunaDestino: comuna.trim(),
        },
      });
      if (ops.length === 0) {
        setErrorEnvio("No hay envio disponible para esa comuna");
      } else {
        setOpcionesEnvio(ops);
        setEnvioElegido(ops[0]); // preseleccionar la primera (mas barata suele venir primero)
      }
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : "No se pudo cotizar el envio");
    } finally {
      setCotizandoEnvio(false);
    }
  }

  const costoEnvio = envioElegido?.precio ?? 0;
  const totalFinal = Math.max(0, totalTrasDescuento - puntosNum) + costoEnvio;

  async function pagar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const resp = await api<OrdenResp>("/orders/checkout", {
        method: "POST",
        auth: true,
        body: {
          items: items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad })),
          nombreEnvio: nombre || undefined,
          direccionEnvio: direccion || undefined,
          ciudadEnvio: ciudad || undefined,
          regionEnvio: region || undefined,
          telefonoEnvio: telefono || undefined,
          notaEntrega: nota || undefined,
          codigo: aplicado?.codigo || undefined,
          puntosAUsar: puntosNum || undefined,
          comunaEnvio: comuna || undefined,
          servicioEnvioCodigo: envioElegido?.codigo || undefined,
        },
      });
      // Crear preferencia de pago en MercadoPago y redirigir.
      // NO vaciamos el carrito aqui: si el pago falla o se abandona, el carrito
      // se mantiene para reintentar. Se vacia al volver con pago exitoso.
      const pref = await api<{ initPoint: string; sandboxInitPoint: string }>(
        `/payments/preferencia/${resp.id}`,
        { method: "POST" }
      );
      const url = pref.sandboxInitPoint || pref.initPoint;
      if (!url) {
        throw new Error("No se pudo iniciar el pago");
      }
      window.location.href = url;
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar");
      setCargando(false);
    }
  }

  // --- Confirmacion ---
  if (orden) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--color-marca) 15%, transparent)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-marca)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">¡Orden #{orden.id} confirmada!</h1>
          <p className="text-gray-500 text-sm mb-6">Gracias por tu compra.</p>
          <div className="text-left space-y-1.5 text-sm bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${orden.subtotal.toLocaleString("es-CL")}</span></div>
            {orden.descuentoMonto > 0 && (
              <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                <span>Descuento ({orden.descuentoCodigo})</span>
                <span>-${orden.descuentoMonto.toLocaleString("es-CL")}</span>
              </div>
            )}
            {orden.puntosUsados > 0 && (
              <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                <span>Puntos canjeados</span>
                <span>-${orden.puntosUsados.toLocaleString("es-CL")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>Total</span><span>${orden.total.toLocaleString("es-CL")}</span>
            </div>
          </div>
          {orden.puntosGanados > 0 && (
            <p className="text-sm mt-4" style={{ color: "var(--color-marca)" }}>
              Ganaste {orden.puntosGanados.toLocaleString("es-CL")} puntos con esta compra.
            </p>
          )}
          {(orden.avisoDescuento || orden.avisoPuntos) && (
            <div className="mt-3 text-amber-600 text-sm">
              {orden.avisoDescuento && <p>Descuento: {orden.avisoDescuento}</p>}
              {orden.avisoPuntos && <p>Puntos: {orden.avisoPuntos}</p>}
            </div>
          )}
          <Link href="/tienda" className="inline-block mt-6 text-white px-6 py-2.5 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  // --- Checkout ---
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-sm hover:underline" style={{ color: "var(--color-marca)" }}>
          &larr; Seguir comprando
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-6">Checkout</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">Tu carrito está vacío.</p>
            <Link href="/tienda" className="inline-block mt-4 text-white px-6 py-2.5 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
              Ir a la tienda
            </Link>
          </div>
        ) : (
          <form onSubmit={pagar} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* IZQUIERDA: formulario */}
            <div className="lg:col-span-2 space-y-6">
              {!logueado && (
                <div className="rounded-xl p-3 text-sm border border-gray-200 bg-white">
                  Compras como invitado.{" "}
                  <Link href="/login" className="underline font-medium" style={{ color: "var(--color-marca)" }}>Inicia sesión</Link>{" "}
                  para usar tus direcciones, ganar y canjear puntos.
                </div>
              )}

              {/* Entrega */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Datos de entrega</h2>

                {logueado && direcciones.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tus direcciones</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {direcciones.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => elegirDireccion(d.id)}
                          className={`text-left rounded-xl border p-3 transition ${dirSeleccionada === d.id ? "ring-2" : "hover:bg-gray-50"}`}
                          style={dirSeleccionada === d.id ? { borderColor: "var(--color-marca)", ["--tw-ring-color" as string]: "var(--color-marca)" } : {}}
                        >
                          <p className="text-sm font-medium text-gray-800">{d.alias}{d.esPrincipal && <span className="text-xs ml-1" style={{ color: "var(--color-marca)" }}>· Principal</span>}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{d.calle}, {d.ciudad}</p>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => elegirDireccion("nueva")}
                        className={`text-left rounded-xl border border-dashed p-3 transition ${dirSeleccionada === "nueva" ? "ring-2" : "hover:bg-gray-50"}`}
                        style={dirSeleccionada === "nueva" ? { borderColor: "var(--color-marca)", ["--tw-ring-color" as string]: "var(--color-marca)" } : {}}
                      >
                        <p className="text-sm font-medium text-gray-600">+ Usar otra dirección</p>
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input value={direccion} onChange={(e) => { setDireccion(e.target.value); setDirSeleccionada("nueva"); }} placeholder="Calle y número" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                    <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                    <select value={regionCodigo} onChange={(e) => { const r = regiones.find((x) => x.codigo === e.target.value); cargarComunasDeRegion(e.target.value, r?.nombre || ""); }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white">
                      <option value="">Selecciona region</option>
                      {regiones.map((r) => <option key={r.codigo} value={r.codigo}>{r.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                    <select value={comuna} onChange={(e) => { setComuna(e.target.value); setOpcionesEnvio([]); setEnvioElegido(null); }} disabled={comunasDisp.length === 0} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white disabled:opacity-50">
                      <option value="">{comunasDisp.length === 0 ? "Elige region primero" : "Selecciona comuna"}</option>
                      {comunasDisp.map((c) => <option key={c.codigo} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 ..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota de entrega (opcional)</label>
                    <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: dejar en conserjería" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
                  </div>
                </div>
              </section>

              {/* Descuentos y puntos */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Descuentos y puntos</h2>

                {personal && montoPersonal > 0 && (
                  <div className="rounded-xl px-3 py-2 text-sm" style={{ backgroundColor: "color-mix(in srgb, var(--color-marca) 10%, transparent)" }}>
                    <span className="font-medium" style={{ color: "var(--color-marca)" }}>
                      Tienes un descuento automático ({personal.codigo})
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código de descuento</label>
                  {aplicado ? (
                    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 text-sm">
                      <span className="font-medium text-gray-700">
                        {aplicado.codigo}
                        <span className="text-gray-400 ml-1">({aplicado.tipo === "porcentaje" ? `${aplicado.valor}%` : `$${aplicado.valor.toLocaleString("es-CL")}`})</span>
                        {usaPersonal && <span className="text-xs text-amber-600 ml-2">(se usa el automático)</span>}
                      </span>
                      <button type="button" onClick={quitarCodigo} className="text-red-500 text-xs hover:underline">Quitar</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); aplicarCodigo(); } }}
                        placeholder="Ingresa un código"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                      <button type="button" onClick={aplicarCodigo} disabled={validandoCodigo} className="text-white px-5 py-2.5 text-sm btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
                        {validandoCodigo ? "..." : "Aplicar"}
                      </button>
                    </div>
                  )}
                  {errorCodigo && <p className="text-red-600 text-xs mt-1">{errorCodigo}</p>}
                </div>

                {logueado && (saldoPuntos ?? 0) > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Canjear puntos <span className="text-gray-400 font-normal">(saldo: {saldoPuntos?.toLocaleString("es-CL")})</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number" min={0} max={maxPuntos}
                        value={puntosAUsar}
                        onChange={(e) => setPuntosAUsar(e.target.value)}
                        placeholder="0"
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                      />
                      <button type="button" onClick={() => setPuntosAUsar(String(maxPuntos))} className="border border-gray-200 px-4 py-2.5 text-sm rounded-full text-gray-600 whitespace-nowrap hover:bg-gray-50">
                        Usar todo
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">1 punto = $1 de descuento</p>
                  </div>
                )}
              </section>

              {/* Envio */}
              <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Envio</h2>
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Calcula el despacho para tu comuna{comuna ? `: ${comuna}` : " (ingresala en Datos de entrega)"}.
                  </p>
                  <button type="button" onClick={cotizarEnvio} disabled={cotizandoEnvio || !comuna.trim()} className="text-white px-5 py-2.5 text-sm btn-pill disabled:opacity-50" style={{ backgroundColor: "var(--color-marca)" }}>
                    {cotizandoEnvio ? "Calculando..." : "Calcular envio"}
                  </button>
                  {errorEnvio && <p className="text-red-600 text-xs mt-1">{errorEnvio}</p>}
                </div>

                {opcionesEnvio.length > 0 && (
                  <div className="space-y-2">
                    {opcionesEnvio.map((op) => (
                      <button
                        key={op.codigo}
                        type="button"
                        onClick={() => setEnvioElegido(op)}
                        className={`w-full text-left rounded-xl border p-3 transition flex justify-between items-center ${envioElegido?.codigo === op.codigo ? "ring-2" : "hover:bg-gray-50"}`}
                        style={envioElegido?.codigo === op.codigo ? { borderColor: "var(--color-marca)", ["--tw-ring-color" as string]: "var(--color-marca)" } : {}}
                      >
                        <span className="text-sm font-medium text-gray-800">{op.servicio}</span>
                        <span className="text-sm font-semibold text-gray-900">${op.precio.toLocaleString("es-CL")}</span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* DERECHA: resumen sticky */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Resumen</h2>
                <div className="space-y-3 mb-4 max-h-56 overflow-y-auto">
                  {items.map((i) => (
                    <div key={i.productoId} className="flex items-center gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{i.nombre}</p>
                        <p className="text-xs text-gray-400">${i.precio.toLocaleString("es-CL")} c/u</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => i.cantidad <= 1 ? quitar(i.productoId) : cambiarCantidad(i.productoId, i.cantidad - 1)} className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center">&minus;</button>
                        <span className="w-6 text-center">{i.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(i.productoId, i.cantidad + 1)} className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center">+</button>
                      </div>
                      <span className="w-20 text-right font-medium text-gray-800">${(i.precio * i.cantidad).toLocaleString("es-CL")}</span>
                      <button type="button" onClick={() => quitar(i.productoId)} className="text-gray-300 hover:text-red-500" aria-label="Quitar">&times;</button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>${total.toLocaleString("es-CL")}</span></div>
                  {montoDescuento > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                      <span>Descuento ({etiquetaDescuento})</span>
                      <span>-${montoDescuento.toLocaleString("es-CL")}</span>
                    </div>
                  )}
                  {puntosNum > 0 && (
                    <div className="flex justify-between" style={{ color: "var(--color-marca)" }}>
                      <span>Puntos ({puntosNum.toLocaleString("es-CL")})</span>
                      <span>-${puntosNum.toLocaleString("es-CL")}</span>
                    </div>
                  )}
                  {envioElegido && (
                    <div className="flex justify-between text-gray-500">
                      <span>Envio ({envioElegido.servicio})</span>
                      <span>${costoEnvio.toLocaleString("es-CL")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg text-gray-900 pt-1">
                    <span>Total</span><span>${totalFinal.toLocaleString("es-CL")}</span>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

                <button type="submit" disabled={cargando || !envioElegido} className="w-full text-white py-3 mt-4 btn-pill font-medium disabled:opacity-50" style={{ backgroundColor: "var(--color-marca)" }}>
                  {cargando ? "Procesando..." : !envioElegido ? "Calcula el envio para continuar" : "Pagar"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}