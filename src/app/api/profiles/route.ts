import { NextResponse } from 'next/server';
import { getDbProfileByUsername, upsertDbProfile, isPostgresConfigured } from '@/lib/db';
import { UserProfile } from '@/types/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const identifier = searchParams.get('username') || searchParams.get('identifier');

  if (!identifier) {
    return NextResponse.json({ error: 'Missing username or identifier parameter' }, { status: 400 });
  }

  const profile = await getDbProfileByUsername(identifier);
  return NextResponse.json({ configured: isPostgresConfigured(), profile });
}

export async function POST(req: Request) {
  try {
    const profile = (await req.json()) as UserProfile;
    if (!profile || !profile.username || !profile.nickname) {
      return NextResponse.json({ success: false, error: 'Invalid profile data' }, { status: 400 });
    }

    const success = await upsertDbProfile(profile);
    return NextResponse.json({ configured: isPostgresConfigured(), success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
