import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { demandsAPI, proposalsAPI, usersAPI, ratingsAPI } from '../api';
import { getCategoryInfo } from '../utils/constants';
import StatusBadge from '../components/StatusBadge';
import RatingStars from '../components/RatingStars';

export default function DemandDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [demand, setDemand] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [artisans, setArtisans] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState({ price: '', timeline: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({ score: 0, comment: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [demandRes, proposalsRes] = await Promise.all([demandsAPI.get(id), proposalsAPI.getForDemand(id)]);
      setDemand(demandRes.data);
      const propsList = Array.isArray(proposalsRes.data) ? proposalsRes.data : [];
      setProposals(propsList);
      const artisanMap = {};
      for (const p of propsList) {
        if (!artisanMap[p.artisan_id]) {
          try { const res = await usersAPI.get(p.artisan_id); artisanMap[p.artisan_id] = res.data; } catch {}
        }
      }
      setArtisans(artisanMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault(); setSubmitLoading(true);
    try {
      await proposalsAPI.create({ demand_id: parseInt(id), price: parseFloat(proposalForm.price), timeline: proposalForm.timeline, message: proposalForm.message || null });
      setShowProposalForm(false); setProposalForm({ price: '', timeline: '', message: '' }); fetchData();
    } catch (err) { alert(err.response?.data?.detail || 'Erreur'); }
    finally { setSubmitLoading(false); }
  };

  const handleAccept = async (pid) => { try { await proposalsAPI.updateStatus(pid, { status: 'accepted' }); fetchData(); } catch { alert('Erreur'); } };
  const handleReject = async (pid) => { try { await proposalsAPI.updateStatus(pid, { status: 'rejected' }); fetchData(); } catch { alert('Erreur'); } };
  const handleStatusChange = async (s) => { try { await demandsAPI.updateStatus(id, { status: s }); fetchData(); } catch { alert('Erreur'); } };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      const ratedUserId = user.user_type === 'client' ? demand.accepted_artisan_id : demand.client_id;
      await ratingsAPI.create({ rated_user_id: ratedUserId, score: ratingForm.score, comment: ratingForm.comment, demand_id: parseInt(id) });
      setShowRatingForm(false); alert('Merci pour votre avis !');
    } catch { alert('Erreur'); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!demand) return <div className="page"><div className="bark-card" style={{padding:40}}><div className="empty-state"><p>Demande introuvable</p></div></div></div>;

  const cat = getCategoryInfo(demand.category);
  const isOwner = user.id === demand.client_id;
  const isArtisan = user.user_type === 'artisan';
  const alreadyProposed = proposals.some(p => p.artisan_id === user.id);

  return (
    <div className="page">
      <button className="btn btn-outline" style={{marginBottom:12}} onClick={() => navigate(-1)}>← Retour</button>

      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:16}}>
        <div>
          {/* Main card */}
          <div className="bark-card" style={{padding:20,marginBottom:16}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
              <span style={{padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:500,background:cat.color+'20',color:cat.color}}>{cat.label}</span>
              <StatusBadge status={demand.status} />
            </div>
            <h1 style={{fontSize:20,fontWeight:500,letterSpacing:'-.3px',margin:'8px 0'}}>{demand.title}</h1>
            <div style={{display:'flex',gap:12,color:'#5f5f6b',fontSize:12,flexWrap:'wrap',marginBottom:8}}>
              <span>📍 {demand.location}</span>
              {demand.budget && <span>💰 {demand.budget} DA</span>}
              <span>📅 {new Date(demand.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            {demand.urgency && demand.urgency !== 'normal' && (
              <span className={`urgency-tag ${demand.urgency}`}>{demand.urgency === 'urgent' ? '⚡ Urgent' : '🔥 Très urgent'}</span>
            )}
            <div style={{marginTop:16}}>
              <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>Description</div>
              <p style={{fontSize:13,color:'#5f5f6b',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{demand.description}</p>
            </div>

            {isOwner && demand.status === 'accepted' && (
              <div style={{marginTop:16}}><button className="btn btn-primary" onClick={() => handleStatusChange('in_progress')}>▶️ Marquer en cours</button></div>
            )}
            {isOwner && demand.status === 'in_progress' && (
              <div style={{marginTop:16}}><button className="btn btn-success" onClick={() => handleStatusChange('completed')}>✅ Marquer terminé</button></div>
            )}
            {((isOwner && demand.status === 'completed') || (!isOwner && isArtisan && demand.status === 'completed' && demand.accepted_artisan_id === user.id)) && !showRatingForm && (
              <div style={{marginTop:16}}><button className="btn btn-primary" onClick={() => setShowRatingForm(true)}>⭐ Laisser un avis</button></div>
            )}

            {showRatingForm && (
              <form onSubmit={handleSubmitRating} style={{marginTop:16,background:'#f3f3f5',border:'.5px solid #ededf0',borderRadius:8,padding:16,display:'flex',flexDirection:'column',gap:10}}>
                <div style={{fontSize:13,fontWeight:500}}>⭐ Laisser un avis</div>
                <div className="form-group"><label>Note globale</label><RatingStars value={ratingForm.score} onChange={v => setRatingForm({...ratingForm, score: v})} size={24} /></div>
                <div className="form-group"><label>Commentaire</label><textarea value={ratingForm.comment} onChange={e => setRatingForm({...ratingForm, comment: e.target.value})} placeholder="Votre expérience..." rows={3} /></div>
                <button type="submit" className="btn btn-primary" disabled={ratingForm.score === 0}>Envoyer</button>
              </form>
            )}
          </div>

          {/* Proposals */}
          <div className="bark-card" style={{padding:20}}>
            <div className="bark-section-title" style={{margin:'0 0 12px'}}>Propositions ({proposals.length})</div>
            {proposals.length === 0 ? (
              <div className="empty-state-sm"><p>Aucune proposition pour le moment</p></div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {proposals.map(p => {
                  const a = artisans[p.artisan_id];
                  return (
                    <div key={p.id} style={{background:'#f3f3f5',border:'.5px solid #ededf0',borderRadius:8,padding:14,opacity:p.status !== 'pending' ? .6 : 1}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:32,height:32,borderRadius:'50%',background:'#EEEDFE',color:'#3C3489',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500}}>
                            {a?.first_name?.[0]}{a?.last_name?.[0] || '?'}
                          </div>
                          <div>
                            <div style={{fontSize:13,fontWeight:500}}>{a?.first_name || 'Artisan'} {a?.last_name || ''}</div>
                            <RatingStars value={a?.average_rating || 0} size={10} />
                          </div>
                        </div>
                        <span style={{fontSize:11,fontWeight:500,color:p.status === 'accepted' ? '#1D9E75' : p.status === 'rejected' ? '#dc3545' : '#EF9F27'}}>
                          {p.status === 'pending' ? '⏳ En attente' : p.status === 'accepted' ? '✅ Accepté' : '❌ Refusé'}
                        </span>
                      </div>
                      <div style={{display:'flex',gap:16,marginBottom:6,fontSize:13,color:'#5f5f6b'}}>
                        <span>💰 <strong>{p.price} DA</strong></span>
                        <span>🕐 {p.timeline}</span>
                      </div>
                      {p.message && <p style={{fontSize:12,color:'#5f5f6b',lineHeight:1.5}}>{p.message}</p>}
                      {isOwner && p.status === 'pending' && (
                        <div style={{display:'flex',gap:6,marginTop:10}}>
                          <button className="btn btn-success" onClick={() => handleAccept(p.id)}>✅ Accepter</button>
                          <button className="btn btn-danger" onClick={() => handleReject(p.id)}>❌ Refuser</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isArtisan && demand.status === 'pending' && !alreadyProposed && (
              <>
                {!showProposalForm ? (
                  <button className="btn btn-primary btn-full" style={{marginTop:12}} onClick={() => setShowProposalForm(true)}>📝 Envoyer une proposition</button>
                ) : (
                  <form onSubmit={handleSubmitProposal} style={{marginTop:12,background:'#f3f3f5',border:'.5px solid #ededf0',borderRadius:8,padding:14,display:'flex',flexDirection:'column',gap:10}}>
                    <div style={{fontSize:13,fontWeight:500}}>📝 Ma proposition</div>
                    <div className="form-row">
                      <div className="form-group"><label>Prix (DA) *</label><input type="number" value={proposalForm.price} onChange={e => setProposalForm({...proposalForm, price: e.target.value})} required min="0" /></div>
                      <div className="form-group"><label>Délai *</label><input type="text" value={proposalForm.timeline} onChange={e => setProposalForm({...proposalForm, timeline: e.target.value})} placeholder="Ex: 2-3 jours" required /></div>
                    </div>
                    <div className="form-group"><label>Message</label><textarea value={proposalForm.message} onChange={e => setProposalForm({...proposalForm, message: e.target.value})} placeholder="Présentez-vous..." rows={3} /></div>
                    <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                      <button type="button" className="btn btn-outline" onClick={() => setShowProposalForm(false)}>Annuler</button>
                      <button type="submit" className="btn btn-primary" disabled={submitLoading}>{submitLoading ? <span className="spinner-sm" /> : 'Envoyer'}</button>
                    </div>
                  </form>
                )}
              </>
            )}
            {isArtisan && alreadyProposed && <div className="alert alert-info" style={{marginTop:12}}>✅ Vous avez déjà envoyé une proposition</div>}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{position:'sticky',top:70,height:'fit-content'}}>
          <div className="bark-card" style={{padding:16}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>💬 Communication</div>
            <Link to={`/messages?demand=${id}`} className="btn btn-outline btn-full">Ouvrir la messagerie</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
