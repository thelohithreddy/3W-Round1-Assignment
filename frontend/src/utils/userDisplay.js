/** Title-case display name from username (no separate displayName in API). */
export const formatDisplayName = (username = '') => {
  const raw = (username || '').trim();
  if (!raw) return 'User';

  return raw
    .replace(/[_.]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/** @handle from username */
export const formatHandle = (username = '') => {
  const handle = (username || 'user')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_.]/g, '');
  return `@${handle || 'user'}`;
};

const AVATAR_COLORS = [
  '#1976d2',
  '#7b1fa2',
  '#c2185b',
  '#d84315',
  '#00897b',
  '#5d4037',
  '#455a64',
  '#f57c00',
];

export const getColorFromUsername = (username = '') => {
  let hash = 0;
  const str = username.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export const getPostShareUrl = (postId) => {
  const base = window.location.origin;
  return `${base}/feed?post=${postId}`;
};
