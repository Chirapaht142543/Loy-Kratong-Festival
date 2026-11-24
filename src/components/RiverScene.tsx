'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SingleProfile, CoupleProfile, FamilyProfile, MatchResult } from '@/types/krathong';
import { Krathong2D } from './Krathong2D';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Moon, Users } from 'lucide-react';

interface RiverSceneProps {
  mode: 'single' | 'couple' | 'family';
  singleData?: SingleProfile;
  coupleData?: CoupleProfile;
  familyData?: FamilyProfile;
  matchResult?: MatchResult | null;
  onRevealResult: () => void;
}

export const RiverScene: React.FC<RiverSceneProps> = ({
  mode,
  singleData,
  coupleData,
  familyData,
  matchResult,
  onRevealResult,
}) => {
  const [phase, setPhase] = useState<'floating' | 'seeking' | 'matched' | 'ready'>('floating');
  const [statusMessage, setStatusMessage] = useState('ปล่อยกระทงลงสู่สายน้ำ...');
  const confettiTriggeredRef = useRef(false);

  useEffect(() => {
    if (mode === 'single') {
      if (matchResult) {
        // 1. Initial drift (0s - 2.5s)
        const t1 = setTimeout(() => {
          setPhase('seeking');
          setStatusMessage('สายน้ำกำลังนำพาหาคนที่มีดวงชะตาสมพงษ์...');
        }, 2000);

        // 2. Candidate arrives & Collide (2.5s - 4.8s)
        const t2 = setTimeout(() => {
          setPhase('matched');
          setStatusMessage('✨ พบกระทงดวงชะตาต้องกันแล้ว!');

          // Trigger celebratory confetti fireworks
          if (!confettiTriggeredRef.current) {
            confettiTriggeredRef.current = true;
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#EC4899', '#38BDF8', '#FDE047'],
            });
          }
        }, 4500);

        // 3. Open Result Modal (6.2s)
        const t3 = setTimeout(() => {
          setPhase('ready');
          onRevealResult();
        }, 6200);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      } else {
        // Single mode without matched candidate yet
        const t1 = setTimeout(() => {
          setStatusMessage('กระทงของคุณกำลังล่องลอยนำพาความปรารถนาสู่สายน้ำ...');
        }, 2000);

        const t2 = setTimeout(() => {
          setPhase('ready');
          setStatusMessage('✨ ลอยกระทงสำเร็จ ขอให้สมหวังดั่งใจปรารถนา!');
          if (!confettiTriggeredRef.current) {
            confettiTriggeredRef.current = true;
            confetti({
              particleCount: 60,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#F59E0B', '#38BDF8', '#FDE047'],
            });
          }
        }, 4500);

        const t3 = setTimeout(() => {
          onRevealResult();
        }, 6000);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
          clearTimeout(t3);
        };
      }
    } else if (mode === 'family') {
      // Family Mode
      const t1 = setTimeout(() => {
        setStatusMessage('กระทงรวมใจครอบครัวกำลังลอยนำพาความอบอุ่นและสิริมงคล...');
      }, 1500);

      const t2 = setTimeout(() => {
        setPhase('matched');
        setStatusMessage('🏡✨ ขอให้สมาชิกทุกคนในครอบครัวร่มเย็นเป็นสุข สุขภาพแข็งแรง');
        if (!confettiTriggeredRef.current) {
          confettiTriggeredRef.current = true;
          confetti({
            particleCount: 85,
            spread: 75,
            origin: { y: 0.55 },
            colors: ['#FBBF24', '#F59E0B', '#10B981', '#38BDF8', '#EC4899'],
          });
        }
      }, 3500);

      const t3 = setTimeout(() => {
        setPhase('ready');
        onRevealResult();
      }, 5200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      // Couple Mode
      const t1 = setTimeout(() => {
        setStatusMessage('กระทงแห่งความรักกำลังลอยเคียงคู่ไปด้วยกัน...');
      }, 1500);

      const t2 = setTimeout(() => {
        setPhase('matched');
        setStatusMessage('💖 ขอให้ความรักของทั้งสองส่องสว่างดั่งแสงเทียน');
        if (!confettiTriggeredRef.current) {
          confettiTriggeredRef.current = true;
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.55 },
            colors: ['#EC4899', '#F43F5E', '#FBBF24'],
          });
        }
      }, 3500);

      const t3 = setTimeout(() => {
        setPhase('ready');
        onRevealResult();
      }, 5200);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [mode, onRevealResult]);

  return (
    <div className="relative w-full h-[85vh] sm:h-[90vh] overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-between select-none">
      {/* 1. SKY AMBIENCE */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Full Moon with Glow */}
        <div className="absolute top-8 sm:top-12 right-8 sm:right-16 flex items-center justify-center">
          <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-full bg-radial from-amber-100 via-amber-200 to-amber-300 shadow-[0_0_80px_25px_rgba(253,230,138,0.35)] relative overflow-hidden">
            {/* Soft moon crater texture */}
            <div className="absolute top-3 left-4 w-5 h-5 rounded-full bg-amber-300/30 blur-xs" />
            <div className="absolute top-8 left-10 w-8 h-8 rounded-full bg-amber-300/25 blur-xs" />
            <div className="absolute bottom-4 right-5 w-6 h-6 rounded-full bg-amber-300/30 blur-xs" />
          </div>
        </div>

        {/* Twinkling Stars */}
        {[
          { t: '15%', l: '20%', s: 2, d: '1.2s' },
          { t: '25%', l: '10%', s: 3, d: '2.5s' },
          { t: '10%', l: '45%', s: 2, d: '1.8s' },
          { t: '30%', l: '60%', s: 3, d: '3.1s' },
          { t: '20%', l: '75%', s: 1.5, d: '0.9s' },
          { t: '35%', l: '85%', s: 2.5, d: '2.2s' },
          { t: '8%', l: '80%', s: 2, d: '1.5s' },
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

        {/* Traditional Temple Silhouette on Horizon */}
        <div className="absolute top-[38%] inset-x-0 h-16 opacity-30 flex items-end justify-center pointer-events-none">
          <svg className="w-full h-14 text-indigo-950" preserveAspectRatio="none" viewBox="0 0 1000 60">
            <path d="M0 60 L100 60 L120 40 L125 15 L130 40 L160 45 L170 30 L180 45 L250 60 L600 60 L620 35 L625 10 L630 35 L660 42 L750 60 L1000 60 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* 2. RIVER WATER SURFACE (Middle to Bottom) */}
      <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-b from-indigo-950/80 via-slate-900 to-[#071328] overflow-hidden">
        {/* Animated Water Ripples and Candle Light Reflections */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(14,165,233,0.12)_0%,transparent_75%)]" />

        {/* Ambient Floating Krathongs (distant people) */}
        <div className="absolute top-[15%] left-[12%] opacity-60 scale-35 animate-[bounce_5s_infinite]">
          <Krathong2D
            design={{ base: 'banana-leaf', flower: 'marigold', candle: 'classic' }}
            size={80}
            showRipple={false}
          />
        </div>
        <div className="absolute top-[22%] right-[18%] opacity-55 scale-30 animate-[bounce_6s_infinite]">
          <Krathong2D
            design={{ base: 'lotus', flower: 'rose', candle: 'pink-love' }}
            size={80}
            showRipple={false}
          />
        </div>
        <div className="absolute top-[32%] left-[30%] opacity-70 scale-45 animate-[bounce_4.5s_infinite]">
          <Krathong2D
            design={{ base: 'bread', flower: 'mixed', candle: 'scented' }}
            size={90}
            showRipple={false}
          />
        </div>
      </div>

      {/* 3. STATUS MESSAGE HEADER */}
      <div className="relative z-30 pt-8 sm:pt-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 text-amber-200 px-5 py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-md shadow-xl animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>{statusMessage}</span>
        </div>
      </div>

      {/* 4. MAIN FLOATING STAGE */}
      <div className="relative z-20 w-full flex-1 flex items-center justify-center">
        {mode === 'single' && singleData && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* User's Krathong */}
            <div
              className={`absolute transition-all duration-[2200ms] ease-out ${
                phase === 'floating'
                  ? 'bottom-6 scale-100 translate-y-0 opacity-100'
                  : phase === 'seeking'
                  ? 'bottom-[28%] scale-75 translate-y-0 opacity-100'
                  : 'bottom-[30%] -translate-x-12 sm:-translate-x-16 scale-75 opacity-100'
              }`}
            >
              <div className="animate-[bounce_3s_ease-in-out_infinite]">
                <Krathong2D
                  design={singleData.design}
                  size={190}
                  name={singleData.nickname}
                />
              </div>
            </div>

            {/* Candidate's Krathong (Arrives during 'matched' phase) */}
            {matchResult && (
              <div
                className={`absolute transition-all duration-[2400ms] ease-out ${
                  phase === 'floating' || phase === 'seeking'
                    ? 'top-[-50px] right-[-80px] scale-40 opacity-0 pointer-events-none'
                    : 'bottom-[30%] translate-x-12 sm:translate-x-16 scale-75 opacity-100'
                }`}
              >
                <div className="animate-[bounce_3.2s_ease-in-out_infinite]">
                  <Krathong2D
                    design={matchResult.matchedPartner.design}
                    size={190}
                    name={matchResult.matchedPartner.nickname}
                  />
                </div>
              </div>
            )}

            {/* Collision Sparkles & Heart Aura */}
            {(phase === 'matched' || phase === 'ready') && matchResult && (
              <div className="absolute bottom-[35%] flex items-center justify-center pointer-events-none animate-ping">
                <div className="w-40 h-40 rounded-full bg-pink-500/20 blur-xl" />
                <Heart className="w-10 h-10 text-pink-400 fill-pink-400" />
              </div>
            )}
          </div>
        )}

        {/* Couple Mode Krathongs */}
        {mode === 'couple' && coupleData && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className={`absolute transition-all duration-[3000ms] ease-out ${
                phase === 'floating'
                  ? 'bottom-6 scale-100 opacity-100'
                  : 'bottom-[30%] scale-80 opacity-100'
              }`}
            >
              <div className="animate-[bounce_3.5s_ease-in-out_infinite]">
                <Krathong2D
                  design={coupleData.design}
                  size={200}
                  isCouple={true}
                  name={coupleData.partner1Name}
                  partnerName={coupleData.partner2Name}
                />
              </div>
            </div>

            {(phase === 'matched' || phase === 'ready') && (
              <div className="absolute bottom-[38%] flex items-center justify-center pointer-events-none animate-pulse">
                <Heart className="w-12 h-12 text-rose-400 fill-rose-400 animate-bounce" />
              </div>
            )}
          </div>
        )}

        {/* Family Mode Krathongs */}
        {mode === 'family' && familyData && (
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className={`absolute transition-all duration-[3000ms] ease-out ${
                phase === 'floating'
                  ? 'bottom-6 scale-100 opacity-100'
                  : 'bottom-[30%] scale-85 opacity-100'
              }`}
            >
              <div className="animate-[bounce_3.5s_ease-in-out_infinite]">
                <Krathong2D
                  design={familyData.design}
                  size={210}
                  isFamily={true}
                  name={familyData.familyName}
                  familyCount={familyData.members.length}
                />
              </div>
            </div>

            {(phase === 'matched' || phase === 'ready') && (
              <div className="absolute bottom-[40%] flex items-center justify-center pointer-events-none animate-pulse">
                <div className="w-48 h-48 rounded-full bg-amber-400/20 blur-2xl" />
                <Sparkles className="w-12 h-12 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. FOOTER HINT & MANUAL REVEAL BUTTON */}
      <div className="relative z-30 pb-6 px-4">
        {phase === 'ready' && (
          <button
            onClick={onRevealResult}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-bold px-6 py-2.5 rounded-full text-sm shadow-xl shadow-amber-500/25 animate-bounce transition hover:scale-105"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            เปิดดูผลการลอยกระทง
          </button>
        )}
      </div>
    </div>
  );
};
