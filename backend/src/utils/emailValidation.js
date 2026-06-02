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

export const getEmailValidationError = (value) => {
  const v = normalizeEmail(value);
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
};

export const isValidEmail = (email) => !getEmailValidationError(email);

export const getPasswordValidationError = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (password.length > 128) return 'Password must be under 128 characters';
  return null;
};

export const normalizeUsername = (username) => (username || '').trim().toLowerCase();

export const getUsernameValidationError = (username) => {
  const v = normalizeUsername(username);
  if (!v) return 'Username is required';
  if (v.length < 2) return 'Username must be at least 2 characters';
  if (v.length > 30) return 'Username must be under 30 characters';
  if (!/^[a-z0-9_.]+$/.test(v)) {
    return 'Username can only contain letters, numbers, underscores, and dots';
  }
  return null;
};
