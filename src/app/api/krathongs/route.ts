import { NextResponse } from 'next/server';
import { getDbKrathongs, insertDbKrathong, isPostgresConfigured } from '@/lib/db';
import { RiverKrathongItem } from '@/components/MainRiverView';

export async function GET() {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, data: [] });
  }

  const items = await getDbKrathongs();
  if (items === null) {
    return NextResponse.json({ configured: true, error: 'Database connection failed', data: [] }, { status: 500 });
  }

  return NextResponse.json({ configured: true, data: items });
}

export async function POST(req: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, success: false, message: 'Database not configured' });
  }

  try {
    const body = await req.json();
    const { item, userId } = body as { item: RiverKrathongItem; userId?: string };

    if (!item || !item.id || !item.name) {
      return NextResponse.json({ success: false, error: 'Invalid krathong data' }, { status: 400 });
    }

    const success = await insertDbKrathong(item, userId);
    return NextResponse.json({ success, configured: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
