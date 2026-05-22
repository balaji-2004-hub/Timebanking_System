/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { listMembersSummary } from '@/lib/server-db';

export async function GET() {
  const members = await listMembersSummary();
  return NextResponse.json({ items: members, total: members.length });
}
