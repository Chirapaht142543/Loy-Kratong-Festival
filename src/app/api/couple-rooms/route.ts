import { NextResponse } from 'next/server';
import {
  createCoupleRoomDb,
  getCoupleRoomDb,
  joinCoupleRoomDb,
  updateCoupleRoomDesignDb,
  markCoupleRoomFloatedDb,
} from '@/lib/db';
import { CoupleRoom, KrathongDesign } from '@/types/krathong';

// Helper to generate a friendly 6-char room code (e.g. CP-7842)
function generateRoomCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `CP-${digits}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Missing room code' }, { status: 400 });
  }

  const room = await getCoupleRoomDb(code);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(
    { room },
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
    const { action } = body;

    if (action === 'create') {
      const { hostName, hostAvatar, hostWish, design } = body;
      if (!hostName || !hostName.trim()) {
        return NextResponse.json({ error: 'Host name is required' }, { status: 400 });
      }

      // Generate unique room code
      let code = generateRoomCode();
      let attempts = 0;
      while ((await getCoupleRoomDb(code)) && attempts < 5) {
        code = generateRoomCode();
        attempts++;
      }

      const now = new Date().toISOString();
      const room: CoupleRoom = {
        code,
        status: 'waiting',
        hostName: hostName.trim(),
        hostAvatar: hostAvatar || undefined,
        hostWish: hostWish?.trim() || 'ขอให้ความรักของเราสองคนมั่นคง หวานชื่นตลอดไป 💖',
        design: design || { base: 'lotus', flower: 'rose', candle: 'pink-love' },
        createdAt: now,
        updatedAt: now,
      };

      const created = await createCoupleRoomDb(room);
      return NextResponse.json({ success: true, room: created });
    }

    if (action === 'join') {
      const { code, partnerName, partnerAvatar, partnerWish } = body;
      if (!code || !partnerName || !partnerName.trim()) {
        return NextResponse.json({ error: 'Code and partner name are required' }, { status: 400 });
      }

      const room = await joinCoupleRoomDb(code, partnerName, partnerAvatar, partnerWish);
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, room });
    }

    if (action === 'update_design') {
      const { code, design } = body;
      if (!code || !design) {
        return NextResponse.json({ error: 'Missing code or design' }, { status: 400 });
      }

      const room = await updateCoupleRoomDesignDb(code, design);
      return NextResponse.json({ success: Boolean(room), room });
    }

    if (action === 'float') {
      const { code, krathongId } = body;
      if (!code || !krathongId) {
        return NextResponse.json({ error: 'Missing code or krathongId' }, { status: 400 });
      }

      const room = await markCoupleRoomFloatedDb(code, krathongId);
      return NextResponse.json({ success: Boolean(room), room });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
