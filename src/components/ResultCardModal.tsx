'use client';

import React, { useState } from 'react';
import { useDialog } from '@/context/DialogContext';
import { SingleProfile, CoupleProfile, FamilyProfile, MatchResult } from '@/types/krathong';
import { ZODIAC_INFO, DAY_THAI, ELEMENT_THAI } from '@/lib/astrology';
import { Krathong2D } from './Krathong2D';
import {
  Sparkles,
  Heart,
  Share2,
  RotateCcw,
  Check,
  ExternalLink,
  Flame,
  Award,
  User,
  Users,
  X,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';

interface ResultCardModalProps {
  mode: 'single' | 'couple' | 'family';
  singleData?: SingleProfile;
  coupleData?: CoupleProfile;
  familyData?: FamilyProfile;
  matchResult?: MatchResult | null;
  onRestart: () => void;
  onGoToRiver?: () => void;
}

export const ResultCardModal: React.FC<ResultCardModalProps> = ({
  mode,
  singleData,
  coupleData,
  familyData,
  matchResult,
  onRestart,
  onGoToRiver,
}) => {
  const { toast } = useDialog();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('คัดลอกลิงก์กระทงเรียบร้อยแล้ว! ✨');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg my-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-left overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onRestart}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          title="ปิดหน้าต่าง & ไปที่แผนที่แม่น้ำ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. SINGLE RESULT CARD */}
        {mode === 'single' && singleData && matchResult && (
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-lg shadow-amber-500/20 mb-3">
                <Flame className="w-3.5 h-3.5 fill-slate-950" />
                ดวงสมพงษ์เข้ากันได้ {matchResult.score}%
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-200">
                {matchResult.elementHarmoniousTitle}
              </h2>
            </div>

            {/* Visual Pairing between User and Matched Candidate */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-around relative">
              {/* User Side */}
              <div className="flex flex-col items-center text-center">
                {singleData.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={singleData.avatarUrl}
                    alt={singleData.nickname}
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md mb-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-slate-300 mb-1">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="transform scale-65 -my-4">
                  <Krathong2D design={singleData.design} size={105} showRipple={false} />
                </div>
                <div className="font-bold text-sm text-slate-100">{singleData.nickname}</div>
                <div className="text-[11px] text-amber-300">
                  {DAY_THAI[singleData.birthDay]} • {ZODIAC_INFO[singleData.zodiac].thai}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {ELEMENT_THAI[singleData.element].name}
                </div>
              </div>

              {/* Heart in Middle */}
              <div className="flex flex-col items-center justify-center px-2">
                <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center animate-pulse">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                </div>
                <span className="text-[10px] text-pink-300 font-semibold mt-1">
                  {matchResult.score}%
                </span>
              </div>

              {/* Matched Partner Side */}
              <div className="flex flex-col items-center text-center">
                {matchResult.matchedPartner.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={matchResult.matchedPartner.avatarUrl}
                    alt={matchResult.matchedPartner.nickname}
                    className="w-12 h-12 rounded-full border-2 border-pink-400 object-cover shadow-md mb-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700/80 border border-slate-600 flex items-center justify-center text-slate-300 mb-1">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="transform scale-65 -my-4">
                  <Krathong2D design={matchResult.matchedPartner.design} size={105} showRipple={false} />
                </div>
                <div className="font-bold text-sm text-slate-100">
                  {matchResult.matchedPartner.nickname}
                </div>
                <div className="text-[11px] text-pink-300">
                  {DAY_THAI[matchResult.matchedPartner.birthDay]} • {ZODIAC_INFO[matchResult.matchedPartner.zodiac].thai}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {ELEMENT_THAI[matchResult.matchedPartner.element].name}
                </div>
              </div>
            </div>

            {/* Fortune Reading */}
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="text-amber-400 font-semibold">🔮 คำทำนายดวงชะตาสายมู: </span>
              {matchResult.astrologyFortuneText}
            </div>

            {/* Partner's Wish */}
            <div className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-2xl text-xs space-y-1">
              <div className="text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> คำอธิษฐานของ {matchResult.matchedPartner.nickname}:
              </div>
              <p className="text-slate-200 italic pl-4">
                &ldquo;{matchResult.matchedPartner.wish}&rdquo;
              </p>
            </div>

            {/* Warp / Contact Info Button (Facebook, IG, TikTok) */}
            <div className="pt-1">
              {matchResult.matchedPartner.allowContact &&
              (matchResult.matchedPartner.contacts?.facebook ||
                matchResult.matchedPartner.contacts?.instagram ||
                matchResult.matchedPartner.contacts?.tiktok) ? (
                <div className="bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-blue-500/15 border border-pink-500/40 p-4 rounded-2xl text-center space-y-3">
                  <div className="text-xs text-pink-300 font-semibold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    คนดวงสมพงษ์ยินยอมเปิดวาร์ปให้คุณ!
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {/* Facebook Button */}
                    {matchResult.matchedPartner.contacts?.facebook && (
                      <a
                        href={
                          matchResult.matchedPartner.contacts.facebook.startsWith('http')
                            ? matchResult.matchedPartner.contacts.facebook
                            : `https://facebook.com/${matchResult.matchedPartner.contacts.facebook.replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition transform hover:scale-102"
                      >
                        <FacebookIcon className="w-4 h-4" />
                        <span>Facebook</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    )}

                    {/* Instagram Button */}
                    {matchResult.matchedPartner.contacts?.instagram && (
                      <a
                        href={`https://instagram.com/${matchResult.matchedPartner.contacts.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition transform hover:scale-102"
                      >
                        <InstagramIcon className="w-4 h-4" />
                        <span>IG: {matchResult.matchedPartner.contacts.instagram}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    )}

                    {/* TikTok Button */}
                    {matchResult.matchedPartner.contacts?.tiktok && (
                      <a
                        href={`https://tiktok.com/@${matchResult.matchedPartner.contacts.tiktok.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-300 font-bold px-3.5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition transform hover:scale-102"
                      >
                        <TikTokIcon className="w-4 h-4" />
                        <span>TikTok: {matchResult.matchedPartner.contacts.tiktok}</span>
                        <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-800/40 border border-slate-700 p-3 rounded-2xl text-center text-xs text-slate-400">
                  🔮 คนนี้ไม่ได้ระบุวาร์ปไว้ หากเป็นเนื้อคู่กันจริง สักวันจะวนมาพบกันแน่นอน
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {matchResult.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-1 rounded-full border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 1.1 SINGLE RESULT CARD (AWAITING MATCH / FLOATED) */}
        {mode === 'single' && singleData && !matchResult && (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-lg shadow-amber-500/20">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              กระทงสายเดี่ยวลอยสู่สายน้ำแล้ว ✨
            </div>

            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200">
                {singleData.nickname}
              </h2>
              <p className="text-xs text-amber-400 mt-1">
                {DAY_THAI[singleData.birthDay]} • {ZODIAC_INFO[singleData.zodiac].thai} ({ELEMENT_THAI[singleData.element].name})
              </p>
            </div>

            {/* Krathong Preview */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-center">
              <div className="transform scale-90 -my-2">
                <Krathong2D
                  design={singleData.design}
                  size={160}
                  name={singleData.nickname}
                />
              </div>
            </div>

            {/* Wish Message */}
            <div className="bg-slate-950/70 border border-amber-500/30 p-4 rounded-2xl text-xs sm:text-sm text-amber-100 italic leading-relaxed">
              &ldquo;{singleData.wish}&rdquo;
            </div>

            {/* Elemental Fortune */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 text-left">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                คำทำนายดวงชะตา ({ELEMENT_THAI[singleData.element].name}):
              </div>
              <p className="leading-relaxed">
                {ELEMENT_THAI[singleData.element].desc} ขอให้ปีนี้ความรักและกัลยาณมิตรที่ดีหลั่งไหลเข้ามาดั่งสายน้ำ
              </p>
            </div>

            {/* Status note */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 leading-relaxed">
              กระทงของคุณกำลังลอยในแม่น้ำ หากมีผู้ลอยกระทงท่านอื่นที่มีดวงสมพงษ์เข้ากัน ระบบจะส่งหัวใจและแจ้งเตือนให้คุณทราบ!
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {[
                `#${ELEMENT_THAI[singleData.element].name}`,
                `#${ZODIAC_INFO[singleData.zodiac].thai}`,
                '#คนโสดเสน่ห์แรง',
                '#ลอยกระทง๒๕๖๙',
              ].map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-800/90 text-amber-300/80 border border-amber-500/20 text-[10px] px-2.5 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. COUPLE RESULT CARD */}
        {mode === 'couple' && coupleData && (
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-pink-500/20">
              <Award className="w-3.5 h-3.5" />
              การ์ดบันทึกความทรงจำวันลอยกระทง ๒๕๖๙
            </div>

            <div className="py-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-200">
                {coupleData.partner1Name} <span className="text-rose-400">❤️</span> {coupleData.partner2Name}
              </h2>
              <p className="text-xs text-slate-400 mt-1">ลอยกระทงเคียงข้างกันในคืนวันเพ็ญเดือนสิบสอง</p>
            </div>

            {/* Couple Krathong Preview */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-center">
              <div className="transform scale-80 -my-4">
                <Krathong2D
                  design={coupleData.design}
                  size={180}
                  isCouple={true}
                  name={coupleData.partner1Name}
                  partnerName={coupleData.partner2Name}
                />
              </div>
            </div>

            {/* Love Message */}
            <div className="bg-slate-950/70 border border-pink-500/30 p-4 rounded-2xl text-xs sm:text-sm text-pink-100 italic leading-relaxed">
              &ldquo;{coupleData.loveMessage}&rdquo;
            </div>

            <div className="text-xs text-amber-300 font-medium">
              ✨ ขอพรพระแม่คงคาดลบันดาลให้ความรักราบรื่นและมั่นคงยืนยาว
            </div>
          </div>
        )}

        {/* 3. FAMILY RESULT CARD */}
        {mode === 'family' && familyData && (
          <div className="space-y-5 text-center">
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-amber-500/20">
              <Users className="w-3.5 h-3.5" />
              การ์ดรวมใจครอบครัว & สัตว์เลี้ยง วันลอยกระทง ๒๕๖๙
            </div>

            <div className="py-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200">
                🏡 {familyData.familyName}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ร่วมลอยกระทงพร้อมหน้าพร้อมตา รวมสมาชิก{' '}
                <strong className="text-amber-300">
                  {familyData.members.filter((m) => !m.isPet).length} คน
                  {familyData.members.filter((m) => m.isPet).length > 0 &&
                    ` • 🐾 ${familyData.members.filter((m) => m.isPet).length} ตัว`}
                </strong>
              </p>
            </div>

            {/* Family Krathong Preview */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 flex items-center justify-center">
              <div className="transform scale-80 -my-3">
                <Krathong2D
                  design={familyData.design}
                  size={190}
                  isFamily={true}
                  name={familyData.familyName}
                  familyMembers={familyData.members}
                  familyCount={familyData.members.length}
                />
              </div>
            </div>

            {/* Family Members Grid */}
            <div className="bg-slate-950/70 border border-amber-500/30 p-3.5 rounded-2xl text-left space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                <span>👨‍👩‍👧‍👦 สมาชิก & สัตว์เลี้ยงแสนรักในกระทง:</span>
                <span className="text-[11px] text-slate-400">
                  {familyData.members.filter((m) => !m.isPet).length} คน
                  {familyData.members.filter((m) => m.isPet).length > 0 &&
                    ` • 🐾 ${familyData.members.filter((m) => m.isPet).length} ตัว`}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {familyData.members.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                      m.isPet
                        ? 'bg-amber-950/30 border-orange-500/40 shadow-xs'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        className={`w-8 h-8 rounded-full object-cover shrink-0 ${
                          m.isPet ? 'border-2 border-orange-400' : 'border border-amber-400'
                        }`}
                      />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs shrink-0">
                        {m.isPet ? '🐾' : '👤'}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-slate-100 truncate flex items-center gap-1">
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            m.isPet
                              ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/30'
                              : 'text-amber-400'
                          }`}
                        >
                          {m.isPet ? `🐾 ${m.role}` : `[${m.role}]`}
                        </span>
                        <span className="truncate">{m.name}</span>
                      </div>
                      {m.wish && (
                        <div className="text-[10px] text-slate-400 truncate italic mt-0.5">
                          &ldquo;{m.wish}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Family Wish Box */}
            <div className="bg-slate-950/70 border border-amber-500/30 p-3.5 rounded-2xl text-xs sm:text-sm text-amber-100 italic leading-relaxed text-left">
              &ldquo;{familyData.familyWish}&rdquo;
            </div>

            <div className="text-xs text-amber-300 font-medium">
              ✨ ขอพรพระแม่คงคาดลบันดาลให้ทุกคนในบ้านและน้องๆ สัตว์เลี้ยงสุขภาพแข็งแรง ร่มเย็นเป็นสุข ปลอดภัย
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800">
          {/* Primary CTA: Jump to River Map */}
          <button
            onClick={onGoToRiver || onRestart}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl text-sm sm:text-base shadow-xl transition transform hover:scale-102 active:scale-98"
          >
            <span>🌊</span>
            <span>ไปดูกระทงของคุณบนแม่น้ำ</span>
            <Sparkles className="w-4 h-4 text-slate-950" />
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> คัดลอกลิงก์แล้ว
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-amber-400" /> แชร์ให้เพื่อน
                </>
              )}
            </button>

            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> ลอยใหม่อีกครั้ง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
