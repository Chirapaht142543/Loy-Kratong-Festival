import { Gender, TargetGender, DayOfWeek, ZodiacSign, SocialContacts } from './krathong';

export interface UserProfile {
  id: string;
  username: string; // ชื่อบัญชีสำหรับล็อกอิน
  nickname: string; // ชื่อเล่นที่แสดงบนกระทง
  avatarUrl: string; // รูปโปรไฟล์ (Base64 data URL หรือ Avatar สำเร็จรูป)
  gender: Gender;
  targetGender?: TargetGender;
  birthDay?: DayOfWeek;
  zodiac?: ZodiacSign;
  contacts: SocialContacts;
  allowContact: boolean;
  bio?: string;
  createdAt: string;
}

export interface AuthState {
  currentUser: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
