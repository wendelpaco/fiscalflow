import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import ReactQueryProvider from "@/components/ReactQueryProvider";

export const metadata: Metadata = {
  title: "FiscalFlow",
  description: "Gerencie sua fila de processamento de notas fiscais NFCe.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* SEO & Open Graph Meta Tags */}
        <meta
          name="description"
          content="Gerencie sua fila de processamento de notas fiscais NFCe."
        />
        <meta property="og:title" content="FiscalFlow" />
        <meta
          property="og:description"
          content="Gerencie sua fila de processamento de notas fiscais NFCe."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fiscalflow.com.br/" />
        <meta property="og:image" content="/favicon.svg" />
        <meta property="og:locale" content="pt_BR" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="FiscalFlow" />
        <meta
          name="twitter:description"
          content="Gerencie sua fila de processamento de notas fiscais NFCe."
        />
        <meta name="twitter:image" content="/favicon.svg" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ReactQueryProvider>
          <div className="relative flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1 container py-8">{children}</main>
          </div>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
