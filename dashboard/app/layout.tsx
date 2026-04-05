import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "King Hermes - Supreme Agent Orchestrator",
  description: "Real-time multi-agent dashboard with 3D visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050505] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
