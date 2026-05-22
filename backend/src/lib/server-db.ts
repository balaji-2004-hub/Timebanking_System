/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { promises as fs } from 'fs';
import path from 'path';
import type {
  AgeGroup,
  AuthUser,
  StoredAccount,
  TimeBankListing,
  TimeBankProfile,
  TimeBankSettings,
  TimeBankStats,
  TimeBankTransaction,
} from '@/lib/timebank-store';
import { createFreshProfile, DEFAULT_SETTINGS, hasMeaningfulText, normalizeDescription, normalizeEmail } from '@/lib/timebank-store';

export interface ServiceListingRecord extends TimeBankListing {
  id: number;
  ownerEmail: string;
  createdAt: string;
}

export interface ExchangeRecord {
  id: number;
  providerEmail: string;
  requesterEmail: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface MessageRecord {
  id: number;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
  createdAt: string;
  read: boolean;
  threadId: string;
}

export interface ReviewRecord {
  id: number;
  authorEmail: string;
  targetEmail: string;
  rating: number;
  comment: string;
  exchangeId?: number | null;
  createdAt: string;
}

export interface DisputeRecord {
  id: number;
  reporterEmail: string;
  exchangeId?: number | null;
  title: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
  resolvedAt?: string | null;
  resolution?: string | null;
}

export interface TimeBankDatabase {
  accounts: StoredAccount[];
  profiles: Record<string, TimeBankProfile>;
  listings: ServiceListingRecord[];
  exchanges: ExchangeRecord[];
  messages: MessageRecord[];
  reviews: ReviewRecord[];
  disputes: DisputeRecord[];
}

export interface AnalyticsSummary {
  totals: {
    members: number;
    admins: number;
    credits: number;
    exchanges: number;
    listings: number;
    messages: number;
    reviews: number;
    disputes: number;
    openDisputes: number;
    averageRating: number;
  };
  topMembers: Array<{
    email: string;
    displayName: string;
    credits: number;
    exchanges: number;
    rating: number;
  }>;
  recentExchanges: ExchangeRecord[];
  recentListings: ServiceListingRecord[];
  categoryBreakdown: Array<{ category: string; count: number }>;
}

// Local JSON database directory used by the backend during development.
const DB_DIR = path.join(process.cwd(), '.timebank');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default in-memory structure when no database file exists yet.
const EMPTY_DB: TimeBankDatabase = {
  accounts: [],
  profiles: {},
  listings: [],
  exchanges: [],
  messages: [],
  reviews: [],
  disputes: [],
};

// Build default seed data or derived structures for the persistent store.
function buildDescriptionKey(value: string) {
  return normalizeDescription(value);
}

function hasDuplicateDescription<T extends { description: string }>(items: T[], description: string) {
  const key = buildDescriptionKey(description);
  return items.some((item) => buildDescriptionKey(item.description) === key);
}

async function ensureDbFile() {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), 'utf8');
  }
}

function coerceProfile(profile: Partial<TimeBankProfile> | undefined, fallback: TimeBankProfile) {
  if (!profile) return fallback;
  return {
    ...fallback,
    ...profile,
    email: normalizeEmail(profile.email ?? fallback.email),
    ageGroup: profile.ageGroup ?? fallback.ageGroup,
    stats: { ...fallback.stats, ...(profile.stats ?? {}) },
    settings: { ...fallback.settings, ...(profile.settings ?? {}) },
    skillsOffered: Array.isArray(profile.skillsOffered) ? profile.skillsOffered : [],
    skillsNeeded: Array.isArray(profile.skillsNeeded) ? profile.skillsNeeded : [],
    recentActivity: Array.isArray(profile.recentActivity) ? profile.recentActivity : [],
    transactions: Array.isArray(profile.transactions) ? profile.transactions : [],
    firstListing: profile.firstListing ?? null,
  };
}

function avgRating(reviews: ReviewRecord[], targetEmail?: string) {
  const filtered = targetEmail ? reviews.filter((review) => normalizeEmail(review.targetEmail) === normalizeEmail(targetEmail)) : reviews;
  if (!filtered.length) return 0;
  return filtered.reduce((acc, review) => acc + review.rating, 0) / filtered.length;
}

function threadIdFor(a: string, b: string) {
  return [normalizeEmail(a), normalizeEmail(b)].sort().join('::');
}

