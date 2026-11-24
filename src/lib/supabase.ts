import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { RiverKrathongItem } from '@/components/MainRiverView';
import { UserProfile } from '@/types/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Create a single Supabase client for interacting with your database
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// 1. KRATHONGS DATABASE & REALTIME
// ==========================================

export interface SupabaseKrathongRow {
  id: string;
  mode: 'single' | 'couple' | 'family';
  name: string;
  partner_name: string | null;
  design: any;
  wish: string;
  zodiac: string | null;
  avatar_url: string | null;
  likes: number;
  lane: number;
  speed: number;
  delay: number;
  user_id: string | null;
  created_at: string;
}

// Convert Supabase database row to frontend RiverKrathongItem
export const rowToRiverItem = (row: SupabaseKrathongRow): RiverKrathongItem => {
  return {
    id: row.id,
    mode: row.mode,
    name: row.name,
    partnerName: row.partner_name || undefined,
    design: row.design || { base: 'lotus', flower: 'marigold', candle: 'classic' },
    wish: row.wish || '',
    zodiac: row.zodiac || undefined,
    avatarUrl: row.avatar_url || undefined,
    likes: row.likes || 1,
    lane: typeof row.lane === 'number' ? row.lane : 2,
    speed: typeof row.speed === 'number' ? row.speed : 25,
    delay: typeof row.delay === 'number' ? row.delay : 0,
  };
};

// Fetch latest krathongs from Supabase
export const fetchRemoteKrathongs = async (limit = 100): Promise<RiverKrathongItem[] | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('krathongs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetch krathongs error:', error.message);
      return null;
    }

    if (!data) return [];
    return (data as SupabaseKrathongRow[]).map(rowToRiverItem);
  } catch (err) {
    console.error('Failed to fetch remote krathongs:', err);
    return null;
  }
};

// Insert a newly released krathong to Supabase
export const insertRemoteKrathong = async (
  item: RiverKrathongItem,
  userId?: string
): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const row = {
      id: item.id,
      mode: item.mode,
      name: item.name,
      partner_name: item.partnerName || null,
      design: item.design,
      wish: item.wish,
      zodiac: item.zodiac || null,
      avatar_url: item.avatarUrl || null,
      likes: item.likes || 1,
      lane: item.lane,
      speed: item.speed,
      delay: item.delay,
      user_id: userId || null,
    };

    const { error } = await supabase.from('krathongs').insert([row]);
    if (error) {
      console.error('Supabase insert krathong error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert remote krathong:', err);
    return false;
  }
};

// Increment likes on a krathong
export const incrementRemoteLikes = async (krathongId: string): Promise<boolean> => {
  if (!supabase) return false;

  try {
    // Attempt RPC increment if stored procedure is installed
    const { error: rpcError } = await supabase.rpc('increment_likes', {
      target_krathong_id: krathongId,
    });

    if (!rpcError) return true;

    // Fallback: direct update if RPC is missing
    const { data } = await supabase
      .from('krathongs')
      .select('likes')
      .eq('id', krathongId)
      .single();

    const currentLikes = data?.likes || 0;
    const { error: updateError } = await supabase
      .from('krathongs')
      .update({ likes: currentLikes + 1 })
      .eq('id', krathongId);

    return !updateError;
  } catch (err) {
    console.warn('Remote like failed:', err);
    return false;
  }
};

// Subscribe to live Krathong additions and like updates via Supabase Realtime
export const subscribeToRealtimeKrathongs = (
  onNewKrathong: (item: RiverKrathongItem) => void,
  onUpdateKrathong: (item: Partial<RiverKrathongItem> & { id: string }) => void
) => {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('realtime:krathongs')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'krathongs' },
      (payload) => {
        if (payload.new) {
          const item = rowToRiverItem(payload.new as SupabaseKrathongRow);
          onNewKrathong(item);
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'krathongs' },
      (payload) => {
        if (payload.new) {
          const updated = payload.new as SupabaseKrathongRow;
          onUpdateKrathong({
            id: updated.id,
            likes: updated.likes,
            wish: updated.wish,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ==========================================
// 2. PROFILES DATABASE
// ==========================================

export interface SupabaseProfileRow {
  id: string;
  username: string;
  nickname: string;
  avatar_url: string | null;
  gender: string | null;
  target_gender: string | null;
  birth_day: string | null;
  zodiac: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  allow_contact: boolean;
  bio: string | null;
  created_at?: string;
  updated_at?: string;
}

// Convert Supabase row to frontend UserProfile
export const rowToUserProfile = (row: SupabaseProfileRow): UserProfile => {
  return {
    id: row.id,
    username: row.username,
    nickname: row.nickname,
    avatarUrl: row.avatar_url || '',
    gender: (row.gender as any) || 'female',
    targetGender: (row.target_gender as any) || undefined,
    birthDay: (row.birth_day as any) || undefined,
    zodiac: (row.zodiac as any) || undefined,
    contacts: {
      facebook: row.facebook || '',
      instagram: row.instagram || '',
      tiktok: row.tiktok || '',
    },
    allowContact: row.allow_contact ?? true,
    bio: row.bio || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
};

// Save or Update User Profile
export const upsertRemoteProfile = async (profile: UserProfile): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const row: SupabaseProfileRow = {
      id: profile.id,
      username: profile.username.trim().toLowerCase(),
      nickname: profile.nickname.trim(),
      avatar_url: profile.avatarUrl || null,
      gender: profile.gender || null,
      target_gender: profile.targetGender || null,
      birth_day: profile.birthDay || null,
      zodiac: profile.zodiac || null,
      facebook: profile.contacts?.facebook?.trim() || null,
      instagram: profile.contacts?.instagram?.trim() || null,
      tiktok: profile.contacts?.tiktok?.trim() || null,
      allow_contact: profile.allowContact ?? true,
      bio: profile.bio?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert([row], { onConflict: 'username' });
    if (error) {
      console.warn('Upsert remote profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to upsert remote profile:', err);
    return false;
  }
};

// Fetch User Profile by username
export const fetchRemoteProfile = async (username: string): Promise<UserProfile | null> => {
  if (!supabase) return null;

  try {
    const cleanUsername = username.trim().toLowerCase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .single();

    if (error || !data) return null;
    return rowToUserProfile(data as SupabaseProfileRow);
  } catch {
    return null;
  }
};
