import { Star } from 'lucide-react';

export default function RatingStars({ value = 0, onChange, size = 18, count = 5 }) {
  const stars = [];
  for (let i = 1; i <= count; i++) {
    stars.push(
      <Star
        key={i}
        size={size}
        className={`rating-star ${i <= Math.round(value) ? 'filled' : ''}`}
        onClick={() => onChange && onChange(i)}
        style={{ cursor: onChange ? 'pointer' : 'default' }}
        fill={i <= Math.round(value) ? '#F59E0B' : 'none'}
        stroke={i <= Math.round(value) ? '#F59E0B' : '#4B5563'}
      />
    );
  }
  return <div className="rating-stars">{stars}</div>;
}
