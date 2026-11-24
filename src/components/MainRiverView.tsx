'use client';

import React, { useState } from 'react';
import {
  KrathongDesign,
  SingleProfile,
  CoupleProfile,
  FamilyMember,
  SocialContacts,
  Gender,
  TargetGender,
  ZodiacSign,
  DayOfWeek,
  ElementType,
  RiverKrathongItem,
} from '@/types/krathong';
import { Krathong2D } from './Krathong2D';
import { ZODIAC_INFO, ELEMENT_THAI } from '@/lib/astrology';
import { Sparkles, Heart, Flame, MessageCircle, X } from 'lucide-react';

export type { RiverKrathongItem };

interface MainRiverViewProps {
  krathongs: RiverKrathongItem[];
  onSelectSingle: () => void;
  onSelectCouple: () => void;
  onLikeKrathong: (id: string) => void;
}

export const MainRiverView: React.FC<MainRiverViewProps> = ({
  krathongs,
  onSelectSingle,
  onSelectCouple,
  onLikeKrathong,
}) => {
  const [selectedKrathong, setSelectedKrathong] = useState<RiverKrathongItem | null>(null);

  // Lanes define Y-position and Scale for 3D depth perspective
  const laneStyles = [
    { top: '38%', scale: 0.45, zIndex: 10, opacity: 0.75 }, // Furthest
    { top: '48%', scale: 0.58, zIndex: 15, opacity: 0.85 },
    { top: '58%', scale: 0.72, zIndex: 20, opacity: 0.95 },
    { top: '68%', scale: 0.88, zIndex: 25, opacity: 1 },
    { top: '78%', scale: 1.05, zIndex: 30, opacity: 1 }, // Nearest
  ];

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-[#050f24] select-none flex flex-col justify-between">
      {/* 1. NIGHT SKY & FULL MOON */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Full Moon */}
        <div className="absolute top-6 sm:top-10 right-8 sm:right-24 flex items-center justify-center">
          <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-radial from-amber-50 via-amber-200 to-amber-300 shadow-[0_0_90px_30px_rgba(253,230,138,0.35)] relative overflow-hidden">
            <div className="absolute top-4 left-5 w-6 h-6 rounded-full bg-amber-300/30 blur-xs" />
            <div className="absolute top-10 left-12 w-9 h-9 rounded-full bg-amber-300/25 blur-xs" />
            <div className="absolute bottom-5 right-6 w-7 h-7 rounded-full bg-amber-300/30 blur-xs" />
          </div>
        </div>

        {/* Twinkling Stars */}
        {[
          { t: '8%', l: '15%', s: 2.5, d: '1.5s' },
          { t: '16%', l: '35%', s: 2, d: '2.2s' },
          { t: '6%', l: '55%', s: 3, d: '1.8s' },
          { t: '22%', l: '70%', s: 1.5, d: '3s' },
          { t: '12%', l: '85%', s: 2, d: '2.5s' },
          { t: '28%', l: '20%', s: 2.5, d: '1.2s' },
          { t: '32%', l: '45%', s: 1.5, d: '2.8s' },
        ].map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: star.t,
              left: star.l,
              width: star.s,
              height: star.s,
              animationDuration: star.d,
            }}
          />
        ))}

        {/* Distant Temple and Riverside Lights */}
        <div className="absolute top-[28%] inset-x-0 h-20 opacity-25 flex items-end justify-center pointer-events-none">
          <svg className="w-full h-16 text-indigo-950" preserveAspectRatio="none" viewBox="0 0 1000 60">
            <path d="M0 60 L120 60 L140 40 L145 15 L150 40 L180 45 L190 30 L200 45 L270 60 L500 60 L520 35 L525 10 L530 35 L560 42 L650 60 L800 60 L820 38 L825 12 L830 38 L860 45 L1000 60 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 2. RIVER SURFACE */}
      <div className="absolute inset-x-0 bottom-0 top-[35%] bg-gradient-to-b from-indigo-950/70 via-slate-900 to-[#040e20] overflow-hidden">
        {/* Soft Water Ripple Waves */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,165,233,0.12)_0%,transparent_80%)]" />

        {/* Floating Krathongs drifting across the river */}
        {krathongs.map((item) => {
          const lane = laneStyles[item.lane % laneStyles.length];
          return (
            <div
              key={item.id}
              onClick={() => setSelectedKrathong(item)}
              style={{
                top: lane.top,
                zIndex: lane.zIndex,
                opacity: lane.opacity,
                transform: `scale(${lane.scale})`,
                animation: `driftRight ${item.speed}s linear infinite`,
                animationDelay: `-${item.delay}s`,
              }}
              className="absolute left-[-200px] cursor-pointer group hover:opacity-100 hover:scale-110 transition-transform duration-200"
            >
              {/* Vertical Bobbing Animation */}
              <div className="relative animate-[bounce_3.5s_ease-in-out_infinite]">
                {item.isMatchedWithMe && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.7)] flex items-center gap-1 animate-pulse whitespace-nowrap z-30">
                    <Heart className="w-3 h-3 fill-white" />
                    <span>ใจตรงกัน 💕</span>
                  </div>
                )}

                <div className={item.isMatchedWithMe ? 'drop-shadow-[0_0_20px_rgba(244,63,94,0.85)]' : ''}>
                  <Krathong2D
                    design={item.design}
                    size={140}
                    isCouple={item.mode === 'couple'}
                    name={item.name}
                    partnerName={item.partnerName}
                    showRipple={true}
                  />
                </div>

                {/* Hover Pill Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-950/90 text-amber-200 border border-amber-500/40 text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl pointer-events-none flex items-center gap-1">
                  <span>{item.isMatchedWithMe ? '💕 กระทงใจตรงกัน (คลิกดูวาร์ป)' : 'กดอ่านคำอธิษฐาน ✨'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. FLOATING TOP HEADER */}
      <div className="relative z-30 pt-4 sm:pt-6 px-4 flex flex-col items-center text-center pointer-events-none">
        <div className="inline-flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 text-amber-200 px-4 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-xl mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>มีกระทงร่วมลอยอยู่ในสายน้ำแล้ว {krathongs.length + 185} ใบ</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-md">
          สายน้ำแห่งคำอธิษฐาน คืนวันเพ็ญ
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1 drop-shadow-sm font-light">
          คลิกที่กระทงเพื่ออ่านคำขอพรของเพื่อนๆ หรือเลือกลอยกระทงของคุณลงสู่สายน้ำ
        </p>
      </div>

      {/* 4. BOTTOM FLOATING ACTION DOCK */}
      <div className="relative z-40 pb-6 sm:pb-8 px-4 flex justify-center">
        <div className="bg-slate-950/85 border border-slate-800/80 p-2 sm:p-2.5 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 max-w-xl w-full">
          {/* Button Single */}
          <button
            onClick={onSelectSingle}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-400 text-white font-bold py-3.5 px-5 rounded-2xl text-sm sm:text-base shadow-lg shadow-pink-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
          >
            <span className="text-xl">💖</span>
            <div className="text-left">
              <div className="font-bold leading-tight">ลอยกระทงคนโสด</div>
              <div className="text-[11px] text-pink-100 font-normal opacity-90">เสี่ยงทายหาคู่ดวงสมพงษ์</div>
            </div>
          </button>

          {/* Button Couple */}
          <button
            onClick={onSelectCouple}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold py-3.5 px-5 rounded-2xl text-sm sm:text-base shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
          >
            <span className="text-xl">👩‍❤️‍👨</span>
            <div className="text-left">
              <div className="font-bold leading-tight">ลอยกระทงคนมีคู่</div>
              <div className="text-[11px] text-slate-800 font-normal">ลอยเคียงข้างหวานใจ</div>
            </div>
          </button>
        </div>
      </div>

      {/* 5. POPUP CARD: READ KRATHONG WISH */}
      {selectedKrathong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setSelectedKrathong(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Mode Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700">
              {selectedKrathong.mode === 'single' ? '💖 กระทงคนโสด' : '👩‍❤️‍👨 กระทงคู่รัก'}
            </div>

            {/* Krathong Preview */}
            <div className="flex justify-center -my-2 transform scale-90">
              <Krathong2D
                design={selectedKrathong.design}
                size={140}
                isCouple={selectedKrathong.mode === 'couple'}
                name={selectedKrathong.name}
                partnerName={selectedKrathong.partnerName}
              />
            </div>

            {/* Name and Avatar */}
            <div className="flex flex-col items-center">
              {selectedKrathong.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedKrathong.avatarUrl}
                  alt={selectedKrathong.name}
                  className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-lg mb-1.5"
                />
              )}
              <h3 className="text-xl font-bold text-amber-200">
                {selectedKrathong.name}
                {selectedKrathong.partnerName && ` ❤️ ${selectedKrathong.partnerName}`}
              </h3>
              {selectedKrathong.zodiac && (
                <div className="text-xs text-slate-400 mt-0.5">
                  {selectedKrathong.zodiac}
                </div>
              )}
            </div>

            {/* Wish Text */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 italic leading-relaxed text-left">
              &ldquo;{selectedKrathong.wish}&rdquo;
            </div>

            {/* Like / Send Heart Button */}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  onLikeKrathong(selectedKrathong.id);
                  setSelectedKrathong({
                    ...selectedKrathong,
                    likes: selectedKrathong.likes + 1,
                  });
                }}
                className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 px-5 py-2.5 rounded-full text-xs font-bold transition transform active:scale-95"
              >
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                <span>ส่งกำลังใจ ({selectedKrathong.likes})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Keyframes for Continuous Drift */}
      <style jsx>{`
        @keyframes driftRight {
          0% {
            transform: translateX(0vw);
          }
          100% {
            transform: translateX(calc(100vw + 350px));
          }
        }
      `}</style>
    </div>
  );
};
