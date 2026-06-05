import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Sign — Электронное подписание",
  description: "Система персональных лендингов для подписания договоров",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
