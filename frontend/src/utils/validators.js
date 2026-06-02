function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

const PROVIDER_DOMAINS = {
  gmail: ['com'],
  yahoo: ['com', 'co.uk', 'co.in', 'co.jp', 'fr', 'de', 'es', 'it'],
  outlook: ['com'],
  hotmail: ['com', 'co.uk', 'fr', 'de', 'es', 'it'],
  icloud: ['com'],
  protonmail: ['com', 'ch'],
  proton: ['me'],
  live: ['com', 'co.uk', 'fr', 'de', 'in'],
  msn: ['com'],
  aol: ['com'],
  zoho: ['com'],
  yandex: ['com', 'ru'],
  mail: ['com', 'ru'],
  gmx: ['com', 'de', 'net'],
  tutanota: ['com', 'de'],
  fastmail: ['com', 'fm'],
  hey: ['com'],
  pm: ['me'],
  duck: ['com'],
};

const KNOWN_PROVIDERS = Object.keys(PROVIDER_DOMAINS);

const VALID_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'co', 'ai', 'app', 'dev', 'tech', 'cloud',
  'in', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'br',
  'ru', 'it', 'es', 'nl', 'se', 'no', 'dk', 'fi', 'pl', 'pt',
  'nz', 'sg', 'hk', 'za', 'mx', 'ar', 'cl', 'pe', 'ng', 'ke',
  'info', 'biz', 'name', 'pro', 'mobi', 'tv', 'fm', 'me', 'ly',
  'ac', 'cc', 'vc', 'sh', 'store', 'online', 'site', 'live',
  'media', 'news', 'blog', 'social', 'studio', 'email',
]);

const VALID_SECOND_LEVEL = new Set([
  'ac.in', 'co.in', 'org.in', 'net.in', 'edu.in', 'gov.in', 'mil.in', 'res.in',
  'ac.uk', 'co.uk', 'org.uk', 'net.uk', 'gov.uk', 'me.uk', 'ltd.uk', 'plc.uk',
  'ac.nz', 'co.nz', 'org.nz', 'net.nz', 'govt.nz',
  'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au', 'asn.au',
  'com.br', 'net.br', 'org.br', 'edu.br', 'gov.br',
  'co.jp', 'ac.jp', 'ne.jp', 'or.jp', 'go.jp',
  'com.cn', 'net.cn', 'org.cn', 'gov.cn', 'edu.cn',
  'co.za', 'ac.za', 'gov.za', 'org.za', 'net.za',
  'com.mx', 'net.mx', 'org.mx', 'edu.mx', 'gob.mx',
  'com.sg', 'edu.sg', 'gov.sg', 'net.sg', 'org.sg',
  'com.hk', 'edu.hk', 'gov.hk', 'net.hk', 'org.hk',
]);

export const normalizeEmail = (email) => (email || '').trim().toLowerCase();

export const normalizeUsername = (username) => (username || '').trim().toLowerCase();

