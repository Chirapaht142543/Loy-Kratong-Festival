import { NextResponse } from 'next/server';
import { getDbProfileByUsername, upsertDbProfile, isPostgresConfigured } from '@/lib/db';
import { UserProfile } from '@/types/auth';

export async function GET(req: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, profile: null });
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Missing username parameter' }, { status: 400 });
  }

  const profile = await getDbProfileByUsername(username);
  return NextResponse.json({ configured: true, profile });
}

export async function POST(req: Request) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ configured: false, success: false });
  }

  try {
    const profile = (await req.json()) as UserProfile;
    if (!profile || !profile.username || !profile.nickname) {
      return NextResponse.json({ success: false, error: 'Invalid profile data' }, { status: 400 });
    }

    const success = await upsertDbProfile(profile);
    return NextResponse.json({ configured: true, success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