export async function readDb(): Promise<TimeBankDatabase> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  try {
    const parsed = JSON.parse(raw) as Partial<TimeBankDatabase>;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      profiles: parsed.profiles && typeof parsed.profiles === 'object' ? (parsed.profiles as Record<string, TimeBankProfile>) : {},
      listings: Array.isArray(parsed.listings) ? parsed.listings : [],
      exchanges: Array.isArray(parsed.exchanges) ? parsed.exchanges : [],
      messages: Array.isArray((parsed as Partial<TimeBankDatabase>).messages) ? ((parsed as Partial<TimeBankDatabase>).messages as MessageRecord[]) : [],
      reviews: Array.isArray((parsed as Partial<TimeBankDatabase>).reviews) ? ((parsed as Partial<TimeBankDatabase>).reviews as ReviewRecord[]) : [],
      disputes: Array.isArray((parsed as Partial<TimeBankDatabase>).disputes) ? ((parsed as Partial<TimeBankDatabase>).disputes as DisputeRecord[]) : [],
    };
  } catch {
    return { ...EMPTY_DB };
  }
}

export async function writeDb(db: TimeBankDatabase) {
  await ensureDbFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

export async function getAccount(email: string) {
  const db = await readDb();
  const normalized = normalizeEmail(email);
  return db.accounts.find((account) => normalizeEmail(account.email) === normalized) ?? null;
}

export async function saveAccount(account: StoredAccount) {
  const db = await readDb();
  const normalized = normalizeEmail(account.email);
  const index = db.accounts.findIndex((item) => normalizeEmail(item.email) === normalized);
  if (index >= 0) db.accounts[index] = account;
  else db.accounts.push(account);
  await writeDb(db);
}

// Ensure every authenticated user has a profile record in the store.
export async function ensureProfileForUser(user: AuthUser) {
  const db = await readDb();
  const normalized = normalizeEmail(user.email);
  if (!db.profiles[normalized]) {
    db.profiles[normalized] = createFreshProfile(user);
    await writeDb(db);
  }
  return db.profiles[normalized];
}

export async function getProfile(email: string) {
  const db = await readDb();
  const normalized = normalizeEmail(email);
  const fallback = createFreshProfile({ email: normalized, displayName: 'New user', role: 'member', credits: 1, ageGroup: 'adult' });
  return coerceProfile(db.profiles[normalized], fallback);
}

export async function putProfile(email: string, profile: TimeBankProfile) {
  const db = await readDb();
  const normalized = normalizeEmail(email);
  db.profiles[normalized] = { ...profile, email: normalized };
  const account = db.accounts.find((item) => normalizeEmail(item.email) === normalized);
  if (account) {
    account.displayName = profile.displayName;
    account.role = profile.role;
    account.credits = profile.stats.credits;
    account.ageGroup = profile.ageGroup;
  }
  await writeDb(db);
  return db.profiles[normalized];
}

export async function patchProfile(email: string, patch: Partial<TimeBankProfile>) {
  const current = await getProfile(email);
  const merged: TimeBankProfile = {
    ...current,
    ...patch,
    ageGroup: patch.ageGroup ?? current.ageGroup,
    stats: { ...current.stats, ...(patch.stats ?? {}) },
    settings: { ...current.settings, ...(patch.settings ?? {}) },
    skillsOffered: patch.skillsOffered ?? current.skillsOffered,
    skillsNeeded: patch.skillsNeeded ?? current.skillsNeeded,
    recentActivity: patch.recentActivity ?? current.recentActivity,
    transactions: patch.transactions ?? current.transactions,
    firstListing: patch.firstListing === undefined ? current.firstListing : patch.firstListing,
  };
  return putProfile(email, merged);
}

export async function addTransaction(
  email: string,
  transaction: { kind: 'earned' | 'spent'; amount: number; description: string },
) {
  const account = await getAccount(email);
  if (!account) throw new Error('Member not found');

  const current = await getProfile(email);
  const amount = Math.max(1, Math.floor(Number(transaction.amount) || 0));
  const description = transaction.description.trim();
  if (!hasMeaningfulText(description)) throw new Error('Description is required');
  if (hasDuplicateDescription(current.transactions, description)) throw new Error('Duplicate description is not allowed');

  const createdAt = new Date().toISOString();
  const entry: TimeBankTransaction = { id: Date.now(), kind: transaction.kind, amount, description, createdAt };

  const nextStats: TimeBankStats = {
    ...current.stats,
    credits: transaction.kind === 'earned' ? current.stats.credits + amount : Math.max(0, current.stats.credits - amount),
    given: transaction.kind === 'earned' ? current.stats.given + amount : current.stats.given,
    received: transaction.kind === 'spent' ? current.stats.received + amount : current.stats.received,
    exchanges: current.stats.exchanges + 1,
  };

  const nextProfile: TimeBankProfile = {
    ...current,
    stats: nextStats,
    transactions: [entry, ...current.transactions],
    recentActivity: [`${transaction.kind === 'earned' ? 'Earned' : 'Spent'} ${amount} credit${amount === 1 ? '' : 's'} — ${entry.description}`, ...current.recentActivity],
  };

  return putProfile(email, nextProfile);
}

export async function completeExchange(input: {
  providerEmail: string;
  requesterEmail: string;
  amount: number;
  description: string;
}) {
  const providerEmail = normalizeEmail(input.providerEmail);
  const requesterEmail = normalizeEmail(input.requesterEmail);
  if (providerEmail === requesterEmail) throw new Error('Provider and requester must be different users');

  const providerAccount = await getAccount(providerEmail);
  const requesterAccount = await getAccount(requesterEmail);
  if (!providerAccount || !requesterAccount) throw new Error('Both users must already exist');

  const provider = await getProfile(providerEmail);
  const requester = await getProfile(requesterEmail);
  const amount = Math.max(1, Math.floor(Number(input.amount) || 0));
  const description = input.description.trim();
  if (!hasMeaningfulText(description)) throw new Error('Description is required');
  if (hasDuplicateDescription(provider.transactions, description) || hasDuplicateDescription(requester.transactions, description)) {
    throw new Error('Duplicate description is not allowed');
  }

  const createdAt = new Date().toISOString();
  const nextProvider = await putProfile(providerEmail, {
    ...provider,
    stats: {
      ...provider.stats,
      credits: provider.stats.credits + amount,
      given: provider.stats.given + amount,
      exchanges: provider.stats.exchanges + 1,
    },
    transactions: [
      { id: Date.now(), kind: 'earned', amount, description: `Earned from ${requester.displayName}: ${description}`, createdAt },
      ...provider.transactions,
    ],
    recentActivity: [`Earned ${amount} credit${amount === 1 ? '' : 's'} from ${requester.displayName} — ${description}`, ...provider.recentActivity],
  });

  const nextRequester = await putProfile(requesterEmail, {
    ...requester,
    stats: {
      ...requester.stats,
      credits: Math.max(0, requester.stats.credits - amount),
      received: requester.stats.received + amount,
      exchanges: requester.stats.exchanges + 1,
    },
    transactions: [
      { id: Date.now() + 1, kind: 'spent', amount, description: `Paid to ${provider.displayName}: ${description}`, createdAt },
      ...requester.transactions,
    ],
    recentActivity: [`Spent ${amount} credit${amount === 1 ? '' : 's'} on ${provider.displayName} — ${description}`, ...requester.recentActivity],
  });

  const db = await readDb();
  const exchange: ExchangeRecord = {
    id: Date.now(),
    providerEmail,
    requesterEmail,
    amount,
    description,
    status: 'completed',
    createdAt,
  };
  db.exchanges = [exchange, ...db.exchanges];
  await writeDb(db);
  return { provider: nextProvider, requester: nextRequester, exchange };
}

export async function createListing(input: {
  ownerEmail: string;
  title: string;
  category: string;
  type: 'offer' | 'request';
  description: string;
  creditHours: number;
}) {
  const db = await readDb();
  const ownerEmail = normalizeEmail(input.ownerEmail);
  const account = db.accounts.find((item) => normalizeEmail(item.email) === ownerEmail);
  if (!account) throw new Error('Member not found');

  const title = input.title.trim();
  const category = input.category.trim();
  const description = input.description.trim();
  if (!hasMeaningfulText(description)) throw new Error('Description is required');
  if (db.listings.some((item) => normalizeEmail(item.ownerEmail) === ownerEmail && buildDescriptionKey(item.description) === buildDescriptionKey(description))) {
    throw new Error('Duplicate description is not allowed');
  }

  const listing: ServiceListingRecord = {
    id: Date.now(),
    ownerEmail,
    title,
    category,
    type: input.type,
    description,
    creditHours: Math.max(1, Math.floor(Number(input.creditHours) || 1)),
    createdAt: new Date().toISOString(),
  };
  db.listings = [listing, ...db.listings];
  const current = db.profiles[ownerEmail] ?? createFreshProfile({ email: ownerEmail, displayName: 'New user', role: 'member', credits: 1, ageGroup: 'adult' });
  db.profiles[ownerEmail] = {
    ...current,
    firstListing: { title: listing.title, category: listing.category, type: listing.type, description: listing.description, creditHours: listing.creditHours },
    stats: { ...current.stats, listings: current.stats.listings + 1 },
    recentActivity: [`Posted ${listing.type} listing: ${listing.title}`, ...current.recentActivity],
  };
  await writeDb(db);
  return listing;
}

export async function getListing(id: number) {
  const db = await readDb();
  return db.listings.find((listing) => listing.id === id) ?? null;
}

export async function listListings() {
  const db = await readDb();
  return db.listings;
}

export async function listProfiles() {
  const db = await readDb();
  return Object.values(db.profiles).map((profile) => ({ ...profile, ageGroup: profile.ageGroup ?? 'adult' }));
}

export async function listMembersSummary() {
  const profiles = await listProfiles();
  return profiles
    .sort((a, b) => b.stats.exchanges - a.stats.exchanges)
    .map((profile) => ({
      email: profile.email,
      displayName: profile.displayName,
      role: profile.role,
      ageGroup: profile.ageGroup,
      credits: profile.stats.credits,
      exchanges: profile.stats.exchanges,
      skillsOffered: profile.skillsOffered,
      neighborhood: profile.neighborhood,
      rating: profile.stats.rating,
      reviews: profile.stats.reviews,
      listings: profile.stats.listings,
    }));
}

export async function listMessages(email?: string) {
  const db = await readDb();
  const normalized = email ? normalizeEmail(email) : '';
  return db.messages.filter((message) => !normalized || message.senderEmail === normalized || message.recipientEmail === normalized);
}

export async function sendMessage(input: {
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  body: string;
}) {
  const senderEmail = normalizeEmail(input.senderEmail);
  const recipientEmail = normalizeEmail(input.recipientEmail);
  if (!senderEmail || !recipientEmail) throw new Error('Sender and recipient are required');
  if (senderEmail === recipientEmail) throw new Error('Choose another user to message');
  const [sender, recipient] = await Promise.all([getAccount(senderEmail), getAccount(recipientEmail)]);
  if (!sender || !recipient) throw new Error('Both users must have registered accounts');

  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!hasMeaningfulText(subject) || !hasMeaningfulText(body)) throw new Error('Subject and message are required');

  const message: MessageRecord = {
    id: Date.now(),
    senderEmail,
    recipientEmail,
    subject,
    body,
    createdAt: new Date().toISOString(),
    read: false,
    threadId: threadIdFor(senderEmail, recipientEmail),
  };

  const db = await readDb();
  db.messages = [message, ...db.messages];
  await writeDb(db);
  return message;
}

