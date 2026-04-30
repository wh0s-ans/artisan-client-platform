import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { demandsAPI } from '../api';
import { CATEGORIES, URGENCY } from '../utils/constants';

export default function CreateDemandPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '', budget: '', urgency: 'normal' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = { ...form };
      if (data.budget) data.budget = parseFloat(data.budget);
      else delete data.budget;
      const res = await demandsAPI.create(data);
      navigate(`/demands/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Publier une demande</h1>
          <p className="page-subtitle">Décrivez votre besoin et recevez des propositions d'artisans</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Retour</button>
      </div>

      <div className="bark-card" style={{padding:24,maxWidth:640}}>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label>Titre *</label>
            <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Réparation fuite d'eau salle de bain" required />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Décrivez votre besoin en détail..." rows={5} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Catégorie *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                <option value="">Choisir...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Urgence</label>
              <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})}>
                {URGENCY.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Localisation *</label>
              <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Ex: Alger, Oran..." required />
            </div>
            <div className="form-group">
              <label>Budget (DA) — optionnel</label>
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="Ex: 15000" min="0" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{marginTop:4}} disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Publier la demande'}
          </button>
        </form>
      </div>
    </div>
  );
}
