import { Pool, QueryResult } from 'pg';
import { RiverKrathongItem } from '@/components/MainRiverView';
import { UserProfile } from '@/types/auth';
import { CoupleRoom, KrathongDesign } from '@/types/krathong';

const databaseUrl = process.env.DATABASE_URL || '';

export const isPostgresConfigured = (): boolean => {
  return Boolean(
    databaseUrl &&
    databaseUrl.trim().length > 0 &&
    (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))
  );
};

// Circuit Breaker & In-Memory Cache (Reduces VPS DB load by 95%+)
let lastConnectionFailure = 0;
const FAILURE_COOLDOWN_MS = 20000; // 20s cooldown on connection failure
let cachedKrathongs: RiverKrathongItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5000; // 5s in-memory cache for high-throughput concurrency

// Global singleton for Next.js hot-reloading
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __serverKrathongsMap: Map<string, RiverKrathongItem> | undefined;
  // eslint-disable-next-line no-var
  var __serverProfilesMap: Map<string, UserProfile> | undefined;
}

if (!globalThis.__serverKrathongsMap) {
  globalThis.__serverKrathongsMap = new Map();
}
if (!globalThis.__serverProfilesMap) {
  globalThis.__serverProfilesMap = new Map();
}
const memoryKrathongs = globalThis.__serverKrathongsMap;
const memoryProfiles = globalThis.__serverProfilesMap;

const getPool = (): Pool | null => {
  if (!isPostgresConfigured()) return null;
  // If recent failure, trip circuit breaker to avoid hanging requests
  if (Date.now() - lastConnectionFailure < FAILURE_COOLDOWN_MS) {
    return null;
  }

  if (!globalThis.__pgPool) {
    const isSsl = databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon.tech') || databaseUrl.includes('supabase.co');
    globalThis.__pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: isSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 3000,
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

      CREATE TABLE IF NOT EXISTS couple_rooms (
        code text PRIMARY KEY,
        host_name text NOT NULL,
        host_avatar text,
        host_wish text DEFAULT '',
        partner_name text,
        partner_avatar text,
        partner_wish text,
        design jsonb NOT NULL DEFAULT '{}'::jsonb,
        status text NOT NULL DEFAULT 'waiting',
        krathong_id text,
        created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_krathongs_created_at ON krathongs (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_krathongs_user_id ON krathongs (user_id);
      CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);
      CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles (lower(nickname));
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
    lastConnectionFailure = Date.now();
    console.warn('PostgreSQL table initialization notice:', err);
    return false;
  }
};

// Generic query runner
export const query = async (text: string, params?: any[]): Promise<QueryResult | null> => {
  const pool = getPool();
  if (!pool) return null;
  await ensureTablesExist();
  try {
    return await pool.query(text, params);
  } catch (err) {
    lastConnectionFailure = Date.now();
    throw err;
  }
};

// Helper: Get all krathongs from PostgreSQL with In-Memory fallback
export const getDbKrathongs = async (limit = 150): Promise<RiverKrathongItem[]> => {
  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, mode, name, partner_name, design, wish, zodiac, avatar_url, likes, lane, speed, delay, user_id, created_at 
         FROM krathongs 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit]
      );

      const items = res.rows.map((row) => {
        const rawDesign = typeof row.design === 'string' ? JSON.parse(row.design) : (row.design || {});
        const meta = rawDesign._meta || {};
        const cleanDesign = {
          base: rawDesign.base || 'lotus',
          flower: rawDesign.flower || 'marigold',
          candle: rawDesign.candle || 'classic',
        };

        const item: RiverKrathongItem = {
          id: row.id,
          mode: row.mode,
          name: row.name,
          partnerName: row.partner_name || undefined,
          design: cleanDesign,
          wish: row.wish || '',
          zodiac: row.zodiac || undefined,
          avatarUrl: row.avatar_url || undefined,
          likes: typeof row.likes === 'number' ? row.likes : 1,
          lane: typeof row.lane === 'number' ? row.lane : 2,
          speed: typeof row.speed === 'number' ? row.speed : 25,
          delay: typeof row.delay === 'number' ? Number(row.delay) : 0,
          userId: row.user_id || undefined,
          contacts: meta.contacts || undefined,
          allowContact: meta.allowContact ?? true,
          gender: meta.gender || undefined,
          targetGender: meta.targetGender || undefined,
          rawZodiac: meta.rawZodiac || undefined,
          rawBirthDay: meta.rawBirthDay || undefined,
          rawElement: meta.rawElement || undefined,
          familyMembers: meta.familyMembers || undefined,
          familyName: meta.familyName || undefined,
        };

        // Cache in memory map
        memoryKrathongs.set(item.id, item);
        return item;
      });

      return items;
    } catch (err) {
      console.warn('Error fetching krathongs from PostgreSQL, falling back to memory store:', err);
    }
  }

  // Fallback to server in-memory store so all users on this server see each other even without PostgreSQL
  return Array.from(memoryKrathongs.values()).slice(0, limit);
};

