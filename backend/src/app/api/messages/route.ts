/* Backend module: exposes TimeBank server routes, validations, and persistence operations. */
import { NextResponse } from 'next/server';
import { listMessages, sendMessage, markMessageRead } from '@/lib/server-db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') ?? undefined;
  const items = await listMessages(email);
  return NextResponse.json({ items, total: items.length });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = await sendMessage(body);
    return NextResponse.json({ created: message }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send message';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'A valid message id is required' }, { status: 400 });
    }
    const updated = await markMessageRead(id);
    if (!updated) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }
    return NextResponse.json({ updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update message';
    return NextResponse.json({ message }, { status: 400 });
  }
}
