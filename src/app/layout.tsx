import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Si-LATU — Sistem Pelacakan Audit Terpadu',
  description: 'Audit Progress Tracker berbasis PDCA — Inspektorat Kabupaten Sumba Barat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
