'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { CoupleProfile, KrathongDesign } from '@/types/krathong';
import { PRESET_AVATARS } from '@/lib/imageUtils';
import { KrathongCustomizer } from './KrathongCustomizer';
import { Heart, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface CoupleFlowProps {
  onComplete: (profile: CoupleProfile) => void;
  onBack: () => void;
}

export const CoupleFlow: React.FC<CoupleFlowProps> = ({ onComplete, onBack }) => {
  const { currentUser } = useAuth();
  const { alert } = useDialog();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [partner1Name, setPartner1Name] = useState(currentUser?.nickname || '');
  const [partner2Name, setPartner2Name] = useState('');
  const [loveMessage, setLoveMessage] = useState('');

  // Restore saved couple names from currentUser or localStorage
  useEffect(() => {
    try {
      if (currentUser?.nickname) {
        setPartner1Name(currentUser.nickname);
      } else {
        const saved = localStorage.getItem('loy_krathong_saved_couple_profile');
        if (saved) {
          const p = JSON.parse(saved);
          if (p.partner1Name) setPartner1Name(p.partner1Name);
          if (p.partner2Name) setPartner2Name(p.partner2Name);
          if (p.loveMessage) setLoveMessage(p.loveMessage);
        }
      }
    } catch {}
  }, [currentUser]);

  // Krathong Design
  const [design, setDesign] = useState<KrathongDesign>({
    base: 'lotus',
    flower: 'rose',
    candle: 'pink-love',
  });

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner1Name.trim() || !partner2Name.trim()) {
      alert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อของคุณและหวานใจทั้งสองคนให้ครบถ้วนครับ ❤️',
        type: 'warning',
      });
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    const finalAvatar = currentUser?.avatarUrl || PRESET_AVATARS[0].url;
    const profile: CoupleProfile = {
      id: 'cpl-' + Date.now(),
      mode: 'couple',
      partner1Name: partner1Name.trim(),
      partner2Name: partner2Name.trim(),
      partner1Avatar: finalAvatar,
      loveMessage: loveMessage.trim() || 'ขอให้ความรักของเราสองคนมั่นคง หวานชื่น และจับมือเคียงข้างกันตลอดไป 💖',
      design,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('loy_krathong_saved_couple_profile', JSON.stringify(profile));
    } catch {}

    onComplete(profile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 1 ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>1</span>
          <span>ชื่อคู่รัก & ข้อความหวาน</span>
        </div>
        <div className="w-6 h-0.5 bg-slate-700" />
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 2 ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>2</span>
          <span>แต่งกระทงคู่รัก</span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: Names & Love Message */
        <form onSubmit={handleNextStep} className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-6">
          <div className="text-center pb-2">
            <span className="inline-flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs px-3 py-1 rounded-full mb-3">
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" /> ลอยกระทงคู่รัก เคียงข้างกันหวานฉ่ำ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-pink-200">บันทึกชื่อคุณและคนรู้ใจ</h2>
            <p className="text-sm text-slate-400 mt-1">
              กระทงสองใบจะถูกผูกโยงด้วยสายสิญจน์แห่งรัก ลอยเคียงคู่กันไปตามสายน้ำ ไม่โดนใครพัดแยก
            </p>
          </div>

          {/* Dual Names Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                ชื่อของคุณ <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={partner1Name}
                onChange={(e) => setPartner1Name(e.target.value)}
                placeholder="เช่น พี่ต้น, แทน"
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                ชื่อหวานใจของคุณ <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={partner2Name}
                onChange={(e) => setPartner2Name(e.target.value)}
                placeholder="เช่น น้องมายด์, พิมพ์"
                className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          {/* Love Message Box */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1.5">
              คำสัญญา หรือ ข้อความอธิษฐานรัก <span className="text-slate-400 text-xs font-normal">(แสดงบนการ์ดความทรงจำ)</span>
            </label>
            <textarea
              rows={3}
              maxLength={150}
              value={loveMessage}
              onChange={(e) => setLoveMessage(e.target.value)}
              placeholder="เช่น ขอบคุณที่อยู่เคียงข้างกันเสมอ ขอให้ทุกวันของเราเต็มไปด้วยรอยยิ้ม รักเธอที่สุดนะ ❤️"
              className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1">
              {loveMessage.length}/150
            </div>
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
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/20 transform hover:-translate-y-0.5 transition"
            >
              ไปแต่งกระทงคู่ <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* STEP 2: Couple Krathong Customizer */
        <div className="space-y-6">
          <KrathongCustomizer
            design={design}
            onChange={setDesign}
            isCouple={true}
            name={partner1Name}
            partnerName={partner2Name}
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> แก้ไขชื่อคู่รัก
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-xl shadow-rose-500/25 transform hover:scale-102 transition"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              จุดเทียน & ปล่อยกระทงคู่รัก 💖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
