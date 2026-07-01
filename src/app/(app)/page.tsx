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
  AUDIT_KEUANGAN:    'Audit Keuangan',
  AUDIT_KINERJA:     'Audit Kinerja',
  AUDIT_KETAATAN:    'Audit Ketaatan',
  AUDIT_INVESTIGATIF:'Audit Investigatif',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: assignments }, { data: issues }] = await Promise.all([
    supabase.from('audit_assignments').select(
      'id, jenis_audit, status_saat_ini, target_selesai, entities(nama, tipe), ketua:users!audit_assignments_ketua_tim_id_fkey(nama)'
    ).order('created_at', { ascending: false }),
    supabase.from('issues').select('id, status'),
  ]);

  const rows = assignments ?? [];
  const allIssues = issues ?? [];

  const total       = rows.length;
  const aktif       = rows.filter(r => !['final','tidak_dilanjutkan','dihentikan'].includes(r.status_saat_ini)).length;
  const selesai     = rows.filter(r => r.status_saat_ini === 'final').length;
  const isuTerbuka  = allIssues.filter(i => i.status === 'open').length;

  const byJenis = ['AUDIT_KEUANGAN','AUDIT_KINERJA','AUDIT_KETAATAN','AUDIT_INVESTIGATIF'].map(j => ({
    jenis: j,
    label: JENIS_LABEL[j],
    count: rows.filter(r => r.jenis_audit === j).length,
  }));

  const today = new Date();
  const terlambat = rows.filter(r => {
    if (!r.target_selesai) return false;
    if (['final','tidak_dilanjutkan','dihentikan'].includes(r.status_saat_ini)) return false;
    return new Date(r.target_selesai) < today;
  }).length;

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>Dashboard Pengawasan</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Inspektorat Kabupaten Sumba Barat — Data real-time</p>
        </div>
        <Link href="/penugasan/baru" className="btn btn-gold" style={{fontSize:'0.8rem'}}>
          ＋ Mulai Penugasan Baru
        </Link>
      </div>

      <div className="page-content">
        {/* Metric cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'1.5rem'}}>
          <div className="metric-card">
            <p className="metric-label">Total Penugasan</p>
            <p className="metric-value" style={{color:'#0D2137'}}>{total}</p>
            <p className="metric-sub">{aktif} aktif · {selesai} selesai</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Sedang Berjalan</p>
            <p className="metric-value" style={{color:'#2563EB'}}>{aktif}</p>
            <p className="metric-sub">dari target tahunan</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Laporan Final</p>
            <p className="metric-value" style={{color:'#16A34A'}}>{selesai}</p>
            <p className="metric-sub">{total > 0 ? Math.round(selesai/total*100) : 0}% capaian</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Isu Terbuka</p>
            <p className="metric-value" style={{color: isuTerbuka > 0 ? '#DC2626' : '#16A34A'}}>{isuTerbuka}</p>
            <p className="metric-sub">perlu tindak lanjut</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Terlambat</p>
            <p className="metric-value" style={{color: terlambat > 0 ? '#D97706' : '#16A34A'}}>{terlambat}</p>
            <p className="metric-sub">melewati target selesai</p>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
          {/* Rekapitulasi per jenis audit */}
          <div className="card">
            <div className="card-header">Rekapitulasi per Jenis Audit</div>
            <div className="card-body" style={{padding:'1rem'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.83rem'}}>
                <thead>
                  <tr style={{background:'#F4F7FB'}}>
                    <th style={{padding:'0.5rem 0.75rem',textAlign:'left',fontSize:'0.72rem',fontWeight:600,color:'#4B6280',textTransform:'uppercase',letterSpacing:'0.04em'}}>Jenis Audit</th>
                    <th style={{padding:'0.5rem 0.75rem',textAlign:'center',fontSize:'0.72rem',fontWeight:600,color:'#4B6280',textTransform:'uppercase',letterSpacing:'0.04em'}}>Jumlah</th>
                    <th style={{padding:'0.5rem 0.75rem',textAlign:'left',fontSize:'0.72rem',fontWeight:600,color:'#4B6280',textTransform:'uppercase',letterSpacing:'0.04em'}}>Progres</th>
                  </tr>
                </thead>
                <tbody>
                  {byJenis.map(b => (
                    <tr key={b.jenis} style={{borderTop:'1px solid #F1F5FB'}}>
                      <td style={{padding:'0.65rem 0.75rem',fontWeight:500}}>{b.label}</td>
                      <td style={{padding:'0.65rem 0.75rem',textAlign:'center',fontWeight:700,color:'#0D2137'}}>{b.count}</td>
                      <td style={{padding:'0.65rem 0.75rem',minWidth:'120px'}}>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{
                            width: total > 0 ? `${Math.round(b.count/total*100)}%` : '0%',
                            background: b.jenis === 'AUDIT_INVESTIGATIF' ? '#DC2626' : '#2563EB'
                          }}/>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ringkasan kinerja */}
          <div className="card">
            <div className="card-header">Ringkasan Kinerja</div>
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {[
                { label:'Total penugasan', val: `${total}`, color:'#0D2137' },
                { label:'Selesai (Final)', val: `${selesai} (${total > 0 ? Math.round(selesai/total*100) : 0}%)`, color:'#16A34A' },
                { label:'Sedang berjalan', val: `${aktif}`, color:'#2563EB' },
                { label:'Isu terbuka', val: `${isuTerbuka}`, color: isuTerbuka > 0 ? '#DC2626' : '#16A34A' },
                { label:'Terlambat', val: `${terlambat}`, color: terlambat > 0 ? '#D97706' : '#16A34A' },
              ].map(item => (
                <div key={item.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'0.83rem'}}>
                  <span style={{color:'#4B6280'}}>{item.label}</span>
                  <span style={{fontWeight:700,color:item.color}}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daftar penugasan terkini */}
        <div className="card">
          <div className="card-header">
            Daftar Penugasan Audit
            <Link href="/penugasan" style={{fontSize:'0.75rem',color:'#2563EB',textDecoration:'none',fontWeight:500}}>
              Lihat semua →
            </Link>
          </div>
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entitas</th>
                  <th>Objek</th>
                  <th>Jenis Audit</th>
                  <th>Ketua Tim</th>
                  <th>Status</th>
                  <th>Target Selesai</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={7} style={{textAlign:'center',padding:'2rem',color:'#8BA3BC'}}>
                    Belum ada penugasan. <Link href="/penugasan/baru" style={{color:'#2563EB'}}>Buat penugasan pertama</Link>
                  </td></tr>
                )}
                {rows.slice(0,10).map((row: any) => {
                  const badge = STATUS_BADGE[row.status_saat_ini] ?? { label: row.status_saat_ini, cls: 'badge-neutral' };
                  const isLate = row.target_selesai && new Date(row.target_selesai) < today && !['final','tidak_dilanjutkan','dihentikan'].includes(row.status_saat_ini);
                  return (
                    <tr key={row.id}>
                      <td><span style={{fontWeight:600}}>{row.entities?.nama ?? '—'}</span></td>
                      <td><span className="badge badge-info" style={{fontSize:'0.68rem'}}>{row.entities?.tipe ?? '—'}</span></td>
                      <td style={{color:'#4B6280'}}>{JENIS_LABEL[row.jenis_audit] ?? row.jenis_audit}</td>
                      <td style={{color:'#4B6280'}}>{(row as any).ketua?.nama ?? '—'}</td>
                      <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                      <td style={{color: isLate ? '#DC2626' : '#4B6280', fontWeight: isLate ? 600 : 400}}>
                        {row.target_selesai ?? '—'}{isLate ? ' ⚠' : ''}
                      </td>
                      <td>
                        <Link href={`/penugasan/${row.id}`} className="btn btn-outline" style={{padding:'0.3rem 0.75rem',fontSize:'0.75rem'}}>
                          Detail
                        </Link>
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
