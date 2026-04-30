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
    <nav className="lp-nav" style={{position:'sticky',top:0,zIndex:100}}>
      <Link to="/" className="lp-logo" style={{textDecoration:'none'}}>artisan<span>connect</span></Link>

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

      <div className="lp-nav-r">
        <Link to="/profile" className="lp-nb lp-nb-o" style={{textDecoration:'none',display:'flex',alignItems:'center',gap:6}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500}}>
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          {user.first_name}
        </Link>
        <button className="btn-logout" onClick={handleLogout} title="Déconnexion">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
