'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { PRESET_AVATARS, compressImageFile } from '@/lib/imageUtils';
import { Gender, DayOfWeek, ZodiacSign } from '@/types/krathong';
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
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, isLoggedIn, login, register, updateProfile, logout } = useAuth();
  const { confirm, alert, toast } = useDialog();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    isLoggedIn ? 'register' : 'login'
  );

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

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

    let draftProfile: any = null;
    let draftItem: any = null;
    try {
      const savedDraft = localStorage.getItem('loy_krathong_saved_single_profile');
      if (savedDraft) draftProfile = JSON.parse(savedDraft);
      const savedItem = localStorage.getItem('loy_krathong_my_item');
      if (savedItem) draftItem = JSON.parse(savedItem);
    } catch {}

    if (currentUser) {
      setUsername(currentUser.username || '');
      setNickname(currentUser.nickname || draftProfile?.nickname || draftItem?.name || '');
      setAvatarUrl(currentUser.avatarUrl || draftProfile?.avatarUrl || draftItem?.avatarUrl || PRESET_AVATARS[0].url);
      setGender(currentUser.gender || draftProfile?.gender || 'female');
      setBirthDay(currentUser.birthDay || draftProfile?.birthDay || 'friday');
      setZodiac(currentUser.zodiac || draftProfile?.zodiac || 'libra');
      setFacebook(currentUser.contacts?.facebook || draftProfile?.contacts?.facebook || '');
      setInstagram(currentUser.contacts?.instagram || draftProfile?.contacts?.instagram || '');
      setTiktok(currentUser.contacts?.tiktok || draftProfile?.contacts?.tiktok || '');
      setAllowContact(currentUser.allowContact ?? draftProfile?.allowContact ?? true);
      setBio(currentUser.bio || draftProfile?.wish || draftItem?.wish || '');
      setMode('register');
    } else {
      if (draftProfile || draftItem) {
        const prefilledNick = draftProfile?.nickname || draftItem?.name || '';
        setNickname(prefilledNick);
        setUsername(prefilledNick ? prefilledNick.toLowerCase().replace(/[^a-z0-9_]/g, '') : '');
        setAvatarUrl(draftProfile?.avatarUrl || draftItem?.avatarUrl || PRESET_AVATARS[0].url);
        setGender(draftProfile?.gender || 'female');
        setBirthDay(draftProfile?.birthDay || 'friday');
        setZodiac(draftProfile?.zodiac || 'libra');
        setFacebook(draftProfile?.contacts?.facebook || '');
        setInstagram(draftProfile?.contacts?.instagram || '');
        setTiktok(draftProfile?.contacts?.tiktok || '');
        setAllowContact(draftProfile?.allowContact ?? true);
        setBio(draftProfile?.wish || draftItem?.wish || '');
        setMode('register');
      } else {
        setMode(isLoggedIn ? 'register' : 'login');
      }
    }
  }, [isOpen, currentUser, isLoggedIn]);

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

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError('กรุณากรอกชื่อผู้ใช้');
      return;
    }

    const success = login(loginUsername);
    if (success) {
      onClose();
    } else {
      setLoginError('ไม่พบบัญชีนี้ คุณสามารถกดแท็บ "สร้างโปรไฟล์ใหม่" เพื่อเริ่มต้นได้เลย');
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
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full mb-2">
              <User className="w-3.5 h-3.5" /> จัดการโปรไฟล์ของคุณ
            </span>
            <h2 className="text-2xl font-bold text-amber-200">แก้ไขข้อมูล & รูปโปรไฟล์</h2>
          </div>
        )}

        {/* 1. LOGIN TAB */}
        {mode === 'login' && !isLoggedIn && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="text-center pb-2">
              <h2 className="text-2xl font-bold text-amber-200">เข้าสู่ระบบอย่างง่าย</h2>
              <p className="text-xs text-slate-400 mt-1">
                กรอกชื่อบัญชี (Username) ที่เคยสร้างไว้เพื่อดึงข้อมูลโปรไฟล์และวาร์ปของคุณ
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                ชื่อผู้ใช้ (Username)
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="เช่น ploy_cute, win99"
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transition"
            >
              เข้าสู่ระบบทันที
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
                        message: 'ต้องการออกจากระบบใช่หรือไม่?\nคุณสามารถกลับมาเข้าสู่ระบบได้ตลอดเวลา',
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
