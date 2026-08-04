"use client";
import { useState } from "react";
import { useCarritoLogica, CuerpoCarrito } from "./CarritoLateral";

export default function CarritoMovil({ colorMarca }: { colorMarca: string }) {
  const c = useCarritoLogica();
  const [abierto, setAbierto] = useState(false);
  const { cantidadTotal } = c.items.reduce(
    (acc, i) => ({ cantidadTotal: acc.cantidadTotal + i.cantidad }),
    { cantidadTotal: 0 },
  );

  // No mostrar la barra si el carrito esta vacio
  if (c.items.length === 0) return null;

  return (
    <>
      {/* Barra fija inferior (solo movil) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
        <button
          onClick={() => setAbierto(true)}
          className="w-full flex items-center justify-between rounded-2xl shadow-lg px-4 py-3 text-white"
          style={{ backgroundColor: colorMarca }}
        >
          <span className="flex items-center gap-2">
            <span className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
              <span className="absolute -top-2 -right-2 bg-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ color: colorMarca }}>
                {cantidadTotal}
              </span>
            </span>
            <span className="font-medium">Ver carrito</span>
          </span>
          <span className="font-bold">${c.totalFinal.toLocaleString("es-CL")}</span>
        </button>
      </div>

      {/* Bottom sheet */}
      {abierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setAbierto(false)} />
          {/* Hoja */}
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 animate-[subir_0.25s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tu carrito</h2>
              <button onClick={() => setAbierto(false)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none" aria-label="Cerrar">&times;</button>
            </div>
            {/* Handle visual */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto -mt-2 mb-4" />
            <CuerpoCarrito c={c} colorMarca={colorMarca} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes subir {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}