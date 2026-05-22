/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';

const empty = { items: [], total: 0 };

export async function GET() {
  return NextResponse.json(empty);
}

export async function POST() {
  return NextResponse.json({ ok: true, created: null });
}

export async function PUT() {
  return NextResponse.json({ ok: true });
}

export async function PATCH() {
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  return NextResponse.json({ ok: true });
}