export async function markMessageRead(id: number) {
  const db = await readDb();
  const index = db.messages.findIndex((message) => message.id === id);
  if (index >= 0) {
    db.messages[index] = { ...db.messages[index], read: true };
    await writeDb(db);
    return db.messages[index];
  }
  return null;
}

export async function listReviews(email?: string) {
  const db = await readDb();
  const normalized = email ? normalizeEmail(email) : '';
  return db.reviews.filter((review) => !normalized || review.authorEmail === normalized || review.targetEmail === normalized);
}

export async function createReview(input: {
  authorEmail: string;
  targetEmail: string;
  rating: number;
  comment: string;
  exchangeId?: number | null;
}) {
  const authorEmail = normalizeEmail(input.authorEmail);
  const targetEmail = normalizeEmail(input.targetEmail);
  if (!authorEmail || !targetEmail) throw new Error('Author and target are required');
  if (authorEmail === targetEmail) throw new Error('You cannot review yourself');

  const [author, target] = await Promise.all([getAccount(authorEmail), getAccount(targetEmail)]);
  if (!author || !target) throw new Error('Both users must have registered accounts');

  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 0)));
  const comment = input.comment.trim();
  if (!hasMeaningfulText(comment)) throw new Error('Comment is required');

  const review: ReviewRecord = {
    id: Date.now(),
    authorEmail,
    targetEmail,
    rating,
    comment,
    exchangeId: input.exchangeId ?? null,
    createdAt: new Date().toISOString(),
  };

  const db = await readDb();
  db.reviews = [review, ...db.reviews];
  const targetProfile = coerceProfile(db.profiles[targetEmail], createFreshProfile({ email: targetEmail, displayName: target.displayName, role: target.role, credits: target.credits ?? 1, ageGroup: target.ageGroup ?? 'adult' }));
  const nextCount = targetProfile.stats.reviews + 1;
  const nextRating = ((targetProfile.stats.rating * targetProfile.stats.reviews) + rating) / nextCount;
  db.profiles[targetEmail] = {
    ...targetProfile,
    stats: {
      ...targetProfile.stats,
      reviews: nextCount,
      rating: Number(nextRating.toFixed(1)),
    },
    recentActivity: [`Received a ${rating}-star review from ${author.displayName}`, ...targetProfile.recentActivity],
  };
  await writeDb(db);
  return review;
}

