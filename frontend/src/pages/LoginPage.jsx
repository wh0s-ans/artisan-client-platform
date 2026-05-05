import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font)'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',height:64,background:'#fff',borderBottom:'1px solid var(--border-light)'}}>
        <Link to="/" style={{fontSize:22,fontWeight:700,color:'var(--text)',letterSpacing:'-.8px',textDecoration:'none'}}>
          artisan<span style={{color:'var(--primary)'}}>connect</span>
        </Link>
        <Link to="/register" className="btn btn-outline">S'inscrire</Link>
      </nav>

      <div style={{maxWidth:440,margin:'80px auto',padding:'0 20px'}}>
        <div className="bark-card" style={{padding:36}}>
          <div style={{textAlign:'center',marginBottom:28}}>
            <div style={{width:56,height:56,borderRadius:14,background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:24}}>🔑</div>
            <h1 style={{fontSize:24,fontWeight:700,letterSpacing:'-.5px',marginBottom:6}}>Connexion</h1>
            <p style={{fontSize:14,color:'var(--text-secondary)'}}>Accédez à votre espace</p>
          </div>

          {error && <div className="alert alert-error" style={{marginBottom:14}}>{error}</div>}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{marginTop:4,padding:'12px 18px'}} disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Se connecter'}
            </button>
          </form>

          <p style={{textAlign:'center',fontSize:13,color:'var(--text-secondary)',marginTop:20}}>
            Pas encore de compte ? <Link to="/register" style={{color:'var(--primary)',fontWeight:600}}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
