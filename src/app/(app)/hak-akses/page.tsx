export default function HakAksesPage() {
  const rules = [
    { peran:'Admin',       insert:'✅','update':'✅',hapus:'✅', lihat_investigatif:'✅', ubah_status:'✅ (semua)' },
    { peran:'Pimpinan',    insert:'✅','update':'✅',hapus:'❌', lihat_investigatif:'✅', ubah_status:'✅ (semua termasuk gerbang)' },
    { peran:'Ketua Tim',   insert:'✅','update':'✅',hapus:'❌', lihat_investigatif:'Jika ditugaskan', ubah_status:'✅ (tahap operasional)' },
    { peran:'Anggota Tim', insert:'❌','update':'❌',hapus:'❌', lihat_investigatif:'Jika ditugaskan', ubah_status:'❌' },
  ];
  return (
    <div>
      <div className="topbar">
        <div style={{flex:1}}>
          <h1 style={{margin:0,fontSize:'0.95rem',fontWeight:700,color:'#0D2137'}}>🔐 Hak Akses</h1>
          <p style={{margin:0,fontSize:'0.72rem',color:'#8BA3BC'}}>Matriks kewenangan per peran pengguna</p>
        </div>
      </div>
      <div className="page-content">
        <div className="alert alert-info" style={{marginBottom:'1rem',borderRadius:'10px'}}>
          <span>ℹ</span>
          <span>Kebijakan akses ditegakkan di level database (Row Level Security + Trigger) — tidak dapat dilewati dari sisi aplikasi.</span>
        </div>
        <div className="card">
          <div style={{overflowX:'auto'}}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Peran</th><th>Buat Penugasan</th><th>Edit Data</th>
                  <th>Hapus Data</th><th>Lihat Investigatif</th><th>Ubah Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r: any) => (
                  <tr key={r.peran}>
                    <td style={{fontWeight:700}}>{r.peran}</td>
                    <td>{r.insert}</td>
                    <td>{r['update']}</td>
                    <td>{r.hapus}</td>
                    <td style={{fontSize:'0.8rem',color:'#4B6280'}}>{r.lihat_investigatif}</td>
                    <td style={{fontSize:'0.8rem',color:'#4B6280'}}>{r.ubah_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{marginTop:'1rem'}}>
          <div className="card-header">Alur Status — Regulatif (Audit Keuangan, Kinerja, Ketaatan)</div>
          <div className="card-body">
            {[
              ['Perencanaan','Entry Meeting','Ketua Tim','—'],
              ['Entry Meeting','Proses Lapangan','Ketua Tim','—'],
              ['Proses Lapangan','Draft Laporan','Ketua Tim','—'],
              ['Draft Laporan','Exit Meeting','Pimpinan','Gerbang kualitas'],
              ['Exit Meeting','Keberatan','Ketua Tim','Wajib catatan'],
              ['Keberatan','Exit Meeting','Ketua Tim','Wajib catatan'],
              ['Exit Meeting','Final','Pimpinan','—'],
              ['(semua tahap)','Tidak Dilanjutkan','Pimpinan','Wajib catatan'],
            ].map(([dari,ke,role,ket],i) => (
              <div key={i} style={{display:'flex',gap:'0.75rem',alignItems:'center',
                padding:'0.5rem 0',borderBottom:'1px solid #F1F5FB',fontSize:'0.82rem'}}>
                <span style={{minWidth:'140px',fontWeight:500,color:'#0D2137'}}>{dari}</span>
                <span style={{color:'#8BA3BC'}}>→</span>
                <span style={{minWidth:'140px',fontWeight:500,color:'#0D2137'}}>{ke}</span>
                <span className="badge badge-info" style={{fontSize:'0.68rem'}}>{role}</span>
                {ket !== '—' && <span style={{color:'#D97706',fontSize:'0.75rem'}}>⚠ {ket}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
