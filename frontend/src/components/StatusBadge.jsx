import { getStatusInfo } from '../utils/constants';

export default function StatusBadge({ status }) {
  const info = getStatusInfo(status);
  return (
    <span className="status-badge" style={{ color: info.color, background: info.bg }}>
      {info.label}
    </span>
  );
}
