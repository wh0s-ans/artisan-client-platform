import { Link } from 'react-router-dom';
import { MapPin, Star, User } from 'lucide-react';
import RatingStars from './RatingStars';

export default function UserCard({ user }) {
  return (
    <Link to={`/users/${user.id}`} className="user-card">
      <div className="user-card-avatar">
        <User size={28} />
      </div>
      <div className="user-card-info">
        <h4>{user.first_name} {user.last_name}</h4>
        <div className="user-card-rating">
          <RatingStars value={user.average_rating || 0} size={14} />
          <span className="rating-count">({user.total_ratings || 0})</span>
        </div>
        {user.location && (
          <span className="user-card-location"><MapPin size={13} /> {user.location}</span>
        )}
        {user.specialties && user.specialties.length > 0 && (
          <div className="user-card-specialties">
            {user.specialties.slice(0, 3).map((s, i) => (
              <span key={i} className="specialty-chip">{s}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
