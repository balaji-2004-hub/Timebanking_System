/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/server-db';

export async function GET() {
  const analytics = await getAnalytics();
  return NextResponse.json(analytics);
}
