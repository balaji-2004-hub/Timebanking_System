/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { completeExchange, getAccount } from '@/lib/server-db';
import { normalizeEmail } from '@/lib/timebank-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const providerEmail = normalizeEmail(String(body?.providerEmail ?? ''));
    const requesterEmail = normalizeEmail(String(body?.requesterEmail ?? ''));
    const amount = Number(body?.amount ?? 0);
    const description = String(body?.description ?? '').trim();

    if (!providerEmail || !requesterEmail) {
      return NextResponse.json({ message: 'Both providerEmail and requesterEmail are required' }, { status: 400 });
    }

    if (providerEmail === requesterEmail) {
      return NextResponse.json({ message: 'Choose two different users for an exchange' }, { status: 400 });
    }

    const [provider, requester] = await Promise.all([getAccount(providerEmail), getAccount(requesterEmail)]);
    if (!provider || !requester) {
      return NextResponse.json({ message: 'Both users must have registered accounts' }, { status: 404 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than zero' }, { status: 400 });
    }

    const result = await completeExchange({ providerEmail, requesterEmail, amount, description });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to complete exchange';
    return NextResponse.json({ message }, { status: 400 });
  }
}
