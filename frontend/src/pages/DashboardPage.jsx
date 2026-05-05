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
        <Link to={isClient ? '/demands/create' : '/demands'} className="btn btn-primary">
          {isClient ? '+ Nouvelle demande' : 'Voir les demandes'}
        </Link>
      </div>

      <div className="stats-grid">
        {isClient ? (
          <>
            <StatCard label="Demandes actives" value={stats?.active_demands || 0} emoji="📋" color="#5b4ed4" />
            <StatCard label="Terminées" value={stats?.completed_demands || 0} emoji="✅" color="#22c55e" />
            <StatCard label="Total demandes" value={stats?.total_demands || 0} emoji="📊" color="#5b4ed4" />
            <StatCard label="Note moyenne" value={stats?.average_rating?.toFixed(1) || '—'} emoji="⭐" color="#f59e0b" />
          </>
        ) : (
          <>
            <StatCard label="Propositions envoyées" value={stats?.total_proposals || 0} emoji="📤" color="#5b4ed4" />
            <StatCard label="Acceptées" value={stats?.accepted_proposals || 0} emoji="✅" color="#22c55e" />
            <StatCard label="En attente" value={stats?.pending_proposals || 0} emoji="⏳" color="#f59e0b" />
            <StatCard label="Note moyenne" value={stats?.average_rating?.toFixed(1) || '—'} emoji="⭐" color="#f59e0b" />
          </>
        )}
      </div>

      <div className="bark-card" style={{padding:24}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div className="bark-section-title" style={{margin:0}}>{isClient ? 'Mes demandes récentes' : 'Demandes disponibles'}</div>
          <Link to="/demands" style={{fontSize:14,color:'var(--primary)',fontWeight:500}}>Voir tout →</Link>
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
    <div className="bark-card" style={{padding:18,display:'flex',alignItems:'center',gap:14,borderTop:`3px solid ${color}`}}>
      <div style={{width:42,height:42,borderRadius:12,background:color+'12',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{emoji}</div>
      <div>
        <span style={{fontSize:24,fontWeight:700,display:'block',color:'var(--text)',letterSpacing:'-.5px'}}>{value}</span>
        <span style={{fontSize:12,color:'var(--text-muted)',fontWeight:500}}>{label}</span>
      </div>
    </div>
  );
}
