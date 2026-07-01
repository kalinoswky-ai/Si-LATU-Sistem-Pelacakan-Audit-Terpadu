'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';

const NAV = [
  {
    section: 'Utama',
    items: [
      { href: '/', label: 'Beranda', icon: '⊞' },
      { href: '/penugasan', label: 'Penugasan Audit', icon: '📋' },
      { href: '/peringatan-dini', label: 'Peringatan Dini', icon: '⚠' },
      { href: '/rapat-pdca', label: 'Rapat PDCA', icon: '🔄' },
    ],
  },
  {
    section: 'Laporan',
    items: [
      { href: '/laporan', label: 'Laporan & Cetak', icon: '📄' },
      { href: '/log-aktivitas', label: 'Log Aktivitas', icon: '📝' },
    ],
  },
  {
    section: 'Administrasi',
    items: [
      { href: '/pengguna', label: 'Pengguna', icon: '👥' },
      { href: '/hak-akses', label: 'Hak Akses', icon: '🔐' },
      { href: '/pengaturan', label: 'Pengaturan', icon: '⚙' },
    ],
  },
];

export default function Sidebar({ userNama, userRole }: { userNama?: string; userRole?: string }) {
  const path = usePathname();

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    pimpinan: 'Pimpinan',
    ketua_tim: 'Ketua Tim',
    anggota_tim: 'Auditor',
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg,#C9973E,#F0C97A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0D2137' }}>I</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#fff', lineHeight: 1.2 }}>Si-LATU</p>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>
              Inspektorat Kab. Sumba Barat
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="nav-section">{group.section}</p>
            {group.items.map((item) => {
              const isActive = item.href === '/' ? path === '/' : path.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={isActive ? 'active' : ''}>
                  <span style={{ fontSize: '0.9rem', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer user info */}
      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.5rem', padding: '0.5rem 0.25rem' }}>
          <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {userNama ?? 'Pengguna'}
          </p>
          <p style={{ margin: 0, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>
            {roleLabel[userRole ?? ''] ?? userRole ?? '—'}
          </p>
        </div>
        <form action={logout}>
          <button type="submit" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
            padding: '0.45rem 0.75rem', borderRadius: '7px', border: 'none',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.55)',
            fontSize: '0.78rem', cursor: 'pointer',
          }}>
            <span>🚪</span> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
