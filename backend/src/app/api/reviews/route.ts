/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { createReview, listReviews } from '@/lib/server-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') ?? undefined;
  const items = await listReviews(email);
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createReview(body);
    return NextResponse.json({ created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create review';
    return NextResponse.json({ message }, { status: 400 });
  }
}
