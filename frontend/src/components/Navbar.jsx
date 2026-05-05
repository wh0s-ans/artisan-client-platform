import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand">artisan<span className="brand-accent">connect</span></Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link to="/demands" onClick={() => setMobileOpen(false)}>Demandes</Link>
          {user.user_type === 'client' && (
            <Link to="/demands/create" onClick={() => setMobileOpen(false)}>Publier</Link>
          )}
          <Link to="/artisans" onClick={() => setMobileOpen(false)}>Artisans</Link>
          <Link to="/messages" onClick={() => setMobileOpen(false)}>Messages</Link>
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <Link to="/profile" style={{
            textDecoration:'none',display:'flex',alignItems:'center',gap:8,
            padding:'6px 14px',background:'var(--bg-secondary)',borderRadius:8,
            border:'1px solid var(--border)',fontSize:14,color:'var(--text)',fontWeight:500
          }}>
            <div style={{
              width:28,height:28,borderRadius:'50%',background:'var(--primary-light)',
              color:'var(--primary-dark)',display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:12,fontWeight:600
            }}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            {user.first_name}
          </Link>
          <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
