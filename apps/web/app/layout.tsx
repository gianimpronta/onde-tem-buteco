import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://onde-tem-buteco.vercel.app"),
  title: {
    default: "Onde Tem Buteco",
    template: "%s | Onde Tem Buteco",
  },
  description:
    "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Onde Tem Buteco",
    description:
      "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
    url: "/",
    siteName: "Onde Tem Buteco",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Onde Tem Buteco",
    description:
      "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
  },
};

const themeScript = `
  try {
    var t = localStorage.getItem('theme');
    var p = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && p)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
