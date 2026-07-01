import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_assignments')
    .select('id, jenis_audit, status_saat_ini, tahun, entities(nama), ketua:users!audit_assignments_ketua_tim_id_fkey(nama)')
    .eq('status_saat_ini', 'final')
    .order('created_at', { ascending: false });
  const rows = (data ?? []) as any[];

  const JENIS: Record<string, string> = {
    AUDIT_KEUANGAN:'Audit Keuangan', AUDIT_KINERJA:'Audit Kinerja',
    AUDIT_KETAATAN:'Audit Ketaatan', AUDIT_INVESTIGATIF:'Audit Investigatif',
  };

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>📄 Laporan & Cetak</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Penugasan berstatus Final siap dicetak sebagai LHP/LHAI</p>
        </div>
      </div>
      <div className="page-content">
        <div className="alert alert-info" style={{marginBottom:'1rem',borderRadius:'10px'}}>
          <span>ℹ</span>
          <span>Fitur cetak otomatis LHP/LHAI (PDF) akan tersedia di Iterasi 2. Saat ini halaman ini menampilkan daftar penugasan yang sudah berstatus Final.</span>
        </div>
        <div className="card">
          {rows.length === 0 ? (
            <div className="card-body" style={{textAlign:'center',padding:'3rem',color:'#8BA3BC'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📋</div>
              <p style={{margin:0,fontWeight:600,color:'#0D2137'}}>Belum ada laporan final</p>
              <p style={{margin:'0.25rem 0 0',fontSize:'0.8rem'}}>Penugasan yang statusnya mencapai Final akan muncul di sini</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Entitas</th><th>Jenis</th><th>Ketua Tim</th><th>Tahun</th><th>Dokumen</th></tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{fontWeight:600}}>{r.entities?.nama ?? '—'}</td>
                    <td>{JENIS[r.jenis_audit] ?? r.jenis_audit}</td>
                    <td style={{color:'#4B6280'}}>{r.ketua?.nama ?? '—'}</td>
                    <td style={{color:'#4B6280'}}>{r.tahun}</td>
                    <td>
                      <span className="badge badge-warning">
                        {r.jenis_audit === 'AUDIT_INVESTIGATIF' ? 'LHAI' : 'LHP'} — segera hadir
                      </span>
                    </td>
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
