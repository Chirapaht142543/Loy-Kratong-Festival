import { NextResponse } from 'next/server';
import { incrementDbLikes, isPostgresConfigured } from '@/lib/db';

export async function POST(req: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, success: false });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing krathong id' }, { status: 400 });
    }

    const newLikes = await incrementDbLikes(id);
    return NextResponse.json({ success: newLikes !== null, likes: newLikes, configured: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
