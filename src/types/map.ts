export interface PierLocation {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  tag: string;
  x: number; // Map X coord
  y: number; // Map Y coord
  icon: string;
  color: string;
  highlight: string;
  krathongCount: number;
}

export const FESTIVAL_PIERS: PierLocation[] = [
  {
    id: 'pier-rama8',
    name: 'ท่าน้ำสะพานพระราม ๘',
    shortName: 'สะพานพระราม ๘',
    desc: 'วิวสะพานขึงประดับไฟสีทองตระการตา ยอดฮิตสำหรับคนโสดมาตามหาคู่และลอยกระทงเคล้าสายลมเย็น',
    tag: '💖 ยอดฮิตคนโสด',
    x: 880,
    y: 220,
    icon: '🌉',
    color: 'from-pink-500 to-rose-500',
    highlight: 'สะพานประดับไฟสุดโรแมนติก',
    krathongCount: 542,
  },
  {
    id: 'pier-watarun',
    name: 'ท่าน้ำวัดอรุณราชวราราม',
    shortName: 'วัดอรุณฯ',
    desc: 'เสริมบารมี ขอพรความรักราบรื่นและมั่นคง หน้าพระปรางค์สีทองอร่ามสะท้อนผืนน้ำ',
    tag: '✨ สายมูเสริมสิริมงคล',
    x: 1240,
    y: 970,
    icon: '🛕',
    color: 'from-amber-400 to-yellow-500',
    highlight: 'พระปรางค์วัดอรุณเรืองรอง',
    krathongCount: 890,
  },
  {
    id: 'pier-icon',
    name: 'ท่าน้ำริเวอร์วอเตอร์ฟร้อนท์',
    shortName: 'ไอคอนวอเตอร์ฟร้อนท์',
    desc: 'ศูนย์กลางแสงสีเสียงยามค่ำคืน คึกคักไปด้วยผู้คน เสียงดนตรี และกระทงลอยละลานตา',
    tag: '🌟 คึกคัก แสงสีเสียง',
    x: 2020,
    y: 1350,
    icon: '🏙️',
    color: 'from-cyan-400 to-blue-500',
    highlight: 'ลานน้ำพุและแสงสีริมน้ำ',
    krathongCount: 715,
  },
  {
    id: 'pier-asiatique',
    name: 'คุ้งน้ำชิงช้าสวรรค์ราตรี',
    shortName: 'คุ้งน้ำชิงช้าสวรรค์',
    desc: 'ชมชิงช้าสวรรค์ยักษ์ใต้แสงจันทร์เต็มดวง บรรยากาศสุดโรแมนติกสำหรับคนมีคู่และครอบครัว',
    tag: '👩‍❤️‍👨 ขวัญใจคู่รัก',
    x: 2680,
    y: 1330,
    icon: '🎡',
    color: 'from-purple-500 to-pink-500',
    highlight: 'ชิงช้าสวรรค์ใต้เงาจันทร์',
    krathongCount: 630,
  },
  {
    id: 'pier-canal',
    name: 'ท่าน้ำตลาดคลองโบราณ',
    shortName: 'คลองโบราณ',
    desc: 'สายน้ำเก่าแก่ ประดับประดาด้วยโคมไฟล้านนาลอยน้ำและวิถีไทยดั้งเดิมอันเงียบสงบ',
    tag: '🏮 โคมไฟโบราณ & สงบใจ',
    x: 3120,
    y: 1980,
    icon: '🏮',
    color: 'from-emerald-400 to-teal-500',
    highlight: 'คลองโคมไฟวิถีไทย',
    krathongCount: 412,
  },
];
