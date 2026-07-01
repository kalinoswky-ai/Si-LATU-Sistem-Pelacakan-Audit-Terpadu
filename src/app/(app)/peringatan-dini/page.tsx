import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PeringatanDiniPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('v_peringatan_dini')
    .select('*');
  const rows = (data ?? []).filter((r: any) => r.tipe_peringatan);

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>⚠ Peringatan Dini</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Penugasan yang memerlukan perhatian segera</p>
        </div>
      </div>
      <div className="page-content">
        {rows.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{textAlign:'center',padding:'3rem',color:'#8BA3BC'}}>
              <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>✅</div>
              <p style={{margin:0,fontWeight:600,fontSize:'0.9rem',color:'#0D2137'}}>Tidak ada peringatan aktif</p>
              <p style={{margin:'0.25rem 0 0',fontSize:'0.8rem'}}>Semua penugasan berjalan sesuai jadwal</p>
            </div>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {rows.map((r: any) => (
              <div key={r.assignment_id}
                className={`alert ${r.tipe_peringatan === 'lewat_target' ? 'alert-danger' : 'alert-warning'}`}
                style={{borderRadius:'10px',padding:'1rem 1.25rem'}}>
                <span style={{fontSize:'1.2rem'}}>
                  {r.tipe_peringatan === 'lewat_target' ? '🚨' : '⏸'}
                </span>
                <div style={{flex:1}}>
                  <p style={{margin:'0 0 2px',fontWeight:600,fontSize:'0.875rem'}}>{r.entitas}</p>
                  <p style={{margin:0,fontSize:'0.8rem'}}>
                    {r.tipe_peringatan === 'lewat_target'
                      ? `Melewati target selesai (${r.target_selesai}) — status: ${r.status_saat_ini}`
                      : `Status tidak berubah lebih dari 14 hari — status: ${r.status_saat_ini}`}
                  </p>
                </div>
                <Link href={`/penugasan/${r.assignment_id}`}
                  className="btn btn-outline" style={{padding:'0.35rem 0.85rem',fontSize:'0.75rem',whiteSpace:'nowrap'}}>
                  Tindak lanjut
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
