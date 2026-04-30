import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usersAPI, demandsAPI } from '../api';
import { CATEGORIES } from '../utils/constants';
import './LandingPage.css';

const AV_COLORS = [
  { bg: '#EEEDFE', color: '#3C3489' },
  { bg: '#E1F5EE', color: '#085041' },
  { bg: '#FAECE7', color: '#712B13' },
  { bg: '#FAEEDA', color: '#633806' },
  { bg: '#E6F1FB', color: '#0C447C' },
  { bg: '#FBEAF0', color: '#72243E' },
];

function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

function Stars({ rating }) {
  const r = Math.round(rating || 0);
  return (
    <div className="lp-stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`lp-star${i <= r ? '' : ' lp-star-e'}`} viewBox="0 0 10 10">
          <path d="M5 1l1.1 2.4 2.6.3-1.9 1.8.5 2.6L5 6.9 2.7 8.1l.5-2.6L1.3 3.7l2.6-.3z"/>
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
        const [artisansRes, demandsRes] = await Promise.all([
          usersAPI.list('artisan'),
          demandsAPI.list(),
        ]);
        setArtisans(artisansRes.data || []);
        const allArtisans = artisansRes.data || [];
        const allDemands = demandsRes.data || [];
        setStats({
          artisanCount: allArtisans.length,
          demandCount: allDemands.length,
        });
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayedArtisans = artisans.slice(0, 4);

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-logo">artisan<span>connect</span></div>
        <div className="lp-nav-r">
          <Link to="/register" className="lp-nb lp-nb-o">Je suis un artisan</Link>
          <Link to="/login" className="lp-nb lp-nb-o">Connexion</Link>
          <Link to="/register" className="lp-nb lp-nb-p">Publier un besoin</Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="lp-hero">
        <div className="lp-hero-inner">
          <div className="lp-htag"><div className="lp-htag-dot" />Gratuit pour les clients · Réponse en 24h</div>
          <h1>Décrivez votre besoin,<br/>les artisans viennent à vous</h1>
          <p className="lp-hero-sub">Publiez votre demande en 2 minutes. Recevez jusqu'à 5 devis<br/>d'artisans vérifiés de votre région. Comparez et choisissez.</p>

          <div className="lp-steps">
            <div className="lp-step"><div className="lp-step-n">1</div><div className="lp-step-t">Décrivez</div><div className="lp-step-s">Votre besoin en détail</div></div>
            <div className="lp-step"><div className="lp-step-n">2</div><div className="lp-step-t">Recevez</div><div className="lp-step-s">Jusqu'à 5 devis</div></div>
            <div className="lp-step"><div className="lp-step-n">3</div><div className="lp-step-t">Choisissez</div><div className="lp-step-s">Le meilleur artisan</div></div>
          </div>

          <div className="lp-sform">
            <div className="lp-sform-top">
              <div className="lp-sf-field">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>
                <input placeholder="De quoi avez-vous besoin ?" />
              </div>
              <div className="lp-sf-div" />
              <div className="lp-sf-loc">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a4 4 0 010 8c-2.2 0-4-1.8-4-4a4 4 0 014-4z"/><path d="M8 10v4"/></svg>
                <select><option>Alger</option><option>Oran</option><option>Constantine</option><option>Annaba</option></select>
              </div>
              <Link to="/register" className="lp-sf-btn">Trouver des artisans</Link>
            </div>
            <div className="lp-sform-cats">
              {CATEGORIES.map((c, i) => (
                <span key={c.value} className={`lp-scat${i === 0 ? ' on' : ''}`}>{c.label.split(' ').slice(1).join(' ')}</span>
              ))}
            </div>
          </div>

          <div className="lp-trust">
            <div className="lp-trust-item"><div className="lp-trust-icon">✓</div>Artisans vérifiés</div>
            <div className="lp-trust-item"><div className="lp-trust-icon">✓</div>100% gratuit pour les clients</div>
            <div className="lp-trust-item"><div className="lp-trust-icon">✓</div>Réponse sous 24h</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="lp-how">
        <div className="lp-how-title">Comment ça fonctionne</div>
        <div className="lp-how-steps">
          <div className="lp-hw"><div className="lp-hw-num">1</div><div className="lp-hw-t">Publiez votre besoin</div><div className="lp-hw-s">Décrivez votre projet, votre budget et votre localisation en quelques clics.</div></div>
          <div className="lp-hw"><div className="lp-hw-num">2</div><div className="lp-hw-t">Recevez des devis</div><div className="lp-hw-s">Les artisans intéressés vous contactent avec leurs propositions et tarifs.</div></div>
          <div className="lp-hw"><div className="lp-hw-num">3</div><div className="lp-hw-t">Choisissez en confiance</div><div className="lp-hw-s">Comparez les profils, les avis et les prix. Choisissez le meilleur.</div></div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="lp-cats-section">
        <div className="lp-sec-head">
          <div className="lp-sec-title">Catégories populaires</div>
          <Link to="/register" className="lp-sec-link">Voir toutes les catégories</Link>
        </div>
        <div className="lp-cats-grid">
          {CATEGORIES.slice(0, 4).map(c => {
            const count = artisans.filter(a =>
              (a.specialties || []).some(s => s.toLowerCase().includes(c.value))
            ).length;
            return (
              <div key={c.value} className="lp-ccat">
                <div className="lp-ccat-icon">{c.label.split(' ')[0]}</div>
                <div className="lp-ccat-name">{c.label.split(' ').slice(1).join(' ')}</div>
                <div className="lp-ccat-count">{count} artisan{count !== 1 ? 's' : ''}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ARTISANS */}
      <div className="lp-section">
        <div className="lp-sec-head">
          <div className="lp-sec-title">
            {displayedArtisans.length > 0
              ? 'Artisans disponibles sur la plateforme'
              : 'Aucun artisan inscrit pour le moment'}
          </div>
          {displayedArtisans.length > 0 && (
            <Link to="/register" className="lp-sec-link">Voir tous les artisans</Link>
          )}
        </div>
        <div className="lp-pros-grid">
          {loading ? (
            <div className="lp-loading">Chargement...</div>
          ) : displayedArtisans.length === 0 ? (
            <div className="lp-empty">
              <div className="lp-empty-icon">👷</div>
              <div className="lp-empty-text">Soyez le premier artisan à rejoindre la plateforme !</div>
              <Link to="/register" className="lp-empty-btn">S'inscrire comme artisan</Link>
            </div>
          ) : (
            displayedArtisans.map((a, i) => {
              const avStyle = AV_COLORS[i % AV_COLORS.length];
              const initials = getInitials(a.first_name, a.last_name);
              const specialties = a.specialties || [];
              const isVerified = a.is_verified;
              const isNew = a.total_ratings === 0;

              return (
                <div key={a.id} className="lp-pro-card">
                  <div className="lp-pc-top">
                    <div className="lp-av" style={{ background: avStyle.bg, color: avStyle.color }}>{initials}</div>
                    <div className="lp-pc-info">
                      <div className="lp-pc-name">{a.first_name} {a.last_name}</div>
                      <div className="lp-pc-job">{specialties[0] || 'Artisan'}</div>
                      {a.location && <div className="lp-pc-loc">{a.location}</div>}
                    </div>
                  </div>
                  <div className="lp-pc-badge" style={{
                    background: isVerified ? '#EEEDFE' : isNew ? '#E1F5EE' : '#FAEEDA',
                    color: isVerified ? '#3C3489' : isNew ? '#085041' : '#633806'
                  }}>
                    {isVerified ? '✓ Profil vérifié' : isNew ? '● Nouveau' : '★ Artisan actif'}
                  </div>
                  <div className="lp-pc-stars-row">
                    <Stars rating={a.average_rating} />
                    <span className="lp-rn">{(a.average_rating || 0).toFixed(1)}</span>
                    <span className="lp-rc">({a.total_ratings || 0} avis)</span>
                  </div>
                  {a.bio && <div className="lp-pc-resp">{a.bio}</div>}
                  {specialties.length > 0 && (
                    <div className="lp-pc-tags">
                      {specialties.slice(0, 3).map((t, j) => <span key={j} className="lp-ptag">{t}</span>)}
                    </div>
                  )}
                  <div className="lp-pc-foot">
                    <div className="lp-pc-price" />
                    <Link to="/register" className="lp-pc-cta">Contacter</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* STATS BAR */}
      {(stats.artisanCount > 0 || stats.demandCount > 0) && (
        <div className="lp-stats-bar">
          <div className="lp-stat-item">
            <div className="lp-stat-num">{stats.artisanCount}</div>
            <div className="lp-stat-label">Artisan{stats.artisanCount !== 1 ? 's' : ''} inscrit{stats.artisanCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="lp-stat-item">
            <div className="lp-stat-num">{stats.demandCount}</div>
            <div className="lp-stat-label">Demande{stats.demandCount !== 1 ? 's' : ''} publiée{stats.demandCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="lp-cta-bar">
        <div>
          <div className="lp-cta-text">Vous êtes un artisan professionnel ?</div>
          <div className="lp-cta-sub">Rejoignez la plateforme et trouvez de nouveaux clients chaque semaine</div>
        </div>
        <Link to="/register" className="lp-cta-btn">Créer mon profil artisan</Link>
      </div>
    </div>
  );
}
