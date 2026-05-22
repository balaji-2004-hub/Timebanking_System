/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { createListing, listListings, getAccount } from '@/lib/server-db';
import { normalizeEmail } from '@/lib/timebank-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownerEmail = searchParams.get('ownerEmail');
  const listings = await listListings();
  const items = ownerEmail ? listings.filter((listing) => normalizeEmail(listing.ownerEmail) === normalizeEmail(ownerEmail)) : listings;
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ownerEmail, title, category, type, description, creditHours } = body ?? {};
    const normalizedOwner = normalizeEmail(String(ownerEmail ?? ''));

    if (!normalizedOwner || !title || !category || !type || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const account = await getAccount(normalizedOwner);
    if (!account) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    const listing = await createListing({ ownerEmail: normalizedOwner, title, category, type, description, creditHours: Number(creditHours) });
    return NextResponse.json({ created: listing }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create listing';
    return NextResponse.json({ message }, { status: 400 });
  }
}
