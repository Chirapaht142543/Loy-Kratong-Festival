import { NextResponse } from 'next/server';
import { getDbKrathongs, insertDbKrathong, isPostgresConfigured } from '@/lib/db';
import { RiverKrathongItem } from '@/components/MainRiverView';

export async function GET() {
  const items = await getDbKrathongs();

  return NextResponse.json(
    { configured: isPostgresConfigured(), data: items },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item, userId } = body as { item: RiverKrathongItem; userId?: string };

    if (!item || !item.id || !item.name) {
      return NextResponse.json({ success: false, error: 'Invalid krathong data' }, { status: 400 });
    }

    const success = await insertDbKrathong(item, userId);
    return NextResponse.json({ success, configured: isPostgresConfigured() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
