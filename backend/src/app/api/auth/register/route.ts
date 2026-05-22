/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { createFreshProfile, normalizeEmail, type AuthUser, type RegisterInput } from '@/lib/timebank-store';
import { getAccount, saveAccount, ensureProfileForUser } from '@/lib/server-db';

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterInput;
  const email = normalizeEmail(body.email);
  if (!email || !body.password || !body.displayName) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const existing = await getAccount(email);
  if (existing) {
    return NextResponse.json({ message: 'This email is already registered. Please sign in instead.' }, { status: 409 });
  }

  const user: AuthUser = {
    email,
    role: body.role ?? 'member',
    displayName: body.displayName.trim(),
    credits: body.credits ?? 1,
    ageGroup: body.ageGroup ?? 'adult',
  };

  await saveAccount({ ...user, password: body.password });
  await ensureProfileForUser(user);
  return NextResponse.json({ user }, { status: 201 });
}
