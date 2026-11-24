import {
  SingleProfile,
  MatchResult,
  ZodiacSign,
  ElementType,
  DayOfWeek,
  Gender,
  TargetGender,
} from '@/types/krathong';

export const ZODIAC_INFO: Record<ZodiacSign, { thai: string; date: string; element: ElementType; symbol: string }> = {
  aries: { thai: 'ราศีเมษ', date: '13 เม.ย. - 13 พ.ค.', element: 'fire', symbol: '♈' },
  taurus: { thai: 'ราศีพฤษภ', date: '14 พ.ค. - 13 มิ.ย.', element: 'earth', symbol: '♉' },
  gemini: { thai: 'ราศีเมถุน', date: '14 มิ.ย. - 14 ก.ค.', element: 'wind', symbol: '♊' },
  cancer: { thai: 'ราศีกรกฎ', date: '15 ก.ค. - 16 ส.ค.', element: 'water', symbol: '♋' },
  leo: { thai: 'ราศีสิงห์', date: '17 ส.ค. - 16 ก.ย.', element: 'fire', symbol: '♌' },
  virgo: { thai: 'ราศีกันย์', date: '17 ก.ย. - 16 ต.ค.', element: 'earth', symbol: '♍' },
  libra: { thai: 'ราศีตุลย์', date: '17 ต.ค. - 15 พ.ย.', element: 'wind', symbol: '♎' },
  scorpio: { thai: 'ราศีพิจิก', date: '16 พ.ย. - 15 ธ.ค.', element: 'water', symbol: '♏' },
  sagittarius: { thai: 'ราศีธนู', date: '16 ธ.ค. - 13 ม.ค.', element: 'fire', symbol: '♐' },
  capricorn: { thai: 'ราศีมังกร', date: '14 ม.ค. - 12 ก.พ.', element: 'earth', symbol: '♑' },
  aquarius: { thai: 'ราศีกุมภ์', date: '13 ก.พ. - 13 มี.ค.', element: 'wind', symbol: '♒' },
  pisces: { thai: 'ราศีมีน', date: '14 มี.ค. - 12 เม.ย.', element: 'water', symbol: '♓' },
};

export const DAY_THAI: Record<DayOfWeek, string> = {
  sunday: 'วันอาทิตย์',
  monday: 'วันจันทร์',
  tuesday: 'วันอังคาร',
  wednesday: 'วันพุธ',
  thursday: 'วันพฤหัสบดี',
  friday: 'วันศุกร์',
  saturday: 'วันเสาร์',
};

export const ELEMENT_THAI: Record<ElementType, { name: string; color: string; desc: string }> = {
  earth: { name: 'ธาตุดิน', color: 'text-amber-400', desc: 'หนักแน่น มั่นคง จริงใจ' },
  water: { name: 'ธาตุน้ำ', color: 'text-cyan-400', desc: 'อ่อนโยน ปรับตัวเก่ง มีเสน่ห์ลึกซึ้ง' },
  wind: { name: 'ธาตุลม', color: 'text-emerald-400', desc: 'รักอิสระ อารมณ์ดี ฉลาดเจรจา' },
  fire: { name: 'ธาตุไฟ', color: 'text-rose-400', desc: 'กระตือรือร้น จริงจัง มีพลังดึงดูดใจ' },
};

// Friendly days pairing in Thai astrology
const FRIENDLY_DAYS: Record<DayOfWeek, DayOfWeek[]> = {
  sunday: ['thursday', 'monday'],
  monday: ['wednesday', 'sunday'],
  tuesday: ['friday', 'saturday'],
  wednesday: ['monday', 'friday'],
  thursday: ['sunday', 'sunday'],
  friday: ['tuesday', 'thursday'],
  saturday: ['tuesday', 'monday'],
};

