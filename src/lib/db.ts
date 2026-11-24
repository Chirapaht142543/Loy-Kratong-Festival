import { Pool, QueryResult } from 'pg';
import { RiverKrathongItem } from '@/components/MainRiverView';
import { UserProfile } from '@/types/auth';

const databaseUrl = process.env.DATABASE_URL || '';

export const isPostgresConfigured = (): boolean => {
  return Boolean(
    databaseUrl &&
    databaseUrl.trim().length > 0 &&
    (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))
  );
};

// Global singleton for Next.js hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

const getPool = (): Pool | null => {
  if (!isPostgresConfigured()) return null;

  if (!globalThis.__pgPool) {
    const isSsl = databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase.co');
    globalThis.__pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalThis.__pgPool;
};

// Auto-initialize tables if not exists
let isInitialized = false;
export const ensureTablesExist = async (): Promise<boolean> => {
  if (isInitialized) return true;
  const pool = getPool();
  if (!pool) return false;

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id text PRIMARY KEY,
        username text UNIQUE NOT NULL,
        nickname text NOT NULL,
        avatar_url text,
        gender text DEFAULT 'female',
        target_gender text,
        birth_day text,
        zodiac text,
        facebook text,
        instagram text,
        tiktok text,
        allow_contact boolean DEFAULT true,
        bio text,
        created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS krathongs (
        id text PRIMARY KEY,
        mode text NOT NULL CHECK (mode in ('single', 'couple', 'family')),
        name text NOT NULL,
        partner_name text,
        design jsonb NOT NULL DEFAULT '{}'::jsonb,
        wish text DEFAULT '',
        zodiac text,
        avatar_url text,
        likes integer DEFAULT 1,
        lane integer DEFAULT 2,
        speed integer DEFAULT 25,
        delay numeric DEFAULT 0,
        user_id text,
        created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_krathongs_created_at ON krathongs (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);
    `);

    // Safely upgrade existing check constraint if table previously existed with only single/couple
    try {
      await pool.query(`
        ALTER TABLE krathongs DROP CONSTRAINT IF EXISTS krathongs_mode_check;
        ALTER TABLE krathongs ADD CONSTRAINT krathongs_mode_check CHECK (mode in ('single', 'couple', 'family'));
      `);
    } catch {}

    isInitialized = true;
    return true;
  } catch (err) {
    console.warn('PostgreSQL table initialization notice:', err);
    return false;
  }
};

// Generic query runner
export const query = async (text: string, params?: any[]): Promise<QueryResult | null> => {
  const pool = getPool();
  if (!pool) return null;
  await ensureTablesExist();
  return pool.query(text, params);
};

// Helper: Get all krathongs from PostgreSQL
export const getDbKrathongs = async (limit = 150): Promise<RiverKrathongItem[] | null> => {
  const pool = getPool();
  if (!pool) return null;

  try {
    await ensureTablesExist();
    const res = await pool.query(
      `SELECT id, mode, name, partner_name, design, wish, zodiac, avatar_url, likes, lane, speed, delay, created_at 
       FROM krathongs 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );

    return res.rows.map((row) => ({
      id: row.id,
      mode: row.mode,
      name: row.name,
      partnerName: row.partner_name || undefined,
      design: typeof row.design === 'string' ? JSON.parse(row.design) : (row.design || { base: 'lotus', flower: 'marigold', candle: 'classic' }),
      wish: row.wish || '',
      zodiac: row.zodiac || undefined,
      avatarUrl: row.avatar_url || undefined,
      likes: typeof row.likes === 'number' ? row.likes : 1,
      lane: typeof row.lane === 'number' ? row.lane : 2,
      speed: typeof row.speed === 'number' ? row.speed : 25,
      delay: typeof row.delay === 'number' ? Number(row.delay) : 0,
    }));
  } catch (err) {
    console.error('Error fetching krathongs from PostgreSQL:', err);
    return null;
  }
};

