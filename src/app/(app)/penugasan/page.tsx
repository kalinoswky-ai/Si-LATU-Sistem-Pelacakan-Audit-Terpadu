import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  perencanaan:      { label: 'Perencanaan',    cls: 'badge-neutral' },
  entry_meeting:    { label: 'Entry Meeting',  cls: 'badge-neutral' },
  proses_lapangan:  { label: 'Proses Lapangan',cls: 'badge-warning' },
  draft_laporan:    { label: 'Draft Laporan',  cls: 'badge-danger'  },
  exit_meeting:     { label: 'Exit Meeting',   cls: 'badge-info'    },
  keberatan:        { label: 'Keberatan',      cls: 'badge-warning' },
  final:            { label: 'Final',          cls: 'badge-success' },
  tidak_dilanjutkan:{ label: 'Tidak Dilanjutkan', cls: 'badge-danger' },
  informasi_awal:   { label: 'Informasi Awal', cls: 'badge-neutral' },
  verifikasi:       { label: 'Verifikasi',     cls: 'badge-warning' },
  audit_lapangan:   { label: 'Audit Lapangan', cls: 'badge-warning' },
  gelar_perkara:    { label: 'Gelar Perkara',  cls: 'badge-warning' },
  laporan_hasil:    { label: 'Laporan Hasil',  cls: 'badge-danger'  },
  rekomendasi_tl:   { label: 'Rekomendasi TL', cls: 'badge-warning' },
  dihentikan:       { label: 'Dihentikan',     cls: 'badge-danger'  },
};
const JENIS_LABEL: Record<string, string> = {
  AUDIT_KEUANGAN:'Audit Keuangan', AUDIT_KINERJA:'Audit Kinerja',
  AUDIT_KETAATAN:'Audit Ketaatan', AUDIT_INVESTIGATIF:'Audit Investigatif',
};

export default async function PenugasanPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('audit_assignments')
    .select('id, jenis_audit, status_saat_ini, target_selesai, tahun, entities(nama,tipe), ketua:users!audit_assignments_ketua_tim_id_fkey(nama)')
    .order('created_at', { ascending: false });
  const rows = (data ?? []) as any[];

  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>Penugasan Audit</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Daftar seluruh penugasan audit tahun berjalan</p>
        </div>
        <Link href="/penugasan/baru" className="btn btn-gold" style={{fontSize:'0.8rem'}}>
          ＋ Buat Penugasan
        </Link>
      </div>
      <div className="page-content">
        <div className="card">
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entitas</th><th>Objek</th><th>Jenis Audit</th>
                  <th>Ketua Tim</th><th>Tahun</th><th>Status</th><th>Target</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={8} style={{textAlign:'center',padding:'2.5rem',color:'#8BA3BC'}}>
                    Belum ada penugasan. <Link href="/penugasan/baru" style={{color:'#2563EB'}}>Buat sekarang</Link>
                  </td></tr>
                )}
                {rows.map((r: any) => {
                  const b = STATUS_BADGE[r.status_saat_ini] ?? { label: r.status_saat_ini, cls: 'badge-neutral' };
                  return (
                    <tr key={r.id}>
                      <td style={{fontWeight:600}}>{r.entities?.nama ?? '—'}</td>
                      <td><span className="badge badge-info" style={{fontSize:'0.68rem'}}>{r.entities?.tipe}</span></td>
                      <td style={{color:'#4B6280'}}>{JENIS_LABEL[r.jenis_audit] ?? r.jenis_audit}</td>
                      <td style={{color:'#4B6280'}}>{r.ketua?.nama ?? '—'}</td>
                      <td style={{color:'#4B6280'}}>{r.tahun}</td>
                      <td><span className={`badge ${b.cls}`}>{b.label}</span></td>
                      <td style={{color:'#4B6280'}}>{r.target_selesai ?? '—'}</td>
                      <td>
                        <Link href={`/penugasan/${r.id}`} className="btn btn-outline"
                          style={{padding:'0.3rem 0.75rem',fontSize:'0.75rem'}}>Detail</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
