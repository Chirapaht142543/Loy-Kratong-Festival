'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { PRESET_AVATARS, compressImageFile } from '@/lib/imageUtils';
import { Gender, DayOfWeek, ZodiacSign } from '@/types/krathong';
import { RiverKrathongItem } from './MainRiverView';
import { ZODIAC_INFO, DAY_THAI } from '@/lib/astrology';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';
import {
  X,
  Camera,
  User,
  ShieldCheck,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  myKrathong?: RiverKrathongItem | null;
  onViewMyKrathong?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  myKrathong,
  onViewMyKrathong,
}) => {
  const { currentUser, isLoggedIn, login, register, updateProfile, logout } = useAuth();
  const { confirm, alert, toast } = useDialog();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    isLoggedIn ? 'register' : 'login'
  );

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register / Profile form state
  const [username, setUsername] = useState(currentUser?.username || '');
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0].url);
  const [gender, setGender] = useState<Gender>(currentUser?.gender || 'female');
  const [birthDay, setBirthDay] = useState<DayOfWeek>(currentUser?.birthDay || 'friday');
  const [zodiac, setZodiac] = useState<ZodiacSign>(currentUser?.zodiac || 'libra');

  // 3 Social Channels
  const [facebook, setFacebook] = useState(currentUser?.contacts?.facebook || '');
  const [instagram, setInstagram] = useState(currentUser?.contacts?.instagram || '');
  const [tiktok, setTiktok] = useState(currentUser?.contacts?.tiktok || '');
  const [allowContact, setAllowContact] = useState(currentUser?.allowContact ?? true);
  const [bio, setBio] = useState(currentUser?.bio || '');

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize modal state with currentUser or saved local storage drafts whenever opened or user changes
  useEffect(() => {
    if (!isOpen) return;

    if (currentUser) {
      setUsername(currentUser.username || '');
      setNickname(currentUser.nickname || '');
      setAvatarUrl(currentUser.avatarUrl || PRESET_AVATARS[0].url);
      setGender(currentUser.gender || 'female');
      setBirthDay(currentUser.birthDay || 'friday');
      setZodiac(currentUser.zodiac || 'libra');
      setFacebook(currentUser.contacts?.facebook || '');
      setInstagram(currentUser.contacts?.instagram || '');
      setTiktok(currentUser.contacts?.tiktok || '');
      setAllowContact(currentUser.allowContact ?? true);
      setBio(currentUser.bio || '');
      setMode('register');
    } else {
      // If not logged in, default to login mode
      setMode('login');
      setLoginUsername('');
      setLoginError('');

      // Prefill draft in registration tab if user switches to register
      try {
        const savedDraft = localStorage.getItem('loy_krathong_saved_single_profile');
        const parsedDraft = savedDraft ? JSON.parse(savedDraft) : null;
        if (parsedDraft) {
          const prefilledNick = parsedDraft.nickname || '';
          setNickname(prefilledNick);
          setUsername(prefilledNick ? prefilledNick.toLowerCase().replace(/[^a-z0-9_]/g, '') : '');
          setAvatarUrl(parsedDraft.avatarUrl || PRESET_AVATARS[0].url);
          setGender(parsedDraft.gender || 'female');
          setBirthDay(parsedDraft.birthDay || 'friday');
          setZodiac(parsedDraft.zodiac || 'libra');
          setFacebook(parsedDraft.contacts?.facebook || '');
          setInstagram(parsedDraft.contacts?.instagram || '');
          setTiktok(parsedDraft.contacts?.tiktok || '');
          setAllowContact(parsedDraft.allowContact ?? true);
          setBio(parsedDraft.wish || '');
        }
      } catch {}
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Photo File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressed = await compressImageFile(file);
      setAvatarUrl(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
      toast.error('ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Login Submit (Async)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = loginUsername.trim();
    if (!cleanInput) {
      setLoginError('กรุณากรอกชื่อเล่น หรือชื่อผู้ใช้');
      return;
    }

    try {
      setIsLoggingIn(true);
      const success = await login(cleanInput);
      if (success) {
        toast.success(`ยินดีต้อนรับกลับ, ${cleanInput}! ✨`);
        onClose();
      } else {
        setLoginError('ไม่พบบัญชีนี้ คุณสามารถตรวจสอบชื่อที่กรอก หรือกดแท็บ "สร้างโปรไฟล์" เพื่อเริ่มต้นได้เลย');
      }
    } catch {
      setLoginError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Register / Save Profile Submit
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      alert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อเล่นของคุณเพื่อใช้งานโปรไฟล์',
        type: 'warning',
      });
      return;
    }

    const contactsData = {
      facebook: facebook.trim(),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
    };

    // Keep localStorage draft in sync with newly saved profile
    try {
      const existingDraft = localStorage.getItem('loy_krathong_saved_single_profile');
      const parsedDraft = existingDraft ? JSON.parse(existingDraft) : {};
      localStorage.setItem(
        'loy_krathong_saved_single_profile',
        JSON.stringify({
          ...parsedDraft,
          nickname: nickname.trim(),
          avatarUrl,
          gender,
          birthDay,
          zodiac,
          contacts: contactsData,
          allowContact,
          wish: bio.trim() || parsedDraft.wish,
        })
      );
    } catch {}

    if (isLoggedIn) {
      updateProfile({
        nickname: nickname.trim(),
        avatarUrl,
        gender,
        birthDay,
        zodiac,
        contacts: contactsData,
        allowContact,
        bio: bio.trim(),
      });
      toast.success('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว ✨');
      onClose();
    } else {
      const finalUsername =
        username.trim() ||
        nickname.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        `user_${Date.now().toString().slice(-4)}`;

      register({
        username: finalUsername,
        nickname: nickname.trim(),
        avatarUrl,
        gender,
        birthDay,
        zodiac,
        contacts: contactsData,
        allowContact,
        bio: bio.trim(),
      });
      toast.success('บันทึกข้อมูลและสร้างโปรไฟล์เรียบร้อยแล้ว ✨');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-lg my-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Toggle (if not already logged in) */}
        {!isLoggedIn ? (
          <div className="flex bg-slate-800/80 p-1 rounded-2xl mb-6 max-w-xs mx-auto border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'login'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLoginError('');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'register'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> สร้างโปรไฟล์
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full mb-2">
                <User className="w-3.5 h-3.5" /> บัญชีของคุณ
              </span>
              <h2 className="text-2xl font-bold text-amber-200">{currentUser?.nickname}</h2>
              <p className="text-xs text-slate-400">@{currentUser?.username}</p>
            </div>

            {/* Krathong Status Card */}
            {myKrathong ? (
              <div className="bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border border-amber-400/40 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0">
                    🪷
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                      <span>กระทงของคุณอยู่ในสายน้ำ</span>
                      <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">1/1</span>
                    </div>
                    <p className="text-xs text-slate-300 truncate font-medium">
                      &quot;{myKrathong.name}&quot; {myKrathong.wish ? `• ${myKrathong.wish}` : ''}
                    </p>
                  </div>
                </div>

                {onViewMyKrathong && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewMyKrathong();
                    }}
                    className="shrink-0 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shadow-md transition transform hover:scale-102 flex items-center gap-1 cursor-pointer"
                  >
                    <span>✨</span>
                    <span>วาร์ปไปดู</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 text-center">
                <p className="text-xs text-slate-300">
                  คุณยังไม่มีกระทงในสายน้ำรอบนี้ (สามารถลอยได้ 1 ท่าน / 1 ใบ)
                </p>
              </div>
            )}
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {mode === 'login' && !isLoggedIn && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="text-center pb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl mx-auto mb-2">
                🔑
              </div>
              <h2 className="text-2xl font-bold text-amber-200">เข้าสู่ระบบ</h2>
              <p className="text-xs text-slate-400 mt-1">
                กรอกชื่อเล่น หรือชื่อบัญชีของคุณ เพื่อค้นหากระทงและจัดการโปรไฟล์
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                ชื่อเล่น หรือ ชื่อผู้ใช้ (Nickname / Username)
              </label>
              <input
                type="text"
                required
                disabled={isLoggingIn}
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="เช่น มายด์, ต้น, win99"
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                <span>💡</span>
                <span>สามารถใช้ชื่อเล่นเดียวกับที่ระบุบนกระทงของคุณเพื่อค้นหาได้ทันที</span>
              </p>
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังค้นหาบัญชีและกระทง...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบเพื่อค้นหากระทง</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. REGISTER / PROFILE EDIT TAB */}
        {(mode === 'register' || isLoggedIn) && (
          <form onSubmit={handleProfileSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
            {/* AVATAR UPLOAD SECTION */}
            <div className="flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-800 flex items-center justify-center">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-slate-500" />
                  )}
                </div>

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full shadow-lg border border-slate-900 transition transform hover:scale-110"
                  title="อัปโหลดรูปของคุณ"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="mt-2 text-xs text-slate-400">
                {isUploading ? (
                  <span className="text-amber-400">กำลังย่อและอัปโหลดรูป...</span>
                ) : (
                  <span>คลิกไอคอนกล้องเพื่อใส่รูปของคุณเองจากเครื่อง</span>
                )}
              </div>

              {/* Preset Avatars Selector */}
              <div className="mt-3 flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                <span className="text-[11px] text-slate-500 shrink-0">หรือเลือก:</span>
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border transition shrink-0 ${
                      avatarUrl === preset.url
                        ? 'border-pink-500 ring-2 ring-pink-500/50 scale-110'
                        : 'border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Username (only if new user) */}
            {!isLoggedIn && (
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  ชื่อบัญชีสำหรับล็อกอิน (Username) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="เช่น ploy_2026, nong_ice"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            {/* Nickname & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  ชื่อเล่นที่แสดงบนกระทง <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="เช่น น้องฟ้า"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">เพศของคุณ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  <option value="female">หญิง</option>
                  <option value="male">ชาย</option>
                  <option value="non-binary">LGBTQ+</option>
                </select>
              </div>
            </div>

            {/* Birthday & Zodiac */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">วันเกิดในสัปดาห์</label>
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value as DayOfWeek)}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  {Object.entries(DAY_THAI).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">ราศีเกิด</label>
                <select
                  value={zodiac}
                  onChange={(e) => setZodiac(e.target.value as ZodiacSign)}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                >
                  {Object.entries(ZODIAC_INFO).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.symbol} {info.thai}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3 SOCIAL CHANNELS SECTION (FACEBOOK, IG, TIKTOK) */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-pink-300 mb-1">
                  ✨ ช่องทางติดต่อเปิดวาร์ป (ใส่ได้ทั้ง 3 ช่องทาง)
                </label>
                <p className="text-[11px] text-slate-400">
                  กรอกช่องทางที่ต้องการเปิดวาร์ปให้คนที่ดวงสมพงษ์ (กรอกเท่าที่สะดวก)
                </p>
              </div>

              {/* 1. Facebook */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                  <FacebookIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook: เช่น facebook.com/profile หรือ ชื่อเฟซ"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* 2. Instagram */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-pink-400">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram: เช่น @your_instagram"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* 3. TikTok */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-300">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="TikTok: เช่น @your_tiktok"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="mt-0.5 rounded text-pink-500 focus:ring-pink-400 border-slate-700 bg-slate-800"
                />
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ยินยอมให้แสดงวาร์ปเหล่านี้แก่คนที่ดวงสมพงษ์กัน
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between gap-3">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await confirm({
                        title: 'ออกจากระบบ',
                        message: 'ต้องการออกจากระบบใช่หรือไม่?\nกระทงของคุณจะยังคงลอยอยู่ในสายน้ำตามปกติ แต่จะไม่แสดงเป็นกระทงของคุณบนเครื่องนี้ จนกว่าจะเข้าสู่ระบบใหม่อีกครั้ง',
                        confirmText: 'ออกจากระบบ',
                        cancelText: 'ยกเลิก',
                        type: 'danger',
                        icon: 'logout',
                      });
                      if (ok) {
                        logout();
                        toast.info('ออกจากระบบเรียบร้อยแล้ว');
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 transition cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition"
                  >
                    บันทึกโปรไฟล์
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/20 transition"
                >
                  บันทึกและเริ่มใช้งาน ✨
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