export async function listDisputes() {
  const db = await readDb();
  return db.disputes;
}

export async function createDispute(input: {
  reporterEmail: string;
  exchangeId?: number | null;
  title: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}) {
  const reporterEmail = normalizeEmail(input.reporterEmail);
  const reporter = await getAccount(reporterEmail);
  if (!reporter) throw new Error('Member not found');
  const title = input.title.trim();
  const details = input.details.trim();
  if (!hasMeaningfulText(title) || !hasMeaningfulText(details)) throw new Error('Title and details are required');

  const dispute: DisputeRecord = {
    id: Date.now(),
    reporterEmail,
    exchangeId: input.exchangeId ?? null,
    title,
    details,
    severity: input.severity,
    status: 'open',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolution: null,
  };

  const db = await readDb();
  db.disputes = [dispute, ...db.disputes];
  await writeDb(db);
  return dispute;
}

export async function updateDispute(id: number, patch: Partial<Pick<DisputeRecord, 'status' | 'resolution'>>) {
  const db = await readDb();
  const index = db.disputes.findIndex((dispute) => dispute.id === id);
  if (index < 0) return null;

  db.disputes[index] = {
    ...db.disputes[index],
    ...patch,
    resolvedAt: patch.status === 'resolved' ? new Date().toISOString() : db.disputes[index].resolvedAt ?? null,
  };
  await writeDb(db);
  return db.disputes[index];
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const db = await readDb();
  const profiles = Object.values(db.profiles).map((profile) => coerceProfile(profile, createFreshProfile({ email: profile.email, displayName: profile.displayName, role: profile.role, credits: profile.stats?.credits ?? 1, ageGroup: profile.ageGroup ?? 'adult' })));
  const members = db.accounts.filter((account) => account.role === 'member').length;
  const admins = db.accounts.filter((account) => account.role === 'admin').length;
  const credits = profiles.reduce((sum, profile) => sum + (profile.stats?.credits ?? 0), 0);
  const exchanges = db.exchanges.length;
  const listings = db.listings.length;
  const messages = db.messages.length;
  const reviews = db.reviews.length;
  const disputes = db.disputes.length;
  const openDisputes = db.disputes.filter((item) => item.status !== 'resolved').length;
  const averageRating = reviews ? db.reviews.reduce((sum, review) => sum + review.rating, 0) / reviews : 0;

  const topMembers = profiles
    .map((profile) => ({
      email: profile.email,
      displayName: profile.displayName,
      credits: profile.stats.credits,
      exchanges: profile.stats.exchanges,
      rating: profile.stats.rating,
    }))
    .sort((a, b) => b.exchanges - a.exchanges || b.credits - a.credits)
    .slice(0, 5);

  const categoryMap = new Map<string, number>();
  for (const listing of db.listings) {
    const category = listing.category || 'Uncategorized';
    categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
  }

  return {
    totals: {
      members,
      admins,
      credits,
      exchanges,
      listings,
      messages,
      reviews,
      disputes,
      openDisputes,
      averageRating: Number(averageRating.toFixed(1)),
    },
    topMembers,
    recentExchanges: db.exchanges.slice(0, 8),
    recentListings: db.listings.slice(0, 8),
    categoryBreakdown: [...categoryMap.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
  };
}
