export default function PengaturanPage() {
  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>⚙ Pengaturan</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Konfigurasi sistem Si-LATU</p>
        </div>
      </div>
      <div className="page-content">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
          <div className="card">
            <div className="card-header">Informasi Sistem</div>
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'0.75rem',fontSize:'0.83rem'}}>
              {[
                ['Nama Sistem','Si-LATU — Sistem Pelacakan Audit Terpadu'],
                ['Versi','1.0 (Iterasi 1)'],
                ['Instansi','Inspektorat Kabupaten Sumba Barat'],
                ['Framework','Next.js 14 + Supabase'],
                ['Deploy','Vercel (Production)'],
              ].map(([k,v]) => (
                <div key={k} style={{display:'flex',justifyContent:'space-between',
                  paddingBottom:'0.5rem',borderBottom:'1px solid #F1F5FB'}}>
                  <span style={{color:'#4B6280'}}>{k}</span>
                  <span style={{fontWeight:500,color:'#0D2137',textAlign:'right',maxWidth:'60%'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header">Fitur Tersedia</div>
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:'0.6rem',fontSize:'0.83rem'}}>
              {[
                ['✅','Tracking status penugasan audit (4 jenis)'],
                ['✅','Alur status berbeda per jenis audit'],
                ['✅','Pencatatan isu & tindak lanjut'],
                ['✅','Peringatan dini otomatis'],
                ['✅','Log aktivitas audit trail'],
                ['✅','Hak akses berbasis peran (RLS)'],
                ['🔜','Rapat PDCA & notulen digital'],
                ['🔜','Cetak LHP/LHAI otomatis (PDF)'],
                ['🔜','Impor PKPT dari Excel'],
                ['🔜','Peta sebaran audit per kecamatan'],
              ].map(([icon,label]) => (
                <div key={label} style={{display:'flex',gap:'0.6rem',alignItems:'flex-start'}}>
                  <span>{icon}</span>
                  <span style={{color: icon === '🔜' ? '#8BA3BC' : '#0D2137'}}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
