/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { createDispute, listDisputes, updateDispute } from '@/lib/server-db';

export async function GET() {
  const items = await listDisputes();
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createDispute(body);
    return NextResponse.json({ created }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create dispute';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'A valid dispute id is required' }, { status: 400 });
    }
    const updated = await updateDispute(id, {
      status: body?.status,
      resolution: body?.resolution,
    });
    if (!updated) {
      return NextResponse.json({ message: 'Dispute not found' }, { status: 404 });
    }
    return NextResponse.json({ updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update dispute';
    return NextResponse.json({ message }, { status: 400 });
  }
}
