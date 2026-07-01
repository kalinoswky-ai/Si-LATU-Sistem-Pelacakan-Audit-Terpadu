import { login } from './actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="login-bg">
      {/* Decorative circles */}
      <div style={{position:'absolute',top:'-80px',right:'-80px',width:'320px',height:'320px',
        borderRadius:'50%',border:'1px solid rgba(201,151,62,0.15)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-60px',left:'-60px',width:'240px',height:'240px',
        borderRadius:'50%',border:'1px solid rgba(255,255,255,0.06)',pointerEvents:'none'}}/>

      <div className="login-card">
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{
            width:'64px',height:'64px',borderRadius:'50%',
            background:'linear-gradient(135deg,#0D2137,#254E7A)',
            display:'flex',alignItems:'center',justifyContent:'center',
            margin:'0 auto 0.875rem',boxShadow:'0 4px 16px rgba(13,33,55,0.25)'
          }}>
            <span style={{color:'#C9973E',fontWeight:800,fontSize:'1.5rem',letterSpacing:'-1px'}}>I</span>
          </div>
          <h1 style={{fontSize:'1.25rem',fontWeight:700,color:'#0D2137',margin:'0 0 2px'}}>Si-LATU</h1>
          <p style={{fontSize:'0.78rem',color:'#4B6280',margin:0}}>Sistem Pelacakan Audit Terpadu</p>
          <p style={{fontSize:'0.72rem',color:'#8BA3BC',margin:'2px 0 0'}}>Inspektorat Kabupaten Sumba Barat</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{marginBottom:'1rem'}}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{flexShrink:0,marginTop:'1px'}}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={login} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" required autoComplete="email"
              className="form-input" placeholder="email@sumbabarat.go.id"/>
          </div>
          <div className="form-group">
            <label className="form-label">Kata sandi</label>
            <input type="password" name="password" required autoComplete="current-password"
              className="form-input" placeholder="••••••••"/>
          </div>
          <button type="submit" className="btn btn-primary"
            style={{width:'100%',justifyContent:'center',padding:'0.65rem',fontSize:'0.875rem',marginTop:'0.25rem'}}>
            Masuk
          </button>
        </form>

        <div style={{marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid #EEF2F7',textAlign:'center'}}>
          <p style={{fontSize:'0.72rem',color:'#8BA3BC',margin:0}}>
            Akun dibuat oleh Admin melalui Supabase Authentication
          </p>
        </div>
      </div>
    </div>
  );
}
