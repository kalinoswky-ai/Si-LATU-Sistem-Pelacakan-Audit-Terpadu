import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function LogAktivitasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('status_history')
    .select('id, status, changed_at, catatan, audit_assignments(id, entities(nama)), users(nama)')
    .order('changed_at', { ascending: false })
    .limit(100);
  const rows = (data ?? []) as any[];

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>📝 Log Aktivitas</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Riwayat seluruh perubahan status penugasan (100 terbaru)</p>
        </div>
      </div>
      <div className="page-content">
        <div className="card">
          {rows.length === 0 ? (
            <div className="card-body" style={{textAlign:'center',padding:'3rem',color:'#8BA3BC'}}>
              <p style={{margin:0}}>Belum ada aktivitas tercatat.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Waktu</th><th>Penugasan</th><th>Status Baru</th><th>Oleh</th><th>Catatan</th></tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{color:'#4B6280',whiteSpace:'nowrap',fontSize:'0.78rem'}}>
                      {new Date(r.changed_at).toLocaleString('id-ID')}
                    </td>
                    <td style={{fontWeight:500}}>{r.audit_assignments?.entities?.nama ?? '—'}</td>
                    <td><span className="badge badge-info" style={{fontSize:'0.7rem'}}>{r.status}</span></td>
                    <td style={{color:'#4B6280'}}>{r.users?.nama ?? 'sistem'}</td>
                    <td style={{color:'#4B6280',fontSize:'0.78rem'}}>{r.catatan ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
