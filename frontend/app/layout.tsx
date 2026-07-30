import type { Metadata } from "next";
import { Poppins, Roboto, Inter, Montserrat, Lato } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito";
import { getConfig } from "@/lib/config";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-poppins" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--f-roboto" });
const inter = Inter({ subsets: ["latin"], variable: "--f-inter" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--f-montserrat" });
const lato = Lato({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-lato" });

const FUENTE_VAR: Record<string, string> = {
  Poppins: "var(--f-poppins)",
  Roboto: "var(--f-roboto)",
  Inter: "var(--f-inter)",
  Montserrat: "var(--f-montserrat)",
  Lato: "var(--f-lato)",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await getConfig();
    return {
      title: config.nombreSitio,
      description: `Tienda ${config.nombreSitio}`,
    };
  } catch {
    return { title: "Mesa", description: "Tienda de juegos de mesa" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let marca = "#D4537E";
  let header = "#4B1528";
  let headerTexto = "#FBEAF0";
  let fuente = "Poppins";
  try {
    const config = await getConfig();
    marca = config.colorMarca || marca;
    header = config.colorHeader || header;
    headerTexto = config.colorHeaderTexto || headerTexto;
    fuente = config.fuente || fuente;
  } catch {}

  const cssVars = {
    "--color-marca": marca,
    "--color-header": header,
    "--color-header-texto": headerTexto,
    "--font-activa": FUENTE_VAR[fuente] || FUENTE_VAR.Poppins,
  } as React.CSSProperties;

  const fontVars = `${poppins.variable} ${roboto.variable} ${inter.variable} ${montserrat.variable} ${lato.variable}`;

  return (
    <html
      lang="es"
      className={`${fontVars} h-full antialiased`}
      style={cssVars}
    >
      <body className="min-h-full flex flex-col">
        <CarritoProvider>{children}</CarritoProvider>
      </body>
    </html>
  );
}