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
    <div className="lp-root">
      <nav className="lp-nav">
        <Link to="/" className="lp-logo" style={{textDecoration:'none'}}>artisan<span>connect</span></Link>
        <div className="lp-nav-r">
          <Link to="/register" className="lp-nb lp-nb-p">S'inscrire</Link>
        </div>
      </nav>

      <div style={{maxWidth:420,margin:'60px auto',padding:'0 20px'}}>
        <div className="bark-card" style={{padding:'32px'}}>
          <div style={{textAlign:'center',marginBottom:24}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'#EEEDFE',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:20}}>🔑</div>
            <h1 style={{fontSize:20,fontWeight:500,letterSpacing:'-.3px',marginBottom:4}}>Connexion</h1>
            <p style={{fontSize:13,color:'#5f5f6b'}}>Accédez à votre espace</p>
          </div>

          {error && <div className="alert alert-error" style={{marginBottom:12}}>{error}</div>}

          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{marginTop:4}} disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Se connecter'}
            </button>
          </form>

          <p style={{textAlign:'center',fontSize:12,color:'#5f5f6b',marginTop:16}}>
            Pas encore de compte ? <Link to="/register" style={{color:'#534AB7',fontWeight:600}}>S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
