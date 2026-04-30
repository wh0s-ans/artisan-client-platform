import RatingStars from './RatingStars';
import { Clock, DollarSign, User } from 'lucide-react';

export default function ProposalCard({ proposal, artisan, onAccept, onReject, showActions }) {
  return (
    <div className={`proposal-card ${proposal.status !== 'pending' ? 'decided' : ''}`}>
      <div className="proposal-header">
        <div className="proposal-artisan">
          <div className="avatar-circle">
            <User size={20} />
          </div>
          <div>
            <h4>{artisan?.first_name || 'Artisan'} {artisan?.last_name || ''}</h4>
            <RatingStars value={artisan?.average_rating || 0} size={14} />
          </div>
        </div>
        <span className={`proposal-status ${proposal.status}`}>
          {proposal.status === 'pending' ? '⏳ En attente' : proposal.status === 'accepted' ? '✅ Accepté' : '❌ Refusé'}
        </span>
      </div>
      <div className="proposal-details">
        <div className="proposal-stat">
          <DollarSign size={16} />
          <span><strong>{proposal.price} DA</strong></span>
        </div>
        <div className="proposal-stat">
          <Clock size={16} />
          <span>{proposal.timeline}</span>
        </div>
      </div>
      {proposal.message && <p className="proposal-message">{proposal.message}</p>}
      {showActions && proposal.status === 'pending' && (
        <div className="proposal-actions">
          <button className="btn btn-success" onClick={() => onAccept(proposal.id)}>✅ Accepter</button>
          <button className="btn btn-danger" onClick={() => onReject(proposal.id)}>❌ Refuser</button>
        </div>
      )}
    </div>
  );
}
