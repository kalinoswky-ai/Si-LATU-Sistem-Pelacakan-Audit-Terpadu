import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrator', pimpinan: 'Pimpinan',
  ketua_tim: 'Ketua Tim', anggota_tim: 'Anggota Tim',
};
const ROLE_BADGE: Record<string, string> = {
  admin: 'badge-danger', pimpinan: 'badge-info',
  ketua_tim: 'badge-warning', anggota_tim: 'badge-neutral',
};

export default async function PenggunaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('users').select('*').order('nama');
  const rows = (data ?? []) as any[];

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>👥 Pengguna</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Manajemen akun pengguna Si-LATU</p>
        </div>
      </div>
      <div className="page-content">
        <div className="alert alert-info" style={{marginBottom:'1rem',borderRadius:'10px'}}>
          <span>ℹ</span>
          <span>Untuk menambah pengguna baru: buka <strong>Supabase → Authentication → Users → Add user</strong>, lalu jalankan query SQL insert ke tabel <code>users</code> dengan User UID yang disalin dari sana.</span>
        </div>
        <div className="card">
          <table className="data-table">
            <thead>
              <tr><th>Nama</th><th>Email</th><th>NIP</th><th>Peran</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4} style={{textAlign:'center',padding:'2rem',color:'#8BA3BC'}}>
                  Belum ada data pengguna.
                </td></tr>
              )}
              {rows.map((u: any) => (
                <tr key={u.id}>
                  <td style={{fontWeight:600}}>{u.nama}</td>
                  <td style={{color:'#4B6280'}}>{u.email}</td>
                  <td style={{color:'#4B6280'}}>{u.nip ?? '—'}</td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] ?? 'badge-neutral'}`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
