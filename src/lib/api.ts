import { RiverKrathongItem } from '@/components/MainRiverView';
import { UserProfile } from '@/types/auth';
import { CoupleRoom, KrathongDesign } from '@/types/krathong';

export const fetchApiKrathongs = async (): Promise<{ configured: boolean; data: RiverKrathongItem[] }> => {
  try {
    const res = await fetch('/api/krathongs', { cache: 'no-store' });
    if (!res.ok) return { configured: false, data: [] };
    const json = await res.json();
    return { configured: json.configured ?? false, data: json.data || [] };
  } catch {
    return { configured: false, data: [] };
  }
};

export const insertApiKrathong = async (item: RiverKrathongItem, userId?: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/krathongs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, userId }),
    });
    const json = await res.json();
    return json.success ?? false;
  } catch {
    return false;
  }
};

export const likeApiKrathong = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/krathongs/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const json = await res.json();
    return json.success ?? false;
  } catch {
    return false;
  }
};

export const upsertApiProfile = async (profile: UserProfile): Promise<boolean> => {
  try {
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    const json = await res.json();
    return json.success ?? false;
  } catch {
    return false;
  }
};

export const fetchApiProfile = async (username: string): Promise<UserProfile | null> => {
  try {
    const res = await fetch(`/api/profiles?username=${encodeURIComponent(username)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.profile || null;
  } catch {
    return null;
  }
};

// ==========================================
// COUPLE ROOM CLIENT APIS
// ==========================================

export const createApiCoupleRoom = async (params: {
  hostName: string;
  hostAvatar?: string;
  hostWish?: string;
  design?: KrathongDesign;
}): Promise<CoupleRoom | null> => {
  try {
    const res = await fetch('/api/couple-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...params }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.room || null;
  } catch {
    return null;
  }
};

export const fetchApiCoupleRoom = async (code: string): Promise<CoupleRoom | null> => {
  try {
    const res = await fetch(`/api/couple-rooms?code=${encodeURIComponent(code.trim().toUpperCase())}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.room || null;
  } catch {
    return null;
  }
};

export const joinApiCoupleRoom = async (params: {
  code: string;
  partnerName: string;
  partnerAvatar?: string;
  partnerWish?: string;
}): Promise<CoupleRoom | null> => {
  try {
    const res = await fetch('/api/couple-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', ...params }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.room || null;
  } catch {
    return null;
  }
};

export const updateApiCoupleRoomDesign = async (
  code: string,
  design: KrathongDesign
): Promise<boolean> => {
  try {
    const res = await fetch('/api/couple-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_design', code, design }),
    });
    const json = await res.json();
    return json.success ?? false;
  } catch {
    return false;
  }
};

export const markApiCoupleRoomFloated = async (
  code: string,
  krathongId: string
): Promise<boolean> => {
  try {
    const res = await fetch('/api/couple-rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'float', code, krathongId }),
    });
    const json = await res.json();
    return json.success ?? false;
  } catch {
    return false;
  }
};
