import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usersAPI, demandsAPI } from '../api';
import { CATEGORIES } from '../utils/constants';
import './LandingPage.css';

/* ── Category images ── */
import imgPlomberie from '../assets/categories/plomberie.jpg';
import imgElectricite from '../assets/categories/electricite.jpg';
import imgPeinture from '../assets/categories/peinture.jpg';
import imgMenuiserie from '../assets/categories/menuiserie.jpg';
import imgMaconnerie from '../assets/categories/maconnerie.jpg';
import imgCarrelage from '../assets/categories/carrelage.jpg';

const CAT_IMAGES = {
  plomberie: imgPlomberie,
  electricite: imgElectricite,
  peinture: imgPeinture,
  menuiserie: imgMenuiserie,
  maconnerie: imgMaconnerie,
  carrelage: imgCarrelage,
};

/* Gradient fallback for categories without photos */
const CAT_GRADIENTS = {
  climatisation: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
  autre:         'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
};
const CAT_EMOJIS = { climatisation: '❄️', autre: '🔩' };

/* ── Avatar colors ── */
const AV_COLORS = [
  { bg: '#eeedfe', color: '#3c3489' },
  { bg: '#e1f5ee', color: '#085041' },
  { bg: '#faece7', color: '#712b13' },
  { bg: '#faeeda', color: '#633806' },
  { bg: '#e6f1fb', color: '#0c447c' },
  { bg: '#fbeaf0', color: '#72243e' },
];

function getInitials(first, last) {
  return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}