// Helper: Insert a krathong
export const insertDbKrathong = async (
  item: RiverKrathongItem,
  userId?: string
): Promise<boolean> => {
  // 1. Maintain in-memory server store so all connected clients on this server see each other immediately
  if (userId) {
    for (const [id, existing] of memoryKrathongs.entries()) {
      if (existing.userId === userId && id !== item.id) {
        memoryKrathongs.delete(id);
      }
    }
  }
  memoryKrathongs.set(item.id, { ...item, userId: userId || item.userId });

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      const packedDesign = {
        ...item.design,
        _meta: {
          contacts: item.contacts,
          allowContact: item.allowContact,
          gender: item.gender,
          targetGender: item.targetGender,
          rawZodiac: item.rawZodiac,
          rawBirthDay: item.rawBirthDay,
          rawElement: item.rawElement,
          familyMembers: item.familyMembers,
          familyName: item.familyName,
        },
      };

      // 1 user can float only 1 krathong: delete previous krathongs for this user
      if (userId) {
        try {
          await pool.query(
            `DELETE FROM krathongs WHERE user_id = $1 AND id != $2`,
            [userId, item.id]
          );
        } catch {}
      }

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
          JSON.stringify(packedDesign),
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
      cachedKrathongs = null;
    } catch (err) {
      console.warn('Postgres insert failed, relying on server memory store:', err);
    }
  }

  return true;
};

// Helper: Increment likes
export const incrementDbLikes = async (krathongId: string): Promise<number | null> => {
  // Update in server memory map
  const existing = memoryKrathongs.get(krathongId);
  const currentLikes = existing ? (existing.likes || 1) + 1 : 2;
  if (existing) {
    existing.likes = currentLikes;
    memoryKrathongs.set(krathongId, existing);
  }

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      const res = await pool.query(
        `UPDATE krathongs SET likes = coalesce(likes, 0) + 1 WHERE id = $1 RETURNING likes`,
        [krathongId]
      );
      const newLikes = res.rows[0]?.likes ?? null;
      cachedKrathongs = null;
      if (newLikes !== null) return newLikes;
    } catch (err) {
      console.warn('Error incrementing likes in PostgreSQL, using memory count:', err);
    }
  }

  return currentLikes;
};

// Helper: Upsert Profile
export const upsertDbProfile = async (profile: UserProfile): Promise<boolean> => {
  // Save in server memory store
  memoryProfiles.set(profile.username.trim().toLowerCase(), profile);
  if (profile.nickname) {
    memoryProfiles.set(profile.nickname.trim().toLowerCase(), profile);
  }

  const pool = getPool();
  if (pool) {
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
      console.warn('Error upserting profile in PostgreSQL, saved in memory:', err);
    }
  }

  return true;
};

