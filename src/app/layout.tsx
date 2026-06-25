import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Si-LATU — Sistem Pelacakan Audit Terpadu',
  description: 'Audit Progress Tracker berbasis PDCA — Inspektorat Kabupaten Sumba Barat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </body>
    </html>
  );
}
