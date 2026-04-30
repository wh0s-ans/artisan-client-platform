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
    <div className="lp-root">
      <nav className="lp-nav">
        <Link to="/" className="lp-logo" style={{textDecoration:'none'}}>artisan<span>connect</span></Link>
        <div className="lp-nav-r">
          <Link to="/login" className="lp-nb lp-nb-o">Connexion</Link>
        </div>
      </nav>

      <div style={{maxWidth:480,margin:'40px auto',padding:'0 20px'}}>
        <div className="bark-card" style={{padding:'32px'}}>
          {step === 1 ? (
            <>
              <div style={{textAlign:'center',marginBottom:20}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'#EEEDFE',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:20}}>👋</div>
                <h1 style={{fontSize:20,fontWeight:500,letterSpacing:'-.3px',marginBottom:4}}>Inscription</h1>
                <p style={{fontSize:13,color:'#5f5f6b'}}>Choisissez votre profil</p>
              </div>
              <div className="type-selection">
                <button className={`type-card ${userType === 'artisan' ? 'selected' : ''}`} onClick={() => setUserType('artisan')}>
                  <div style={{fontSize:28}}>🔧</div>
                  <h3>Artisan</h3>
                  <p>Je propose mes services</p>
                </button>
                <button className={`type-card ${userType === 'client' ? 'selected' : ''}`} onClick={() => setUserType('client')}>
                  <div style={{fontSize:28}}>👤</div>
                  <h3>Client</h3>
                  <p>Je cherche un artisan</p>
                </button>
              </div>
              <button className="btn btn-primary btn-full" style={{marginTop:16}} disabled={!userType} onClick={() => setStep(2)}>
                Continuer
              </button>
              <p style={{textAlign:'center',fontSize:12,color:'#5f5f6b',marginTop:16}}>
                Déjà un compte ? <Link to="/login" style={{color:'#534AB7',fontWeight:600}}>Se connecter</Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{textAlign:'center',marginBottom:8}}>
                <h1 style={{fontSize:20,fontWeight:500,letterSpacing:'-.3px',marginBottom:4}}>
                  Inscription {userType === 'artisan' ? '🔧' : '👤'}
                </h1>
                <p style={{fontSize:13,color:'#5f5f6b'}}>Complétez vos informations</p>
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
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
