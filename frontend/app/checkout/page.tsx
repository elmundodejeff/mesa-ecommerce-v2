import { getConfig } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutCliente from "@/components/CheckoutCliente";
import type { MenuItem } from "@/app/page";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getMenu(): Promise<MenuItem[]> {
  try {
    const res = await fetch(`${BASE}/content/menu`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CheckoutPage() {
  const [config, menu] = await Promise.all([getConfig(), getMenu()]);
  return (
    <>
      <Header config={config} menu={menu} />
      <CheckoutCliente />
      <Footer config={config} />
    </>
  );
}