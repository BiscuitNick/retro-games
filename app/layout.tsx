import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retro Games",
  description: "A nostalgic web-based arcade featuring 10 classic retro games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
