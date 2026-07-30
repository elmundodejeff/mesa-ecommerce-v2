"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CarritoCtx {
  items: ItemCarrito[];
  agregar: (p: Omit<ItemCarrito, "cantidad">) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: number;
  cantidadTotal: number;
}

const Ctx = createContext<CarritoCtx | null>(null);
const KEY = "mesa_carrito";

export function CarritoProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);

  useEffect(() => {
    const guardado = localStorage.getItem(KEY);
    if (guardado) {
      try {
        setItems(JSON.parse(guardado));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  function agregar(p: Omit<ItemCarrito, "cantidad">) {
    setItems((prev) => {
      const existe = prev.find((i) => i.productoId === p.productoId);
      if (existe) {
        return prev.map((i) =>
          i.productoId === p.productoId
            ? { ...i, cantidad: i.cantidad + 1 }
            : i,
        );
      }
      return [...prev, { ...p, cantidad: 1 }];
    });
  }

  function quitar(productoId: number) {
    setItems((prev) => prev.filter((i) => i.productoId !== productoId));
  }

  function cambiarCantidad(productoId: number, cantidad: number) {
    if (cantidad < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.productoId === productoId ? { ...i, cantidad } : i,
      ),
    );
  }

  function vaciar() {
    setItems([]);
  }

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const cantidadTotal = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <Ctx.Provider
      value={{
        items,
        agregar,
        quitar,
        cambiarCantidad,
        vaciar,
        total,
        cantidadTotal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCarrito fuera de CarritoProvider");
  return ctx;
}