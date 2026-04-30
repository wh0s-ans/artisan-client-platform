import { useState, useEffect } from 'react';
import { searchAPI } from '../api';
import UserCard from '../components/UserCard';

export default function ArtisanSearchPage() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [minRating, setMinRating] = useState(0);

  useEffect(() => { fetchArtisans(); }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      const params = {};
      if (location) params.location = location;
      if (minRating > 0) params.min_rating = minRating;
      const res = await searchAPI.artisans(params);
      setArtisans(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Trouver un artisan</h1>
          <p className="page-subtitle">Recherchez par localisation et note</p>
        </div>
      </div>

      <form className="bark-card" style={{padding:'10px 14px',marginBottom:16,display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}} onSubmit={e => { e.preventDefault(); fetchArtisans(); }}>
        <span style={{fontSize:13,color:'#5f5f6b',fontWeight:500}}>Filtres</span>
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Localisation..." style={{padding:'7px 10px',border:'.5px solid #e5e5e8',borderRadius:6,fontSize:12,color:'#1a1a1a',background:'#fff'}} />
        <select value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} style={{padding:'7px 10px',border:'.5px solid #e5e5e8',borderRadius:6,fontSize:12,color:'#1a1a1a',background:'#fff'}}>
          <option value={0}>Toutes les notes</option>
          <option value={3}>⭐ 3+</option>
          <option value={4}>⭐ 4+</option>
        </select>
        <button type="submit" className="btn btn-primary">Rechercher</button>
      </form>

      {loading ? <div className="page-loading"><div className="spinner" /></div> :
        artisans.length === 0 ? <div className="bark-card" style={{padding:40}}><div className="empty-state"><p>Aucun artisan trouvé</p></div></div> :
        <div className="users-grid">{artisans.map(a => <UserCard key={a.id} user={a} />)}</div>}
    </div>
  );
}