export const validators = {
  username: (value) => {
    const v = normalizeUsername(value);
    if (!v) return 'Username is required';
    if (v.length < 2) return 'Username must be at least 2 characters';
    if (v.length > 30) return 'Username must be under 30 characters';
    if (!/^[a-z0-9_.]+$/.test(v)) {
      return 'Username can only contain letters, numbers, underscores, and dots';
    }
    return null;
  },

  name: (value) => {
    const v = value.trim();
    if (!v) return 'Full name is required';
    if (v.length < 2) return 'Name must be at least 2 characters';
    if (v.length > 60) return 'Name must be under 60 characters';
    if (!/^[a-zA-Z\s'\-.]+$/.test(v)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return null;
  },

  email: (value) => {
    const v = value.trim().toLowerCase();
    if (!v) return 'Email is required';
    if (v.length > 254) return 'Email address is too long';

    const atParts = v.split('@');
    if (atParts.length !== 2) return 'Enter a valid email address';
    const [local, domain] = atParts;

    if (!local) return 'Enter a username before @';
    if (local.length > 64) return 'Username part is too long';
    if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) {
      return 'Username contains invalid characters';
    }
    if (local.startsWith('.') || local.endsWith('.')) {
      return 'Username cannot start or end with a dot';
    }
    if (/\.\./.test(local)) return 'Username cannot contain consecutive dots';

    if (!domain) return 'Enter a domain after @';
    if (!/^[a-z0-9.-]+$/.test(domain)) return 'Domain contains invalid characters';
    if (/\.\./.test(domain)) return 'Domain cannot contain consecutive dots';
    if (!domain.includes('.')) return 'Domain must include an extension (e.g. .com)';

    const domParts = domain.split('.');

    for (const label of domParts) {
      if (!label) return 'Domain has an empty section';
      if (!/^[a-z0-9-]+$/.test(label)) return 'Domain contains invalid characters';
      if (label.startsWith('-') || label.endsWith('-')) {
        return 'Domain labels cannot start or end with a hyphen';
      }
    }

    const tld = domParts[domParts.length - 1];

    const lastTwo =
      domParts.length >= 3
        ? `${domParts[domParts.length - 2]}.${domParts[domParts.length - 1]}`
        : null;

    const hasSecondLevel = lastTwo && VALID_SECOND_LEVEL.has(lastTwo);

    const registrable = hasSecondLevel
      ? domParts[domParts.length - 3]
      : domParts[domParts.length - 2];

    if (!registrable) return 'Enter a valid email address';

    if (/(.)\1+/.test(tld)) return `".${tld}" is not a valid extension — check for typos`;

    if (!VALID_TLDS.has(tld)) return `".${tld}" is not a valid domain extension`;

    if (PROVIDER_DOMAINS[registrable]) {
      const validSuffixes = PROVIDER_DOMAINS[registrable];
      const actualSuffix = hasSecondLevel ? lastTwo : tld;

      if (!validSuffixes.includes(actualSuffix)) {
        return `"${domain}" is not valid — did you mean ${registrable}.${validSuffixes[0]}?`;
      }
      return null;
    }

    const looksLikeProviderTypo =
      registrable.length <= 8 && !/[0-9]/.test(registrable) && !hasSecondLevel;

    if (looksLikeProviderTypo) {
      for (const known of KNOWN_PROVIDERS) {
        if (registrable === known) break;
        const dist = levenshtein(registrable, known);
        if (dist >= 1 && dist <= 2 && Math.abs(registrable.length - known.length) <= 2) {
          return `Did you mean "${known}.${tld}"? "${registrable}" looks like a typo`;
        }
      }
    }

    return null;
  },

  password: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    if (value.length > 128) return 'Password must be under 128 characters';
    return null;
  },

  loginPassword: (value) => {
    if (!value) return 'Password is required';
    return null;
  },

  confirmPassword: (value, password) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return null;
  },
};

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#e74c3c' };
  if (score <= 4) return { score, label: 'Fair', color: '#f39c12' };
  return { score, label: 'Strong', color: '#27ae60' };
}

export const validateSignup = (form) => {
  const errors = {};
  const usernameError = validators.username(form.username);
  const emailError = validators.email(form.email);
  const passwordError = validators.password(form.password);
  const confirmError = validators.confirmPassword(form.confirmPassword, form.password);

  if (usernameError) errors.username = usernameError;
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (confirmError) errors.confirmPassword = confirmError;

  return errors;
};

export const validateLogin = (form) => {
  const errors = {};
  const loginId = (form.email || '').trim();

  if (!loginId) {
    errors.email = 'Email or username is required';
  } else if (loginId.includes('@')) {
    const emailError = validators.email(loginId);
    if (emailError) errors.email = emailError;
  } else {
    const usernameError = validators.username(loginId);
    if (usernameError) errors.email = usernameError;
  }

  const passwordError = validators.loginPassword(form.password);
  if (passwordError) errors.password = passwordError;

  return errors;
};

export const isValidEmail = (email) => !validators.email(email);

export const validateComment = (text) => {
  const trimmed = text?.trim() || '';
  if (!trimmed) return 'Comment cannot be empty';
  if (trimmed.length > 500) return 'Comment cannot exceed 500 characters';
  return null;
};

export const validateImageFile = (file) => {
  if (!file) return null;
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) return 'Only image files are allowed (JPEG, PNG, WebP, GIF)';
  if (file.size > 5 * 1024 * 1024) return 'Image must be smaller than 5MB';
  return null;
};

export const getInitials = (username = '') =>
  username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