// Helper: Insert a krathong
export const insertDbKrathong = async (
  item: RiverKrathongItem,
  userId?: string
): Promise<boolean> => {
  const pool = getPool();
  if (!pool) return false;

  try {
    await ensureTablesExist();
    await pool.query(
      `INSERT INTO krathongs (id, mode, name, partner_name, design, wish, zodiac, avatar_url, likes, lane, speed, delay, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         likes = EXCLUDED.likes,
         wish = EXCLUDED.wish`,
      [
        item.id,
        item.mode,
        item.name,
        item.partnerName || null,
        JSON.stringify(item.design),
        item.wish || '',
        item.zodiac || null,
        item.avatarUrl || null,
        item.likes || 1,
        item.lane,
        item.speed,
        item.delay,
        userId || null,
      ]
    );
    return true;
  } catch (err) {
    console.error('Error inserting krathong into PostgreSQL:', err);
    return false;
  }
};

// Helper: Increment likes
export const incrementDbLikes = async (krathongId: string): Promise<number | null> => {
  const pool = getPool();
  if (!pool) return null;

  try {
    await ensureTablesExist();
    const res = await pool.query(
      `UPDATE krathongs SET likes = coalesce(likes, 0) + 1 WHERE id = $1 RETURNING likes`,
      [krathongId]
    );
    return res.rows[0]?.likes ?? null;
  } catch (err) {
    console.error('Error incrementing likes in PostgreSQL:', err);
    return null;
  }
};

// Helper: Upsert Profile
export const upsertDbProfile = async (profile: UserProfile): Promise<boolean> => {
  const pool = getPool();
  if (!pool) return false;

  try {
    await ensureTablesExist();
    await pool.query(
      `INSERT INTO profiles (
         id, username, nickname, avatar_url, gender, target_gender, 
         birth_day, zodiac, facebook, instagram, tiktok, allow_contact, bio, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now())
       ON CONFLICT (username) DO UPDATE SET
         nickname = EXCLUDED.nickname,
         avatar_url = EXCLUDED.avatar_url,
         gender = EXCLUDED.gender,
         target_gender = EXCLUDED.target_gender,
         birth_day = EXCLUDED.birth_day,
         zodiac = EXCLUDED.zodiac,
         facebook = EXCLUDED.facebook,
         instagram = EXCLUDED.instagram,
         tiktok = EXCLUDED.tiktok,
         allow_contact = EXCLUDED.allow_contact,
         bio = EXCLUDED.bio,
         updated_at = now()`,
      [
        profile.id,
        profile.username.trim().toLowerCase(),
        profile.nickname.trim(),
        profile.avatarUrl || null,
        profile.gender || 'female',
        profile.targetGender || null,
        profile.birthDay || null,
        profile.zodiac || null,
        profile.contacts?.facebook?.trim() || null,
        profile.contacts?.instagram?.trim() || null,
        profile.contacts?.tiktok?.trim() || null,
        profile.allowContact ?? true,
        profile.bio?.trim() || null,
      ]
    );
    return true;
  } catch (err) {
    console.error('Error upserting profile in PostgreSQL:', err);
    return false;
  }
};

// Helper: Get Profile by Username
export const getDbProfileByUsername = async (username: string): Promise<UserProfile | null> => {
  const pool = getPool();
  if (!pool) return null;

  try {
    await ensureTablesExist();
    const res = await pool.query(
      `SELECT * FROM profiles WHERE username = $1 LIMIT 1`,
      [username.trim().toLowerCase()]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      username: row.username,
      nickname: row.nickname,
      avatarUrl: row.avatar_url || '',
      gender: row.gender || 'female',
      targetGender: row.target_gender || undefined,
      birthDay: row.birth_day || undefined,
      zodiac: row.zodiac || undefined,
      contacts: {
        facebook: row.facebook || '',
        instagram: row.instagram || '',
        tiktok: row.tiktok || '',
      },
      allowContact: row.allow_contact ?? true,
      bio: row.bio || '',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error fetching profile from PostgreSQL:', err);
    return null;
  }
};
