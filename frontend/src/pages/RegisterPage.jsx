import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name, phone: form.phone, user_type: userType });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font)'}}>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 32px',height:64,background:'#fff',borderBottom:'1px solid var(--border-light)'}}>
        <Link to="/" style={{fontSize:22,fontWeight:700,color:'var(--text)',letterSpacing:'-.8px',textDecoration:'none'}}>
          artisan<span style={{color:'var(--primary)'}}>connect</span>
        </Link>
        <Link to="/login" className="btn btn-outline">Connexion</Link>
      </nav>

      <div style={{maxWidth:500,margin:'60px auto',padding:'0 20px'}}>
        <div className="bark-card" style={{padding:36}}>
          {step === 1 ? (
            <>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{width:56,height:56,borderRadius:14,background:'var(--primary-light)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:24}}>👋</div>
                <h1 style={{fontSize:24,fontWeight:700,letterSpacing:'-.5px',marginBottom:6}}>Inscription</h1>
                <p style={{fontSize:14,color:'var(--text-secondary)'}}>Choisissez votre profil</p>
              </div>
              <div className="type-selection">
                <button className={`type-card ${userType === 'artisan' ? 'selected' : ''}`} onClick={() => setUserType('artisan')}>
                  <div style={{fontSize:32}}>🔧</div>
                  <h3>Artisan</h3>
                  <p>Je propose mes services</p>
                </button>
                <button className={`type-card ${userType === 'client' ? 'selected' : ''}`} onClick={() => setUserType('client')}>
                  <div style={{fontSize:32}}>👤</div>
                  <h3>Client</h3>
                  <p>Je cherche un artisan</p>
                </button>
              </div>
              <button className="btn btn-primary btn-full" style={{marginTop:20,padding:'12px 18px'}} disabled={!userType} onClick={() => setStep(2)}>
                Continuer
              </button>
              <p style={{textAlign:'center',fontSize:13,color:'var(--text-secondary)',marginTop:20}}>
                Déjà un compte ? <Link to="/login" style={{color:'var(--primary)',fontWeight:600}}>Se connecter</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:14}}>
              <div style={{textAlign:'center',marginBottom:8}}>
                <h1 style={{fontSize:24,fontWeight:700,letterSpacing:'-.5px',marginBottom:6}}>
                  Inscription {userType === 'artisan' ? '🔧' : '👤'}
                </h1>
                <p style={{fontSize:14,color:'var(--text-secondary)'}}>Complétez vos informations</p>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} placeholder="Prénom" required />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} placeholder="Nom" required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votre@email.com" required />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0555 00 00 00" required />
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 caractères" required />
              </div>
              <div className="form-group">
                <label>Confirmer</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})} placeholder="Confirmer le mot de passe" required />
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'space-between',marginTop:4}}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Retour</button>
                <button type="submit" className="btn btn-primary" style={{padding:'10px 24px'}} disabled={loading}>
                  {loading ? <span className="spinner-sm" /> : "S'inscrire"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
