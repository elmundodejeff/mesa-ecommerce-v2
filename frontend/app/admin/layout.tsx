"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerToken, borrarToken } from "@/lib/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!obtenerToken()) {
      router.replace("/login");
    } else {
      setOk(true);
    }
  }, [router]);

  function salir() {
    borrarToken();
    router.replace("/login");
  }

  if (!ok) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-emerald-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-lg">Mesa - Admin</h1>
          <nav className="flex gap-4 text-sm">
            <a href="/admin" className="hover:underline">
              Productos
            </a>
            <a href="/admin/ordenes" className="hover:underline">
              Ordenes
            </a>
          </nav>
        </div>
        <button onClick={salir} className="text-sm hover:underline">
          Salir
        </button>
      </header>
      <main className="p-6 max-w-5xl mx-auto">{children}</main>
    </div>
  );
}