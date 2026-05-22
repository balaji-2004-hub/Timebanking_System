/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { normalizeEmail, type AuthUser, type LoginInput } from '@/lib/timebank-store';
import { getAccount, ensureProfileForUser } from '@/lib/server-db';

// Authenticate a user against the stored account registry.
export async function POST(request: Request) {
  const body = (await request.json()) as LoginInput;
  const email = normalizeEmail(body.email);
  const account = await getAccount(email);
  if (!account || account.password !== body.password) {
    // Reject invalid credentials with a clear client-facing message.
    return NextResponse.json({ message: 'No account found for this email. Please create a new account first.' }, { status: 401 });
  }

  // Return the minimal authenticated user payload expected by the client.
  const user: AuthUser = {
    email: normalizeEmail(account.email),
    role: account.role,
    displayName: account.displayName,
    credits: account.credits,
    ageGroup: account.ageGroup ?? 'adult',
  };

  await ensureProfileForUser(user);
  return NextResponse.json({ user });
}
