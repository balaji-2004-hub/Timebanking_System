/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
export type UserRole = 'member' | 'admin';
export type AgeGroup = 'senior' | 'adult' | 'youth';
export type TransactionKind = 'earned' | 'spent';

export interface AuthUser {
  email: string;
  role: UserRole;
  displayName: string;
  credits?: number;
  ageGroup?: AgeGroup;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput extends LoginInput {
  displayName: string;
  role?: UserRole;
  credits?: number;
  ageGroup?: AgeGroup;
}

export interface TimeBankSettings {
  notifications: boolean;
  privacy: 'public' | 'members';
  emailUpdates: boolean;
}

export interface TimeBankStats {
  credits: number;
  given: number;
  received: number;
  exchanges: number;
  rating: number;
  reviews: number;
  listings: number;
}

export interface TimeBankListing {
  title: string;
  category: string;
  type: 'offer' | 'request';
  description: string;
  creditHours: number;
}

export interface TimeBankTransaction {
  id: number;
  kind: TransactionKind;
  amount: number;
  description: string;
  createdAt: string;
}

export interface TimeBankProfile {
  email: string;
  displayName: string;
  role: UserRole;
  ageGroup: AgeGroup;
  neighborhood: string;
  bio: string;
  phone: string;
  skillsOffered: string[];
  skillsNeeded: string[];
  firstListing: TimeBankListing | null;
  stats: TimeBankStats;
  settings: TimeBankSettings;
  recentActivity: string[];
  transactions: TimeBankTransaction[];
}

export type StoredAccount = AuthUser & { password: string };

export const AUTH_STORAGE_KEY = 'timebank-auth-user';
export const AUTH_SESSION_KEY = 'timebank-auth-user-session';
export const USER_REGISTRY_KEY = 'timebank-auth-user-registry';
export const PROFILE_PREFIX = 'timebank-profile:';

export const EMPTY_STATS: TimeBankStats = {
  credits: 1,
  given: 0,
  received: 0,
  exchanges: 0,
  rating: 0,
  reviews: 0,
  listings: 0,
};

export const DEFAULT_SETTINGS: TimeBankSettings = {
  notifications: true,
  privacy: 'members',
  emailUpdates: true,
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeDescription(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
}

export function hasMeaningfulText(value: string) {
  return normalizeDescription(value).length > 0;
}

export function authKeyFor(email: string) {
  return `${PROFILE_PREFIX}${normalizeEmail(email)}`;
}

export function createFreshProfile(user: AuthUser): TimeBankProfile {
  return {
    email: normalizeEmail(user.email),
    displayName: user.displayName,
    role: user.role,
    ageGroup: user.ageGroup ?? 'adult',
    neighborhood: '',
    bio: '',
    phone: '',
    skillsOffered: [],
    skillsNeeded: [],
    firstListing: null,
    stats: {
      ...EMPTY_STATS,
      credits: user.credits ?? EMPTY_STATS.credits,
    },
    settings: { ...DEFAULT_SETTINGS },
    recentActivity: [],
    transactions: [],
  };
}

function readJSON<T>(storage: Storage, key: string, fallback: T): T {
  const raw = storage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(storage: Storage, key: string, value: unknown) {
  storage.setItem(key, JSON.stringify(value));
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getRegistry(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  const storage = getStorage();
  if (!storage) return [];
  return readJSON<StoredAccount[]>(storage, USER_REGISTRY_KEY, []);
}

export function saveRegistry(accounts: StoredAccount[]) {
  const storage = getStorage();
  if (!storage) return;
  writeJSON(storage, USER_REGISTRY_KEY, accounts);
}

export function findAccount(email: string) {
  const normalized = normalizeEmail(email);
  return getRegistry().find((account) => normalizeEmail(account.email) === normalized) ?? null;
}

export function getProfile(email: string): TimeBankProfile {
  const storage = getStorage();
  const normalized = normalizeEmail(email);
  const fallback: TimeBankProfile = createFreshProfile({ email: normalized, displayName: 'New user', role: 'member', credits: 1 });
  if (!storage) return fallback;
  const stored = readJSON<TimeBankProfile | null>(storage, authKeyFor(normalized), null);
  if (!stored) return fallback;
  return {
    ...fallback,
    ...stored,
    email: normalized,
    ageGroup: stored.ageGroup ?? fallback.ageGroup,
    stats: { ...fallback.stats, ...(stored.stats ?? {}) },
    settings: { ...fallback.settings, ...(stored.settings ?? {}) },
    skillsOffered: Array.isArray(stored.skillsOffered) ? stored.skillsOffered : [],
    skillsNeeded: Array.isArray(stored.skillsNeeded) ? stored.skillsNeeded : [],
    recentActivity: Array.isArray(stored.recentActivity) ? stored.recentActivity : [],
    transactions: Array.isArray(stored.transactions) ? stored.transactions : [],
    firstListing: stored.firstListing ?? null,
  };
}

export function saveProfile(email: string, patch: Partial<TimeBankProfile>) {
  const storage = getStorage();
  const normalized = normalizeEmail(email);
  const current = getProfile(normalized);
  const next: TimeBankProfile = {
    ...current,
    ...patch,
    email: normalized,
    ageGroup: patch.ageGroup ?? current.ageGroup,
    stats: { ...current.stats, ...(patch.stats ?? {}) },
    settings: { ...current.settings, ...(patch.settings ?? {}) },
    skillsOffered: patch.skillsOffered ?? current.skillsOffered,
    skillsNeeded: patch.skillsNeeded ?? current.skillsNeeded,
    recentActivity: patch.recentActivity ?? current.recentActivity,
    transactions: patch.transactions ?? current.transactions,
    firstListing: patch.firstListing === undefined ? current.firstListing : patch.firstListing,
  };

  if (storage) {
    writeJSON(storage, authKeyFor(normalized), next);
    const registry = getRegistry();
    const nextRegistry = registry.map((account) =>
      normalizeEmail(account.email) === normalized
        ? {
            ...account,
            displayName: next.displayName,
            role: next.role,
            credits: next.stats.credits,
            ageGroup: next.ageGroup,
          }
        : account,
    );
    saveRegistry(nextRegistry);

    const sessionUser = getSessionUser();
    if (sessionUser && normalizeEmail(sessionUser.email) === normalized) {
      const nextSessionUser = {
        ...sessionUser,
        displayName: next.displayName,
        role: next.role,
        credits: next.stats.credits,
        ageGroup: next.ageGroup,
      };
      setSessionUser(nextSessionUser, Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY)));
    }
  }

  return next;
}

export function recordTransaction(
  email: string,
  transaction: { kind: TransactionKind; amount: number; description: string },
) {
  const current = getProfile(email);
  const sanitizedAmount = Number.isFinite(transaction.amount) ? Math.max(0, Number(transaction.amount)) : 0;
  if (sanitizedAmount <= 0) return current;

  const nextStats: TimeBankStats = {
    ...current.stats,
    credits: transaction.kind === 'earned' ? current.stats.credits + sanitizedAmount : Math.max(0, current.stats.credits - sanitizedAmount),
    given: transaction.kind === 'earned' ? current.stats.given + sanitizedAmount : current.stats.given,
    received: transaction.kind === 'spent' ? current.stats.received + sanitizedAmount : current.stats.received,
    exchanges: current.stats.exchanges + 1,
  };

  const entry: TimeBankTransaction = {
    id: Date.now(),
    kind: transaction.kind,
    amount: sanitizedAmount,
    description: transaction.description.trim() || (transaction.kind === 'earned' ? 'Completed service' : 'Spent credits'),
    createdAt: new Date().toISOString(),
  };

  const nextActivity = [
    `${transaction.kind === 'earned' ? 'Earned' : 'Spent'} ${sanitizedAmount} credit${sanitizedAmount === 1 ? '' : 's'} — ${entry.description}`,
    ...current.recentActivity,
  ];

  return saveProfile(email, {
    stats: nextStats,
    transactions: [entry, ...current.transactions],
    recentActivity: nextActivity,
  });
}

export function recordEarning(email: string, amount: number, description: string) {
  return recordTransaction(email, { kind: 'earned', amount, description });
}

export function recordSpending(email: string, amount: number, description: string) {
  return recordTransaction(email, { kind: 'spent', amount, description });
}

export function getSessionUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const storage = getStorage();
  if (!storage) return null;
  const fromLocal = readJSON<AuthUser | null>(window.localStorage, AUTH_STORAGE_KEY, null);
  if (fromLocal) return fromLocal;
  return readJSON<AuthUser | null>(window.sessionStorage, AUTH_SESSION_KEY, null);
}

export function setSessionUser(user: AuthUser, rememberMe: boolean) {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify(user);
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
  if (rememberMe) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
  } else {
    window.sessionStorage.setItem(AUTH_SESSION_KEY, payload);
  }
}

