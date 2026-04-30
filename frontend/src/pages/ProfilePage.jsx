import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, ratingsAPI } from '../api';
import { useParams } from 'react-router-dom';
import RatingStars from '../components/RatingStars';
import { CATEGORIES, formatDate } from '../utils/constants';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser, refreshUser } = useAuth();
  const isOwnProfile = !id || parseInt(id) === currentUser?.id;
  const [profile, setProfile] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    try {
      const userId = id || currentUser.id;
      const [profileRes, ratingsRes] = await Promise.all([usersAPI.get(userId), ratingsAPI.getForUser(userId)]);
      setProfile(profileRes.data);
      setRatings(Array.isArray(ratingsRes.data) ? ratingsRes.data : []);
      setForm({
        first_name: profileRes.data.first_name || '', last_name: profileRes.data.last_name || '',
        phone: profileRes.data.phone || '', bio: profileRes.data.bio || '',
        location: profileRes.data.location || '', availability: profileRes.data.availability || '',
        service_radius: profileRes.data.service_radius || '',
      });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form };
      if (data.service_radius) data.service_radius = parseInt(data.service_radius);
      else delete data.service_radius;
      await usersAPI.updateProfile(data);
      await refreshUser();
      setEditing(false);
      fetchProfile();
    } catch (err) { alert('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!profile) return <div className="page"><div className="bark-card" style={{padding:40}}><div className="empty-state"><p>Profil introuvable</p></div></div></div>;

  const isArtisan = profile.user_type === 'artisan';

  return (
    <div className="page">
      {/* Header */}
      <div className="bark-card" style={{padding:24,display:'flex',alignItems:'center',gap:16,marginBottom:16,flexWrap:'wrap'}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:500,flexShrink:0}}>
          {profile.first_name?.[0]}{profile.last_name?.[0]}
        </div>
        <div style={{flex:1}}>
          <h1 style={{fontSize:18,fontWeight:500,letterSpacing:'-.3px'}}>{profile.first_name} {profile.last_name}</h1>
          <span style={{fontSize:12,color:'#5f5f6b'}}>{isArtisan ? '🔧 Artisan' : '👤 Client'}</span>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
            <RatingStars value={profile.average_rating || 0} size={14} />
            <span style={{fontSize:12,color:'#9a9aa5'}}>({profile.total_ratings || 0} avis)</span>
          </div>
          {profile.location && <span style={{fontSize:12,color:'#9a9aa5'}}>📍 {profile.location}</span>}
        </div>
        {isOwnProfile && !editing && (
          <button className="btn btn-outline" onClick={() => setEditing(true)}>✏️ Modifier</button>
        )}
      </div>

      {/* Edit / Info */}
      <div className="bark-card" style={{padding:20,marginBottom:16}}>
        {editing ? (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="bark-section-title" style={{margin:0}}>Modifier mon profil</div>
            <div className="form-row">
              <div className="form-group"><label>Prénom</label><input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} /></div>
              <div className="form-group"><label>Nom</label><input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} /></div>
            </div>
            <div className="form-group"><label>Téléphone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="form-group"><label>Bio</label><textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} placeholder="Parlez de vous..." /></div>
            <div className="form-group"><label>Localisation</label><input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ex: Alger" /></div>
            {isArtisan && (
              <>
                <div className="form-group"><label>Disponibilité</label><input value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} placeholder="Ex: Lun-Ven 8h-17h" /></div>
                <div className="form-group"><label>Rayon d'intervention (km)</label><input type="number" value={form.service_radius} onChange={e => setForm({...form, service_radius: e.target.value})} /></div>
              </>
            )}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner-sm" /> : 'Enregistrer'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bark-section-title" style={{margin:'0 0 12px'}}>Informations</div>
            {profile.bio && <p style={{fontSize:13,color:'#5f5f6b',lineHeight:1.6,marginBottom:12}}>{profile.bio}</p>}
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{fontSize:13,color:'#5f5f6b'}}>✉️ {profile.email}</div>
              {profile.phone && <div style={{fontSize:13,color:'#5f5f6b'}}>📞 {profile.phone}</div>}
              {profile.location && <div style={{fontSize:13,color:'#5f5f6b'}}>📍 {profile.location}</div>}
              {isArtisan && profile.availability && <div style={{fontSize:13,color:'#5f5f6b'}}>🕐 {profile.availability}</div>}
              {isArtisan && profile.service_radius && <div style={{fontSize:13,color:'#5f5f6b'}}>📐 Rayon : {profile.service_radius} km</div>}
            </div>
            {isArtisan && profile.specialties && profile.specialties.length > 0 && (
              <div style={{marginTop:12}}>
                <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>Spécialités</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {profile.specialties.map((s, i) => <span key={i} className="lp-ptag">{s}</span>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ratings */}
      <div className="bark-card" style={{padding:20}}>
        <div className="bark-section-title" style={{margin:'0 0 12px'}}>Avis ({ratings.length})</div>
        {ratings.length === 0 ? (
          <div className="empty-state-sm"><p>Aucun avis pour le moment</p></div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {ratings.map(r => (
              <div key={r.id} style={{background:'#f3f3f5',padding:12,borderRadius:8,border:'.5px solid #ededf0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <strong style={{fontSize:13}}>{r.rater?.first_name} {r.rater?.last_name}</strong>
                  <RatingStars value={r.score} size={12} />
                </div>
                {r.comment && <p style={{fontSize:12,color:'#5f5f6b'}}>{r.comment}</p>}
                <span style={{fontSize:11,color:'#9a9aa5'}}>{formatDate(r.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
