"use client";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { api } from "@/lib/api";
import type { Config } from "@/lib/config";
import type { MenuItem } from "@/app/page";

export default function ShellPublico({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    api<Config>("/content/config").then(setConfig).catch(() => {});
    api<MenuItem[]>("/content/menu").then(setMenu).catch(() => {});
  }, []);

  if (!config) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header config={config} menu={menu} />
      <div className="flex-1">{children}</div>
      <Footer config={config} />
    </div>
  );
}