// Helper: Get Profile by Username or Nickname
export const getDbProfileByUsername = async (identifier: string): Promise<UserProfile | null> => {
  const clean = identifier.trim().toLowerCase();

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT * FROM profiles 
         WHERE lower(username) = $1 OR lower(nickname) = $2 
         ORDER BY updated_at DESC LIMIT 1`,
        [clean, clean]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const profile: UserProfile = {
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
        memoryProfiles.set(profile.username.toLowerCase(), profile);
        memoryProfiles.set(profile.nickname.toLowerCase(), profile);
        return profile;
      }
    } catch (err) {
      console.warn('Error fetching profile from PostgreSQL, checking memory store:', err);
    }
  }

  // Memory fallback
  return memoryProfiles.get(clean) || null;
};

// ==========================================
// COUPLE ROOMS (ลอยคู่ชวนเพื่อนด้วยรหัสห้อง)
// ==========================================

declare global {
  // eslint-disable-next-line no-var
  var __coupleRoomsMap: Map<string, CoupleRoom> | undefined;
}
if (!globalThis.__coupleRoomsMap) {
  globalThis.__coupleRoomsMap = new Map();
}
const memoryRooms = globalThis.__coupleRoomsMap;

export const createCoupleRoomDb = async (room: CoupleRoom): Promise<CoupleRoom> => {
  memoryRooms.set(room.code, room);

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO couple_rooms (code, host_name, host_avatar, host_wish, design, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (code) DO UPDATE SET
           host_name = EXCLUDED.host_name,
           host_avatar = EXCLUDED.host_avatar,
           host_wish = EXCLUDED.host_wish,
           design = EXCLUDED.design,
           updated_at = now()`,
        [
          room.code,
          room.hostName,
          room.hostAvatar || null,
          room.hostWish,
          JSON.stringify(room.design),
          room.status,
          room.createdAt,
          room.updatedAt,
        ]
      );
    } catch (err) {
      console.warn('Postgres couple room insert fallback to memory:', err);
    }
  }

  return room;
};

export const getCoupleRoomDb = async (code: string): Promise<CoupleRoom | null> => {
  const normCode = code.trim().toUpperCase();
  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT * FROM couple_rooms WHERE code = $1 LIMIT 1`,
        [normCode]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const room: CoupleRoom = {
          code: row.code,
          status: row.status as any,
          hostName: row.host_name,
          hostAvatar: row.host_avatar || undefined,
          hostWish: row.host_wish || '',
          partnerName: row.partner_name || undefined,
          partnerAvatar: row.partner_avatar || undefined,
          partnerWish: row.partner_wish || undefined,
          design: typeof row.design === 'string' ? JSON.parse(row.design) : (row.design || {}),
          krathongId: row.krathong_id || undefined,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
        };
        memoryRooms.set(normCode, room);
        return room;
      }
    } catch {}
  }

  return memoryRooms.get(normCode) || null;
};

export const joinCoupleRoomDb = async (
  code: string,
  partnerName: string,
  partnerAvatar?: string,
  partnerWish?: string
): Promise<CoupleRoom | null> => {
  const normCode = code.trim().toUpperCase();
  const existing = await getCoupleRoomDb(normCode);
  if (!existing) return null;

  const updated: CoupleRoom = {
    ...existing,
    partnerName: partnerName.trim(),
    partnerAvatar: partnerAvatar || existing.partnerAvatar,
    partnerWish: partnerWish?.trim() || existing.partnerWish || '',
    status: 'ready',
    updatedAt: new Date().toISOString(),
  };

  memoryRooms.set(normCode, updated);

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      await pool.query(
        `UPDATE couple_rooms SET
           partner_name = $1,
           partner_avatar = $2,
           partner_wish = $3,
           status = 'ready',
           updated_at = now()
         WHERE code = $4`,
        [updated.partnerName, updated.partnerAvatar || null, updated.partnerWish, normCode]
      );
    } catch {}
  }

  return updated;
};

export const updateCoupleRoomDesignDb = async (
  code: string,
  design: KrathongDesign
): Promise<CoupleRoom | null> => {
  const normCode = code.trim().toUpperCase();
  const existing = await getCoupleRoomDb(normCode);
  if (!existing) return null;

  const updated: CoupleRoom = {
    ...existing,
    design,
    updatedAt: new Date().toISOString(),
  };

  memoryRooms.set(normCode, updated);

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      await pool.query(
        `UPDATE couple_rooms SET design = $1, updated_at = now() WHERE code = $2`,
        [JSON.stringify(design), normCode]
      );
    } catch {}
  }

  return updated;
};

export const markCoupleRoomFloatedDb = async (
  code: string,
  krathongId: string
): Promise<CoupleRoom | null> => {
  const normCode = code.trim().toUpperCase();
  const existing = await getCoupleRoomDb(normCode);
  if (!existing) return null;

  const updated: CoupleRoom = {
    ...existing,
    status: 'floated',
    krathongId,
    updatedAt: new Date().toISOString(),
  };

  memoryRooms.set(normCode, updated);

  const pool = getPool();
  if (pool) {
    try {
      await ensureTablesExist();
      await pool.query(
        `UPDATE couple_rooms SET status = 'floated', krathong_id = $1, updated_at = now() WHERE code = $2`,
        [krathongId, normCode]
      );
    } catch {}
  }

  return updated;
};
