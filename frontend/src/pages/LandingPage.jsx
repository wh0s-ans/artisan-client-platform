import { Link } from 'react-router-dom';
import './LandingPage.css';
import { CATEGORIES } from '../utils/constants';

const FEATURED_ARTISANS = [
  { initials: 'KA', name: 'Karim Amrani', job: 'Plombier certifié', loc: 'Alger · 2.3 km', rating: 4.9, reviews: 87, resp: '2h', tags: ["Fuite d'eau", 'Chauffe-eau', 'Salle de bain'], price: '3 000 DA', color: 'pu', badge: 'v' },
  { initials: 'SB', name: 'Sara Benali', job: 'Électricienne', loc: 'Alger · 4.1 km', rating: 5.0, reviews: 142, resp: '1h', tags: ['Tableau élec.', 'Domotique', 'Rénovation'], price: '4 000 DA', color: 'te', badge: 't' },
  { initials: 'OM', name: 'Omar El Fassi', job: 'Peintre décorateur', loc: 'Oran · 6.7 km', rating: 4.3, reviews: 53, resp: '24h', tags: ['Intérieur', 'Façade', 'Enduit'], price: '2 500 DA', color: 'co', badge: 'v' },
  { initials: 'HM', name: 'Hassan Mouti', job: 'Menuisier', loc: 'Alger · 3.5 km', rating: 4.7, reviews: 38, resp: '3h', tags: ['Portes', 'Placards', 'Parquet'], price: '3 500 DA', color: 'am', badge: 'n' },
];

const AV_COLORS = {
  pu: { bg: '#EEEDFE', color: '#3C3489' },
  te: { bg: '#E1F5EE', color: '#085041' },
  co: { bg: '#FAECE7', color: '#712B13' },
  am: { bg: '#FAEEDA', color: '#633806' },
  bl: { bg: '#E6F1FB', color: '#0C447C' },
  pi: { bg: '#FBEAF0', color: '#72243E' },
};

const BADGES = {
  v: { label: 'Profil vérifié', bg: '#EEEDFE', color: '#3C3489' },
  t: { label: 'Top artisan', bg: '#FAEEDA', color: '#633806' },
  n: { label: 'Nouveau', bg: '#E1F5EE', color: '#085041' },
};

function Stars({ rating }) {
  return (
    <div className="lp-stars">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`lp-star${i <= Math.round(rating) ? '' : ' lp-star-e'}`} viewBox="0 0 10 10">
          <path d="M5 1l1.1 2.4 2.6.3-1.9 1.8.5 2.6L5 6.9 2.7 8.1l.5-2.6L1.3 3.7l2.6-.3z"/>
        </svg>
      ))}
    </div>
  );
}

export default function LandingPage() {
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
          {CATEGORIES.slice(0, 4).map(c => (
            <div key={c.value} className="lp-ccat">
              <div className="lp-ccat-icon">{c.label.split(' ')[0]}</div>
              <div className="lp-ccat-name">{c.label.split(' ').slice(1).join(' ')}</div>
              <div className="lp-ccat-count">{Math.floor(Math.random()*200+100)} artisans</div>
            </div>
          ))}
        </div>
      </div>

      {/* ARTISANS */}
      <div className="lp-section">
        <div className="lp-sec-head">
          <div className="lp-sec-title">Artisans disponibles près de vous</div>
          <Link to="/register" className="lp-sec-link">Voir tous les artisans</Link>
        </div>
        <div className="lp-pros-grid">
          {FEATURED_ARTISANS.map((a, i) => {
            const avStyle = AV_COLORS[a.color];
            const badge = BADGES[a.badge];
            return (
              <div key={i} className="lp-pro-card">
                <div className="lp-pc-top">
                  <div className="lp-av" style={{ background: avStyle.bg, color: avStyle.color }}>{a.initials}</div>
                  <div className="lp-pc-info">
                    <div className="lp-pc-name">{a.name}</div>
                    <div className="lp-pc-job">{a.job}</div>
                    <div className="lp-pc-loc">{a.loc}</div>
                  </div>
                </div>
                <div className="lp-pc-badge" style={{ background: badge.bg, color: badge.color }}>
                  {a.badge === 'v' ? '✓ ' : a.badge === 't' ? '★ ' : '● '}{badge.label}
                </div>
                <div className="lp-pc-stars-row">
                  <Stars rating={a.rating} />
                  <span className="lp-rn">{a.rating}</span>
                  <span className="lp-rc">({a.reviews} avis)</span>
                </div>
                <div className="lp-pc-resp"><div className="lp-resp-dot" />Répond en moins de {a.resp}</div>
                <div className="lp-pc-tags">{a.tags.map((t,j) => <span key={j} className="lp-ptag">{t}</span>)}</div>
                <div className="lp-pc-foot">
                  <div className="lp-pc-price">{a.price} <em>/ heure</em></div>
                  <Link to="/register" className="lp-pc-cta">Contacter</Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="lp-cta-bar">
        <div>
          <div className="lp-cta-text">Vous êtes un artisan professionnel ?</div>
          <div className="lp-cta-sub">Rejoignez des centaines d'artisans et trouvez de nouveaux clients chaque semaine</div>
        </div>
        <Link to="/register" className="lp-cta-btn">Créer mon profil artisan</Link>
      </div>
    </div>
  );
}