function Stars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="lp-stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`lp-star${i <= r ? '' : ' lp-star-e'}`} viewBox="0 0 20 20">
          <path d="M10 2l2.2 4.8 5.2.6-3.8 3.6 1 5.2L10 13.8 5.4 16.2l1-5.2L2.6 7.4l5.2-.6z"/>
        </svg>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [artisans, setArtisans] = useState([]);
  const [stats, setStats] = useState({ artisanCount: 0, demandCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, demRes] = await Promise.all([
          usersAPI.list('artisan'),
          demandsAPI.list(),
        ]);
        setArtisans(artRes.data || []);
        setStats({
          artisanCount: (artRes.data || []).length,
          demandCount: (demRes.data || []).length,
        });
      } catch (err) {
        console.error('Landing data error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayed = artisans.slice(0, 4);

  return (
    <div className="lp-root">

      {/* ─── NAVBAR ─── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-logo">artisan<span>connect</span></Link>

        <div className="lp-nav-center">
          <div className="lp-search-bar">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg>
            <input placeholder="Rechercher un service..." />
          </div>
        </div>

        <div className="lp-nav-r">
          <Link to="/login" className="lp-nav-link">Connexion</Link>
          <Link to="/register" className="lp-nav-btn">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="7" r="3.5"/><path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
            Rejoindre en tant que pro
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <div className="lp-hero">
        <h1>Trouvez le bon artisan,<br/>en quelques clics</h1>
        <p className="lp-hero-sub">
          Publiez votre besoin gratuitement et recevez des devis d'artisans vérifiés près de chez vous.
        </p>

        <div className="lp-hero-search">
          <div className="lp-hero-search-input">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg>
            <input placeholder="De quoi avez-vous besoin ? (ex: plombier, peintre...)" />
          </div>
          <Link to="/register" className="lp-hero-search-btn">Rechercher</Link>
        </div>

        <div className="lp-hero-tags">
          {CATEGORIES.slice(0, 6).map(c => (
            <Link to="/register" key={c.value} className="lp-hero-tag">
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ─── CATEGORIES ─── */}
      <div className="lp-categories">
        <div className="lp-section-header">
          <h2 className="lp-section-title">Catégories populaires</h2>
          <Link to="/register" className="lp-section-link">
            Voir tout →
          </Link>
        </div>

        <div className="lp-cat-grid">
          {CATEGORIES.slice(0, 8).map(c => {
            const count = artisans.filter(a =>
              (a.specialties || []).some(s => s.toLowerCase().includes(c.value))
            ).length;

            return (
              <Link to="/register" key={c.value} className="lp-cat-card">
                {CAT_IMAGES[c.value] ? (
                  <img src={CAT_IMAGES[c.value]} alt={c.label} className="lp-cat-card-img" />
                ) : (
                  <div
                    className="lp-cat-card-fallback"
                    style={{ background: CAT_GRADIENTS[c.value] || CAT_GRADIENTS.autre }}
                  >
                    <span style={{ fontSize: 48, filter: 'grayscale(0.2)' }}>
                      {CAT_EMOJIS[c.value] || '🔩'}
                    </span>
                  </div>
                )}

                <div className="lp-cat-card-overlay">
                  <div className="lp-cat-card-name">{c.label.split(' ').slice(1).join(' ')}</div>
                  {count > 0 && (
                    <div className="lp-cat-card-count">{count} artisan{count > 1 ? 's' : ''}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="lp-how">
        <div className="lp-how-inner">
          <h2 className="lp-how-title">Comment ça marche</h2>
          <div className="lp-how-grid">
            <div className="lp-how-card">
              <div className="lp-how-num">1</div>
              <h3>Décrivez votre besoin</h3>
              <p>Publiez votre projet en quelques clics : description, budget et localisation.</p>
            </div>
            <div className="lp-how-card">
              <div className="lp-how-num">2</div>
              <h3>Recevez des devis</h3>
              <p>Les artisans intéressés vous contactent avec leurs propositions et tarifs.</p>
            </div>
            <div className="lp-how-card">
              <div className="lp-how-num">3</div>
              <h3>Choisissez en confiance</h3>
              <p>Comparez les profils, avis et prix. Choisissez le meilleur artisan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ARTISANS ─── */}
      <div className="lp-artisans">
        <div className="lp-section-header">
          <h2 className="lp-section-title">
            {displayed.length > 0 ? 'Artisans sur la plateforme' : 'Rejoignez la plateforme'}
          </h2>
          {displayed.length > 0 && (
            <Link to="/register" className="lp-section-link">Voir tous →</Link>
          )}
        </div>

        <div className="lp-artisans-grid">
          {loading ? (
            <div className="lp-loading">Chargement...</div>
          ) : displayed.length === 0 ? (
            <div className="lp-empty">
              <div className="lp-empty-icon">👷</div>
              <div className="lp-empty-text">Soyez le premier artisan à rejoindre la plateforme !</div>
              <Link to="/register" className="lp-empty-btn">S'inscrire comme artisan</Link>
            </div>
          ) : (
            displayed.map((a, i) => {
              const av = AV_COLORS[i % AV_COLORS.length];
              const initials = getInitials(a.first_name, a.last_name);
              const specs = a.specialties || [];
              const isVerified = a.is_verified;
              const isNew = a.total_ratings === 0;

              return (
                <div key={a.id} className="lp-artisan-card">
                  <div className="lp-artisan-top">
                    <div className="lp-artisan-avatar" style={{ background: av.bg, color: av.color }}>
                      {initials}
                    </div>
                    <div className="lp-artisan-info">
                      <div className="lp-artisan-name">{a.first_name} {a.last_name}</div>
                      <div className="lp-artisan-job">{specs[0] || 'Artisan'}</div>
                      {a.location && <div className="lp-artisan-loc">📍 {a.location}</div>}
                    </div>
                  </div>

                  <div className="lp-artisan-badge" style={{
                    background: isVerified ? '#eeedfe' : isNew ? '#e1f5ee' : '#faeeda',
                    color: isVerified ? '#3c3489' : isNew ? '#085041' : '#633806'
                  }}>
                    {isVerified ? '✓ Vérifié' : isNew ? '● Nouveau' : '★ Actif'}
                  </div>

                  <div className="lp-artisan-rating">
                    <Stars rating={a.average_rating} />
                    <span className="lp-artisan-rnum">{(a.average_rating || 0).toFixed(1)}</span>
                    <span className="lp-artisan-rcount">({a.total_ratings || 0} avis)</span>
                  </div>

                  {specs.length > 0 && (
                    <div className="lp-artisan-tags">
                      {specs.slice(0, 3).map((t, j) => (
                        <span key={j} className="lp-artisan-tag">{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="lp-artisan-foot">
                    <Link to="/register" className="lp-artisan-cta">Contacter</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── STATS ─── */}
      {(stats.artisanCount > 0 || stats.demandCount > 0) && (
        <div className="lp-stats">
          <div className="lp-stat">
            <div className="lp-stat-num">{stats.artisanCount}</div>
            <div className="lp-stat-label">Artisan{stats.artisanCount !== 1 ? 's' : ''} inscrit{stats.artisanCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="lp-stat">
            <div className="lp-stat-num">{stats.demandCount}</div>
            <div className="lp-stat-label">Demande{stats.demandCount !== 1 ? 's' : ''} publiée{stats.demandCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* ─── CTA ─── */}
      <div className="lp-cta">
        <h2>Vous êtes artisan professionnel ?</h2>
        <p>Rejoignez la plateforme et trouvez de nouveaux clients chaque semaine.</p>
        <Link to="/register" className="lp-cta-btn">Créer mon profil artisan</Link>
      </div>

      {/* ─── FOOTER ─── */}
      <div className="lp-footer">
        © 2026 artisanconnect — Tous droits réservés
      </div>
    </div>
  );
}
