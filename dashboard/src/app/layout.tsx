import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agent Swarm Dashboard - Supreme Control Center',
  description: 'Real-time agent swarm orchestration dashboard with 3D visualization',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
