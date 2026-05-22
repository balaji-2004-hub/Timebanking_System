/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import type {
  AuthUser,
  LoginInput,
  RegisterInput,
  TimeBankProfile,
  AgeGroup,
} from '@/lib/timebank-store';

// Base URL for all backend requests. Falls back to the local backend during development.
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4029').replace(/\/$/, '');

// Build a full backend URL from a relative API path.
function apiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

// Shared JSON request helper used by all API wrapper functions.
async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      ...init,
    });
  } catch (error) {
    // Surface a friendlier error when the backend server is offline.
    throw new Error(`Cannot reach backend at ${API_BASE_URL}. Start the backend first.`);
  }

  const data = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    // Prefer server-sent error messages when available.
    throw new Error((data as { message?: string }).message || `Request failed (${response.status})`);
  }
  return data;
}

// Authenticate an existing user and return the server-issued profile.
export async function apiLogin(input: LoginInput): Promise<AuthUser> {
  const data = await requestJson<{ user: AuthUser }>(apiUrl('/api/auth/login'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.user;
}

// Register a new account and return the created user object.
export async function apiRegister(input: RegisterInput): Promise<AuthUser> {
  const data = await requestJson<{ user: AuthUser }>(apiUrl('/api/auth/register'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.user;
}

// Fetch the profile for a single member by email.
export async function apiGetProfile(email: string): Promise<TimeBankProfile> {
  const data = await requestJson<{ profile: TimeBankProfile }>(apiUrl(`/api/profile/${encodeURIComponent(email)}`));
  return data.profile;
}

// Update the profile fields that changed on the client.
export async function apiUpdateProfile(email: string, patch: Partial<TimeBankProfile>): Promise<TimeBankProfile> {
  const data = await requestJson<{ profile: TimeBankProfile }>(apiUrl(`/api/profile/${encodeURIComponent(email)}`), {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data.profile;
}

// Record earned credits after a completed activity.
export async function apiEarnCredits(email: string, amount: number, description: string): Promise<TimeBankProfile> {
  const data = await requestJson<{ profile: TimeBankProfile }>(apiUrl('/api/credits/earn'), {
    method: 'POST',
    body: JSON.stringify({ email, amount, description }),
  });
  return data.profile;
}

// Deduct credits for a completed spend action.
export async function apiSpendCredits(email: string, amount: number, description: string): Promise<TimeBankProfile> {
  const data = await requestJson<{ profile: TimeBankProfile }>(apiUrl('/api/credits/spend'), {
    method: 'POST',
    body: JSON.stringify({ email, amount, description }),
  });
  return data.profile;
}

export async function apiCompleteExchange(input: {
  providerEmail: string;
  requesterEmail: string;
  amount: number;
  description: string;
}): Promise<{ provider: TimeBankProfile; requester: TimeBankProfile; exchange: { id: number; providerEmail: string; requesterEmail: string; amount: number; description: string; status: 'completed' | 'pending' | 'cancelled'; createdAt: string } }> {
  return requestJson(apiUrl('/api/credits/exchange'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiCreateListing(input: {
  ownerEmail: string;
  title: string;
  category: string;
  type: 'offer' | 'request';
  description: string;
  creditHours: number;
}) {
  return requestJson(apiUrl('/api/listings'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiListListings(ownerEmail?: string): Promise<{ items: Array<{ id: number; ownerEmail: string; title: string; category: string; type: 'offer' | 'request'; description: string; creditHours: number; createdAt: string }>; total: number }> {
  const query = ownerEmail ? `?ownerEmail=${encodeURIComponent(ownerEmail)}` : '';
  return requestJson(apiUrl(`/api/listings${query}`));
}

export async function apiGetListing(id: number): Promise<{ listing: { id: number; ownerEmail: string; title: string; category: string; type: 'offer' | 'request'; description: string; creditHours: number; createdAt: string } }> {
  return requestJson(apiUrl(`/api/listings/${id}`));
}

export async function apiListMembers(): Promise<{
  members: Array<{
    email: string;
    displayName: string;
    role: string;
    credits: number;
    exchanges: number;
    skillsOffered: string[];
    neighborhood: string;
    ageGroup: AgeGroup;
    rating?: number;
    reviews?: number;
    listings?: number;
  }>;
  total: number;
}> {
  const data = await requestJson<{ items: Array<any>; total: number }>(apiUrl('/api/admin/members'));
  return { members: data.items, total: data.total };
}

export async function apiListMessages(email: string) {
  return requestJson<{ items: Array<{ id: number; senderEmail: string; recipientEmail: string; subject: string; body: string; createdAt: string; read: boolean; threadId: string }>; total: number }>(apiUrl(`/api/messages?email=${encodeURIComponent(email)}`));
}

export async function apiSendMessage(input: { senderEmail: string; recipientEmail: string; subject: string; body: string }) {
  return requestJson(apiUrl('/api/messages'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiMarkMessageRead(id: number) {
  return requestJson(apiUrl('/api/messages'), {
    method: 'PATCH',
    body: JSON.stringify({ id }),
  });
}

export async function apiListReviews(email?: string) {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  return requestJson<{ items: Array<{ id: number; authorEmail: string; targetEmail: string; rating: number; comment: string; exchangeId?: number | null; createdAt: string }>; total: number }>(apiUrl(`/api/reviews${query}`));
}

export async function apiCreateReview(input: { authorEmail: string; targetEmail: string; rating: number; comment: string; exchangeId?: number | null }) {
  return requestJson(apiUrl('/api/reviews'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiListAnalytics() {
  return requestJson(apiUrl('/api/admin/analytics'));
}

export async function apiListDisputes() {
  return requestJson(apiUrl('/api/admin/disputes'));
}

export async function apiCreateDispute(input: { reporterEmail: string; exchangeId?: number | null; title: string; details: string; severity: 'low' | 'medium' | 'high' }) {
  return requestJson(apiUrl('/api/admin/disputes'), {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function apiUpdateDispute(input: { id: number; status?: 'open' | 'investigating' | 'resolved'; resolution?: string | null }) {
  return requestJson(apiUrl('/api/admin/disputes'), {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
