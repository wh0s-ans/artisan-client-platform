import { useState, useEffect } from 'react';
import { demandsAPI } from '../api';
import { CATEGORIES } from '../utils/constants';
import DemandCard from '../components/DemandCard';

export default function DemandsPage() {
  const [demands, setDemands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { fetchDemands(); }, [category, status]);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category) params.category = category;
      if (status) params.status = status;
      const res = await demandsAPI.list(params);
      setDemands(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Demandes de services</h1>
          <p className="page-subtitle">Parcourez les demandes et envoyez vos propositions</p>
        </div>
      </div>

      <div className="bark-card" style={{padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <span style={{fontSize:13,color:'#5f5f6b',fontWeight:500}}>Filtres</span>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{padding:'7px 10px',border:'.5px solid #e5e5e8',borderRadius:6,fontSize:12,color:'#1a1a1a',background:'#fff'}}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} style={{padding:'7px 10px',border:'.5px solid #e5e5e8',borderRadius:6,fontSize:12,color:'#1a1a1a',background:'#fff'}}>
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Accepté</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminé</option>
        </select>
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : demands.length === 0 ? (
        <div className="bark-card" style={{padding:40}}><div className="empty-state"><p>Aucune demande trouvée</p></div></div>
      ) : (
        <div className="demands-grid">
          {demands.map(d => <DemandCard key={d.id} demand={d} />)}
        </div>
      )}
    </div>
  );
}
