'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import {
  SingleProfile,
  Gender,
  TargetGender,
  DayOfWeek,
  ZodiacSign,
  KrathongDesign,
} from '@/types/krathong';
import { ZODIAC_INFO, DAY_THAI, ELEMENT_THAI } from '@/lib/astrology';
import { PRESET_AVATARS, compressImageFile } from '@/lib/imageUtils';
import { KrathongCustomizer } from './KrathongCustomizer';
import { Sparkles, ArrowRight, ArrowLeft, Heart, ShieldCheck, User, Camera } from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';

interface SingleFlowProps {
  onComplete: (profile: SingleProfile) => void;
  onBack: () => void;
}

export const SingleFlow: React.FC<SingleFlowProps> = ({ onComplete, onBack }) => {
  const { currentUser } = useAuth();
  const { alert, toast } = useDialog();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State initialized from currentUser or saved profile
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0].url);
  const [gender, setGender] = useState<Gender>(currentUser?.gender || 'female');
  const [targetGender, setTargetGender] = useState<TargetGender>(currentUser?.targetGender || 'male');
  const [birthDay, setBirthDay] = useState<DayOfWeek>(currentUser?.birthDay || 'friday');
  const [zodiac, setZodiac] = useState<ZodiacSign>(currentUser?.zodiac || 'libra');
  // 3 Social Channels initialized from currentUser if available
  const [facebook, setFacebook] = useState(currentUser?.contacts?.facebook || '');
  const [instagram, setInstagram] = useState(currentUser?.contacts?.instagram || '');
  const [tiktok, setTiktok] = useState(currentUser?.contacts?.tiktok || '');
  const [allowContact, setAllowContact] = useState(currentUser?.allowContact ?? true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Restore saved profile from currentUser or localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        if (currentUser.nickname) setNickname(currentUser.nickname);
        if (currentUser.avatarUrl) setAvatarUrl(currentUser.avatarUrl);
        if (currentUser.gender) setGender(currentUser.gender);
        if (currentUser.targetGender) setTargetGender(currentUser.targetGender);
        if (currentUser.birthDay) setBirthDay(currentUser.birthDay);
        if (currentUser.zodiac) setZodiac(currentUser.zodiac);
        if (currentUser.contacts?.facebook) setFacebook(currentUser.contacts.facebook);
        if (currentUser.contacts?.instagram) setInstagram(currentUser.contacts.instagram);
        if (currentUser.contacts?.tiktok) setTiktok(currentUser.contacts.tiktok);
        if (typeof currentUser.allowContact === 'boolean') setAllowContact(currentUser.allowContact);
        if (currentUser.bio) setWish(currentUser.bio);
      } else {
        const saved = localStorage.getItem('loy_krathong_saved_single_profile');
        if (saved) {
          const p = JSON.parse(saved);
          if (p.nickname) setNickname(p.nickname);
          if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
          if (p.gender) setGender(p.gender);
          if (p.targetGender) setTargetGender(p.targetGender);
          if (p.birthDay) setBirthDay(p.birthDay);
          if (p.zodiac) setZodiac(p.zodiac);
          if (p.contacts?.facebook) setFacebook(p.contacts.facebook);
          if (p.contacts?.instagram) setInstagram(p.contacts.instagram);
          if (p.contacts?.tiktok) setTiktok(p.contacts.tiktok);
          if (typeof p.allowContact === 'boolean') setAllowContact(p.allowContact);
          if (p.wish) setWish(p.wish);
        }
      }
    } catch {}
  }, [currentUser]);

  // Krathong Design & Wish State
  const [design, setDesign] = useState<KrathongDesign>({
    base: 'lotus',
    flower: 'marigold',
    candle: 'classic',
  });
  const [wish, setWish] = useState('');

  const currentElement = ZODIAC_INFO[zodiac].element;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImageFile(file);
      setAvatarUrl(base64);
      toast.success('อัปโหลดรูปโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      console.error('Failed to compress avatar:', err);
      toast.error('ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อเล่นหรือนามแฝงของคุณเพื่อร่วมลอยกระทง',
        type: 'warning',
      });
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    const hasAnyContact = !!(facebook.trim() || instagram.trim() || tiktok.trim());
    const finalAvatar = currentUser?.avatarUrl || avatarUrl || PRESET_AVATARS[0].url;
    const profile: SingleProfile = {
      id: 'usr-' + Date.now(),
      mode: 'single',
      nickname: nickname.trim(),
      gender,
      targetGender,
      birthDay,
      zodiac,
      element: currentElement,
      contacts: {
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        tiktok: tiktok.trim(),
      },
      allowContact: hasAnyContact ? allowContact : false,
      avatarUrl: finalAvatar,
      wish: wish.trim() || 'ขอให้เจอความรักที่ดี มีความสุข สมหวังในทุกสิ่ง ✨',
      design,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('loy_krathong_saved_single_profile', JSON.stringify(profile));
    } catch {}

    onComplete(profile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 1 ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>1</span>
          <span>ข้อมูลดวงชะตา & วาร์ป</span>
        </div>
        <div className="w-6 h-0.5 bg-slate-700" />
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 2 ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>2</span>
          <span>แต่งกระทง & ขอพร</span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: Astrology & Contact Form */
        <form onSubmit={handleNextStep} className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-6">
          <div className="text-center pb-2">
            <span className="inline-flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> ลอยกระทงคนโสด เสี่ยงทายตามหาคู่
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-200">กรอกข้อมูลดวงชะตาของคุณ</h2>
            {currentUser && (
              <div className="inline-flex items-center gap-2 mt-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1 rounded-full text-xs text-amber-300">
                {currentUser.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span>ดึงข้อมูลจากโปรไฟล์: {currentUser.nickname}</span>
              </div>
            )}
            <p className="text-sm text-slate-400 mt-1">
              ระบบจะนำธาตุ ราศี และวันเกิดของคุณไปจับคู่กับคนที่ดวงสมพงษ์ที่สุดในคืนวันเพ็ญ
            </p>
          </div>

          {/* Avatar / Profile Picture Picker */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              รูปโปรไฟล์ของคุณ
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition"
                  title="เปลี่ยนรูปภาพ"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-1.5 items-center">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarUrl(av.url)}
                      className={`w-9 h-9 rounded-xl overflow-hidden border transition transform hover:scale-110 ${
                        avatarUrl === av.url ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-slate-700 opacity-70'
                      }`}
                      title={av.label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-2 rounded-xl border border-slate-700 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>อัปโหลด</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">
              ชื่อเล่น หรือ นามแฝง <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="เช่น น้องฟ้า, ไนน์, เมฆ"
              className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
            />
          </div>

          {/* Gender & Target Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">เพศของคุณ</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                <option value="female">หญิง</option>
                <option value="male">ชาย</option>
                <option value="non-binary">LGBTQ+ / ไม่จำกัดเพศ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">มองหาคู่เพศไหน</label>
              <select
                value={targetGender}
                onChange={(e) => setTargetGender(e.target.value as TargetGender)}
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
                <option value="any">เพศไหนก็ได้ที่คุยแล้วถูกใจ</option>
              </select>
            </div>
          </div>

          {/* Birthday & Zodiac */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">เกิดวันอะไรในสัปดาห์</label>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value as DayOfWeek)}
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                {Object.entries(DAY_THAI).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">ราศีเกิดของคุณ</label>
              <select
                value={zodiac}
                onChange={(e) => setZodiac(e.target.value as ZodiacSign)}
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              >
                {Object.entries(ZODIAC_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.symbol} {info.thai} ({info.date})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Element Display Pill */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">ธาตุประจำราศีของคุณ:</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 ${ELEMENT_THAI[currentElement].color}`}>
              {ELEMENT_THAI[currentElement].name} ({ELEMENT_THAI[currentElement].desc})
            </span>
          </div>

          {/* Contact Handle / Open Warp Section (3 Channels: Facebook, IG, TikTok) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-pink-300">
                  <Heart className="w-4 h-4 text-pink-400" />
                  ช่องทางติดต่อ (เปิดวาร์ปเมื่อดวงสมพงษ์)
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  สามารถใส่ได้ทั้ง 3 ช่องทาง หรือใส่เฉพาะอันที่สะดวกได้เลย
                </p>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">ไม่บังคับ</span>
            </div>

            <div className="space-y-2.5">
              {/* Facebook */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                  <FacebookIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook: เช่น facebook.com/profile หรือ ชื่อเฟซ"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Instagram */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-400">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram: เช่น @your_instagram"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
              </div>

              {/* TikTok */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-300">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="TikTok: เช่น @your_tiktok"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>

            {(facebook.trim() || instagram.trim() || tiktok.trim()) && (
              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="mt-0.5 rounded text-pink-500 focus:ring-pink-400 border-slate-700 bg-slate-800"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  ยินยอมให้แสดงช่องทางติดต่อเหล่านี้แก่คนที่ดวงสมพงษ์กับการลอยกระทงนี้
                </span>
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-7 py-3 rounded-2xl text-sm shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5 transition"
            >
              ไปแต่งกระทง <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* STEP 2: Krathong Customizer & Wish */
        <div className="space-y-6">
          <KrathongCustomizer design={design} onChange={setDesign} name={nickname} />

          {/* Wish Box */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-xl text-left">
            <label className="block text-sm font-semibold text-amber-300 mb-2">
              ✨ คำอธิษฐานขอพรพระแม่คงคา & เสี่ยงทายเนื้อคู่
            </label>
            <textarea
              rows={3}
              maxLength={150}
              value={wish}
              onChange={(e) => setWish(e.target.value)}
              placeholder="เช่น ขอให้ลอยความทุกข์ไปกับสายน้ำ แล้วได้เจอคนที่ใจดี อบอุ่น พร้อมสร้างความทรงจำดีๆ ร่วมกันในปีนี้..."
              className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span>พลังแห่งคำอธิษฐานจะนำพาดวงชะตาที่เกื้อหนุนมาพบกัน</span>
              <span>{wish.length}/150</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> แก้ไขข้อมูลดวง
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-xl shadow-pink-500/25 transform hover:scale-102 transition"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              จุดเทียน & ลอยกระทงหาคู่ ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
