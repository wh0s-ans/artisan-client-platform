export const CATEGORIES = [
  { value: 'plomberie', label: '🔧 Plomberie', color: '#3B82F6' },
  { value: 'electricite', label: '⚡ Électricité', color: '#F59E0B' },
  { value: 'peinture', label: '🎨 Peinture', color: '#EC4899' },
  { value: 'menuiserie', label: '🪚 Menuiserie', color: '#8B5CF6' },
  { value: 'maconnerie', label: '🧱 Maçonnerie', color: '#EF4444' },
  { value: 'carrelage', label: '🏗️ Carrelage', color: '#06B6D4' },
  { value: 'climatisation', label: '❄️ Climatisation', color: '#14B8A6' },
  { value: 'autre', label: '🔩 Autre', color: '#6B7280' },
];

export const URGENCY = [
  { value: 'normal', label: 'Normal', color: '#6B7280' },
  { value: 'urgent', label: 'Urgent', color: '#F59E0B' },
  { value: 'tres_urgent', label: 'Très urgent', color: '#EF4444' },
];

export const STATUS = [
  { value: 'pending', label: 'En attente', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  { value: 'accepted', label: 'Accepté', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  { value: 'in_progress', label: 'En cours', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  { value: 'completed', label: 'Terminé', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  { value: 'cancelled', label: 'Annulé', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
];

export function getCategoryInfo(value) {
  return CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
}

export function getStatusInfo(value) {
  return STATUS.find(s => s.value === value) || STATUS[0];
}

export function getUrgencyInfo(value) {
  return URGENCY.find(u => u.value === value) || URGENCY[0];
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return formatDate(dateStr);
}
