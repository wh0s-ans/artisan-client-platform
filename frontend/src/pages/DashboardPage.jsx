import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsAPI, demandsAPI } from '../api';
import DemandCard from '../components/DemandCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, itemsRes] = await Promise.all([
          statsAPI.dashboard(),
          user.user_type === 'client' ? demandsAPI.myList() : demandsAPI.list({ status: 'pending' })
        ]);
        setStats(statsRes.data);
        setRecentItems(Array.isArray(itemsRes.data) ? itemsRes.data.slice(0, 5) : []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  const isClient = user.user_type === 'client';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Bonjour, {user.first_name} 👋</h1>
          <p className="page-subtitle">{isClient ? 'Gérez vos demandes et trouvez des artisans' : 'Découvrez de nouvelles opportunités'}</p>
        </div>
        <Link to={isClient ? '/demands/create' : '/demands'} className="lp-nb lp-nb-p" style={{textDecoration:'none'}}>
          {isClient ? '+ Nouvelle demande' : 'Voir les demandes'}
        </Link>
      </div>

      <div className="stats-grid">
        {isClient ? (
          <>
            <StatCard label="Demandes actives" value={stats?.active_demands || 0} emoji="📋" color="#534AB7" />
            <StatCard label="Terminées" value={stats?.completed_demands || 0} emoji="✅" color="#1D9E75" />
            <StatCard label="Total demandes" value={stats?.total_demands || 0} emoji="📊" color="#534AB7" />
            <StatCard label="Note moyenne" value={stats?.average_rating?.toFixed(1) || '—'} emoji="⭐" color="#EF9F27" />
          </>
        ) : (
          <>
            <StatCard label="Propositions envoyées" value={stats?.total_proposals || 0} emoji="📤" color="#534AB7" />
            <StatCard label="Acceptées" value={stats?.accepted_proposals || 0} emoji="✅" color="#1D9E75" />
            <StatCard label="En attente" value={stats?.pending_proposals || 0} emoji="⏳" color="#EF9F27" />
            <StatCard label="Note moyenne" value={stats?.average_rating?.toFixed(1) || '—'} emoji="⭐" color="#EF9F27" />
          </>
        )}
      </div>

      <div className="bark-card" style={{padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div className="bark-section-title" style={{margin:0}}>{isClient ? 'Mes demandes récentes' : 'Demandes disponibles'}</div>
          <Link to="/demands" style={{fontSize:13,color:'#534AB7'}}>Voir tout →</Link>
        </div>
        {recentItems.length === 0 ? (
          <div className="empty-state">
            <p>{isClient ? 'Aucune demande pour le moment' : 'Aucune demande disponible'}</p>
            <Link to={isClient ? '/demands/create' : '/demands'} className="btn btn-primary">
              {isClient ? 'Créer une demande' : 'Rafraîchir'}
            </Link>
          </div>
        ) : (
          <div className="demands-grid">
            {recentItems.map(d => <DemandCard key={d.id} demand={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, emoji, color }) {
  return (
    <div className="bark-card" style={{padding:14,display:'flex',alignItems:'center',gap:12,borderTop:`2px solid ${color}`}}>
      <div style={{width:36,height:36,borderRadius:8,background:color+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{emoji}</div>
      <div>
        <span style={{fontSize:20,fontWeight:600,display:'block',color:'#1a1a1a'}}>{value}</span>
        <span style={{fontSize:11,color:'#9a9aa5'}}>{label}</span>
      </div>
    </div>
  );
}