// Calculate compatibility between two elements
export function getElementCompatibility(el1: ElementType, el2: ElementType): { score: number; title: string; fortune: string } {
  const pair = [el1, el2].sort().join('-');

  if (el1 === el2) {
    return {
      score: 93,
      title: `${ELEMENT_THAI[el1].name} คู่กับ ${ELEMENT_THAI[el2].name} (ธาตุเดียวกันรู้ใจ)`,
      fortune: 'ดวงชะตาบอกว่าใจตรงกัน มองตาก็รู้ใจ มีความชอบและเป้าหมายชีวิตคล้ายกัน อยู่ด้วยแล้วสบายใจที่สุด',
    };
  }

  if (pair === 'earth-water') {
    return {
      score: 98,
      title: 'ธาตุดิน โอบอุ้ม ธาตุน้ำ (คู่เกื้อหนุนมหาศาล)',
      fortune: 'ดั่งผืนดินที่โอบอุ้มสายน้ำ และสายน้ำที่สร้างความชุ่มชื้นให้ผืนดิน เป็นคู่ที่ส่งเสริมความมั่นคงและนำพาความเจริญก้าวหน้ามาสู่กัน',
    };
  }

  if (pair === 'fire-wind') {
    return {
      score: 96,
      title: 'ธาตุลม พัดส่ง ธาตุไฟ (คู่รักพลังบวก)',
      fortune: 'สายลมช่วยพัดให้เปลวไฟสว่างไสว เปลวไฟให้ความอบอุ่นแก่สายลม อยู่ด้วยกันแล้วชีวิตมีแต่ความสดใส มีพลังขับเคลื่อนซึ่งกันและกันตลอดเวลา',
    };
  }

  if (pair === 'fire-water') {
    return {
      score: 87,
      title: 'ธาตุไฟ เติมเต็ม ธาตุน้ำ (คู่หยินหยางปรับสมดุล)',
      fortune: 'สองขั้วตรงข้ามที่ดึงดูดกันอย่างน่าประหลาดใจ ความใจเย็นของน้ำจะช่วยดับความร้อนรนของไฟ และความกระตือรือร้นของไฟจะปลุกไฟในตัวของน้ำให้ตื่นขึ้น',
    };
  }

  if (pair === 'earth-wind') {
    return {
      score: 89,
      title: 'ธาตุดิน มั่นคงเคียงข้าง ธาตุลม (คู่ซัพพอร์ต)',
      fortune: 'ความหนักแน่นของดินทำให้ลมรู้สึกปลอดภัยเหมือนมีบ้านให้พักพิง ส่วนความมีชีวิตชีวาของลมทำให้ดินไม่เงียบเหงา เป็นคู่ที่เติมเต็มส่วนที่ขาดได้ลงตัว',
    };
  }

  // earth-fire
  return {
    score: 91,
    title: 'ธาตุดิน หลอมรวม ธาตุไฟ (คู่สร้างตัว)',
    fortune: 'ไฟช่วยให้ดินแกร่งขึ้น ดินช่วยรองรับพลังของไฟ อยู่ด้วยกันจะช่วยกันคิดช่วยกันสร้างอนาคต มีเกณฑ์สร้างฐานะและสร้างครอบครัวที่อบอุ่น',
  };
}

// Check gender preference match
export function isGenderCompatible(
  userGender: Gender,
  userTarget: TargetGender,
  candidateGender: Gender,
  candidateTarget: TargetGender
): boolean {
  const userMatchesCandidate = userTarget === 'any' || userTarget === candidateGender;
  const candidateMatchesUser = candidateTarget === 'any' || candidateTarget === (userGender as string);
  return userMatchesCandidate && candidateMatchesUser;
}

// Find best astrological match from candidates
export function findBestAstrologyMatch(
  user: SingleProfile,
  candidates: SingleProfile[]
): MatchResult | null {
  if (!candidates || candidates.length === 0) {
    return null;
  }

  // 1. Filter out candidate matching user's ID
  let eligible = candidates.filter((c) => c.id !== user.id);

  if (eligible.length === 0) {
    return null;
  }

  // 2. Filter by gender preference
  const genderMatched = eligible.filter((c) =>
    isGenderCompatible(user.gender, user.targetGender, c.gender, c.targetGender)
  );

  if (genderMatched.length > 0) {
    eligible = genderMatched;
  }

  // 3. Score each candidate
  let bestScore = -1;
  let bestCandidate = eligible[0];
  let bestElementHarmonious = getElementCompatibility(user.element, eligible[0].element);

  for (const candidate of eligible) {
    let currentScore = 0;

    // A. Element Score (weight 40)
    const elementComp = getElementCompatibility(user.element, candidate.element);
    currentScore += elementComp.score * 0.45;

    // B. Day compatibility (weight 30)
    const isFriendlyDay = FRIENDLY_DAYS[user.birthDay]?.includes(candidate.birthDay);
    if (isFriendlyDay) {
      currentScore += 30;
    } else if (user.birthDay === candidate.birthDay) {
      currentScore += 26;
    } else {
      currentScore += 22;
    }

    // C. Zodiac similarity/balance (weight 25)
    if (user.zodiac === candidate.zodiac) {
      currentScore += 25;
    } else {
      currentScore += 20 + Math.floor(Math.random() * 5);
    }

    // Normalized to 84 - 99
    const finalScore = Math.min(99, Math.max(84, Math.round(currentScore)));

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestCandidate = candidate;
      bestElementHarmonious = elementComp;
    }
  }

  const tags = [
    `#${ELEMENT_THAI[user.element].name}รัก${ELEMENT_THAI[bestCandidate.element].name}`,
    `#${ZODIAC_INFO[user.zodiac].thai}x${ZODIAC_INFO[bestCandidate.zodiac].thai}`,
    bestScore >= 95 ? '#ดวงสมพงษ์ระดับลิขิตฟ้า' : '#คู่แท้เกื้อหนุน',
    bestCandidate.allowContact ? '#วาร์ปพร้อมเปิด' : '#คนน่าค้นหา',
  ];

  return {
    score: bestScore,
    matchedPartner: bestCandidate,
    elementHarmoniousTitle: bestElementHarmonious.title,
    astrologyFortuneText: bestElementHarmonious.fortune,
    tags,
  };
}
