import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RapatPdcaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('pdca_meetings')
    .select('*, meeting_items(id)')
    .order('tanggal', { ascending: false });
  const rows = data ?? [];

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>🔄 Rapat PDCA</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Riwayat rapat evaluasi siklus PDCA</p>
        </div>
        <Link href="/rapat-pdca/baru" className="btn btn-gold" style={{fontSize:'0.8rem'}}>
          ＋ Catat Rapat
        </Link>
      </div>
      <div className="page-content">
        <div className="card">
          {rows.length === 0 ? (
            <div className="card-body" style={{textAlign:'center',padding:'3rem',color:'#8BA3BC'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📋</div>
              <p style={{margin:0,fontWeight:600,fontSize:'0.9rem',color:'#0D2137'}}>Belum ada rapat tercatat</p>
              <p style={{margin:'0.25rem 0 0',fontSize:'0.8rem'}}>Klik "Catat Rapat" untuk mulai merekam evaluasi PDCA berkala</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Tanggal</th><th>Tempat</th><th>Waktu</th><th>Item Dibahas</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((r: any) => (
                  <tr key={r.id}>
                    <td style={{fontWeight:600}}>{r.tanggal}</td>
                    <td style={{color:'#4B6280'}}>{r.tempat ?? '—'}</td>
                    <td style={{color:'#4B6280'}}>{r.waktu ?? '—'}</td>
                    <td><span className="badge badge-info">{r.meeting_items?.length ?? 0} item</span></td>
                    <td>
                      <Link href={`/rapat-pdca/${r.id}`} className="btn btn-outline"
                        style={{padding:'0.3rem 0.75rem',fontSize:'0.75rem'}}>Detail</Link>
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
