/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { getListing } from '@/lib/server-db';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(Number(id));
  if (!listing) {
    return NextResponse.json({ message: 'Listing not found' }, { status: 404 });
  }
  return NextResponse.json({ listing });
}
