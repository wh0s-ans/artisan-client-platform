import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { getCategoryInfo, timeAgo } from '../utils/constants';

export default function DemandCard({ demand }) {
  const cat = getCategoryInfo(demand.category);
  return (
    <Link to={`/demands/${demand.id}`} className="demand-card">
      <div className="demand-card-header">
        <span className="category-tag" style={{ background: cat.color + '20', color: cat.color }}>
          {cat.label}
        </span>
        <StatusBadge status={demand.status} />
      </div>
      <h3 className="demand-card-title">{demand.title}</h3>
      <p className="demand-card-desc">{demand.description?.substring(0, 120)}{demand.description?.length > 120 ? '...' : ''}</p>
      <div className="demand-card-meta">
        <span><MapPin size={14} /> {demand.location}</span>
        {demand.budget && <span><DollarSign size={14} /> {demand.budget} DA</span>}
        <span><Clock size={14} /> {timeAgo(demand.created_at)}</span>
      </div>
      {demand.urgency && demand.urgency !== 'normal' && (
        <span className={`urgency-tag ${demand.urgency}`}>
          {demand.urgency === 'urgent' ? '⚡ Urgent' : '🔥 Très urgent'}
        </span>
      )}
    </Link>
  );
}
