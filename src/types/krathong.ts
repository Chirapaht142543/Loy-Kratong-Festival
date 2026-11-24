export type Mode = 'single' | 'couple' | 'family';

export type KrathongBase = 'banana-leaf' | 'lotus' | 'bread' | 'coconut';
export type KrathongFlower = 'marigold' | 'orchid' | 'rose' | 'mixed';
export type KrathongCandle = 'classic' | 'pink-love' | 'scented';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type ZodiacSign = 
  | 'aries' | 'taurus' | 'gemini' | 'cancer' 
  | 'leo' | 'virgo' | 'libra' | 'scorpio' 
  | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export type ElementType = 'earth' | 'water' | 'wind' | 'fire';

export type Gender = 'male' | 'female' | 'non-binary';
export type TargetGender = 'male' | 'female' | 'any';

// 3 Social Platforms
export interface SocialContacts {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
}

export interface KrathongDesign {
  base: KrathongBase;
  flower: KrathongFlower;
  candle: KrathongCandle;
}

export interface SingleProfile {
  id: string;
  mode: 'single';
  nickname: string;
  gender: Gender;
  targetGender: TargetGender;
  birthDay: DayOfWeek;
  zodiac: ZodiacSign;
  element: ElementType;
  contacts: SocialContacts;
  allowContact: boolean;
  avatarUrl?: string;
  wish: string;
  design: KrathongDesign;
  createdAt: string;
}

export interface CoupleProfile {
  id: string;
  mode: 'couple';
  partner1Name: string;
  partner2Name: string;
  partner1Avatar?: string;
  partner2Avatar?: string;
  loveMessage: string;
  anniversaryDate?: string;
  design: KrathongDesign;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string; // เช่น 'คุณพ่อ', 'คุณแม่', 'ลูกชาย', 'ลูกสาว', 'คุณปู่/คุณตา', 'คุณย่า/คุณยาย', 'พี่/น้อง', 'สมาชิก', 'น้องหมา', 'น้องแมว'
  isPet?: boolean;
  petType?: 'dog' | 'cat' | 'rabbit' | 'hamster' | 'bird' | 'turtle' | 'fish' | 'other';
  customPetType?: string;
  avatarUrl?: string;
  wish?: string;
}

export interface FamilyProfile {
  id: string;
  mode: 'family';
  familyName: string;
  members: FamilyMember[];
  familyWish: string;
  inviteCode?: string;
  avatarUrl?: string;
  design: KrathongDesign;
  createdAt: string;
}

export type AnyKrathong = SingleProfile | CoupleProfile | FamilyProfile;

export interface MatchResult {
  score: number; // 75 - 99 %
  matchedPartner: SingleProfile;
  elementHarmoniousTitle: string;
  astrologyFortuneText: string;
  tags: string[];
}

export interface MutualMatch {
  id: string;
  myKrathongId: string;
  matchedKrathongId: string;
  matchedName: string;
  matchedAvatar?: string;
  matchedWish?: string;
  matchedZodiac?: string;
  matchedElement?: string;
  contacts?: SocialContacts;
  harmonyScore: number;
  harmonyTitle: string;
  matchedAt: string;
}
