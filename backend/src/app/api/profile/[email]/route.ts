/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { normalizeEmail, type TimeBankProfile } from '@/lib/timebank-store';
import { getAccount, getProfile, patchProfile } from '@/lib/server-db';

export async function GET(_: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const emailNormalized = normalizeEmail(email);
  const account = await getAccount(emailNormalized);
  if (!account) {
    return NextResponse.json({ message: 'Member not found' }, { status: 404 });
  }

  const profile = await getProfile(emailNormalized);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;
  const emailNormalized = normalizeEmail(email);
  const account = await getAccount(emailNormalized);
  if (!account) {
    return NextResponse.json({ message: 'Member not found' }, { status: 404 });
  }

  const patch = (await request.json()) as Partial<TimeBankProfile>;
  const profile = await patchProfile(emailNormalized, patch);
  return NextResponse.json({ profile });
}
