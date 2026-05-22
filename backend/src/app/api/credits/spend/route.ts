/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { addTransaction, getAccount } from '@/lib/server-db';
import { normalizeEmail } from '@/lib/timebank-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(String(body?.email ?? ''));
    const amount = Number(body?.amount ?? 0);
    const description = String(body?.description ?? '').trim();

    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    const account = await getAccount(email);
    if (!account) return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    if (!Number.isFinite(amount) || amount <= 0) return NextResponse.json({ message: 'Amount must be greater than zero' }, { status: 400 });

    const profile = await addTransaction(email, { kind: 'spent', amount, description });
    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update credits';
    return NextResponse.json({ message }, { status: 400 });
  }
}
