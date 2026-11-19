import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAR na Mão — retificação do CAR pelo celular",
  description:
    "Módulos em código aberto que ajudam o pequeno produtor rural a entender e responder as notificações do Cadastro Ambiental Rural, com explicação em áudio e coleta de limites offline.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
