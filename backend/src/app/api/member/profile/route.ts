/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { getAccount, getProfile, patchProfile } from '@/lib/server-db';
import { normalizeEmail, type TimeBankProfile } from '@/lib/timebank-store';

function readEmailFromRequest(request: Request, body?: unknown) {
  const url = new URL(request.url);
  const fromQuery = normalizeEmail(url.searchParams.get('email') ?? '');
  const fromBody = normalizeEmail(String((body as { email?: string } | undefined)?.email ?? ''));
  return fromBody || fromQuery;
}

export async function GET(request: Request) {
  const email = readEmailFromRequest(request);
  if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

  const account = await getAccount(email);
  if (!account) return NextResponse.json({ message: 'Member not found' }, { status: 404 });

  const profile = await getProfile(email);
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<TimeBankProfile> & { email?: string };
  const email = normalizeEmail(body.email ?? '');
  if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

  const account = await getAccount(email);
  if (!account) return NextResponse.json({ message: 'Member not found' }, { status: 404 });

  const profile = await patchProfile(email, body);
  return NextResponse.json({ profile });
}
