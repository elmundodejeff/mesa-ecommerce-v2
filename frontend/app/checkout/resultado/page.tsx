"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCarrito } from "@/lib/carrito";

function ResultadoInner() {
  const params = useSearchParams();
  const estado = params.get("estado") ?? "pending";
  const { vaciar } = useCarrito();

  // Si el pago fue exitoso, recien aqui vaciamos el carrito y limpiamos
  // descuento y puntos guardados. Si fallo, se conservan para reintentar.
  useEffect(() => {
    if (estado === "success") {
      vaciar();
      localStorage.removeItem("mesa_descuento");
      localStorage.removeItem("mesa_puntos");
    }
  }, [estado, vaciar]);

  const config = {
    success: {
      titulo: "\u00A1Pago aprobado!",
      texto: "Tu compra se proces\u00F3 correctamente. Te enviaremos los detalles por correo.",
      color: "var(--color-marca)",
    },
    failure: {
      titulo: "Pago rechazado",
      texto: "No pudimos procesar tu pago. Tu carrito sigue disponible para reintentar.",
      color: "#dc2626",
    },
    pending: {
      titulo: "Pago pendiente",
      texto: "Tu pago est\u00E1 en proceso. Te avisaremos cuando se confirme.",
      color: "#d97706",
    },
  };

  const c = config[estado as keyof typeof config] ?? config.pending;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `color-mix(in srgb, ${c.color} 15%, transparent)` }}>
          {estado === "success" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : estado === "failure" ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{c.titulo}</h1>
        <p className="text-gray-500 text-sm mb-6">{c.texto}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/tienda" className="inline-block text-white px-6 py-2.5 btn-pill" style={{ backgroundColor: "var(--color-marca)" }}>
            Volver a la tienda
          </Link>
          {estado === "failure" && (
            <Link href="/checkout" className="inline-block border border-gray-200 px-6 py-2.5 rounded-full text-gray-600 hover:bg-gray-50">
              Reintentar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <ResultadoInner />
    </Suspense>
  );
}