export function clearSessionUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_SESSION_KEY);
}

export function loginAccount({ email, password, rememberMe = false }: LoginInput): AuthUser {
  const account = findAccount(email);
  if (!account || account.password !== password) {
    throw new Error('No account found for this email. Please create a new account first.');
  }

  const user: AuthUser = {
    email: normalizeEmail(account.email),
    role: account.role,
    displayName: account.displayName,
    credits: account.credits,
    ageGroup: account.ageGroup ?? 'adult',
  };

  setSessionUser(user, rememberMe);
  return user;
}

export function registerAccount({ email, password, displayName, role = 'member', credits = 1, ageGroup = 'adult', rememberMe = true }: RegisterInput): AuthUser {
  const normalized = normalizeEmail(email);
  const accounts = getRegistry();
  if (accounts.some((account) => normalizeEmail(account.email) === normalized)) {
    throw new Error('This email is already registered. Please sign in instead.');
  }

  const user: AuthUser = {
    email: normalized,
    role,
    displayName: displayName.trim(),
    credits,
    ageGroup,
  };

  const nextAccounts: StoredAccount[] = [...accounts, { ...user, password }];
  saveRegistry(nextAccounts);
  saveProfile(normalized, createFreshProfile(user));
  setSessionUser(user, rememberMe);
  return user;
}

export function logoutAccount() {
  clearSessionUser();
}

export function listAccounts() {
  return getRegistry();
}
