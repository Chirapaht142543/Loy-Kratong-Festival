'use client';

import React from 'react';
import { KrathongDesign, KrathongBase, KrathongFlower, KrathongCandle } from '@/types/krathong';
import { Krathong2D } from './Krathong2D';
import { Sparkles, Heart, Flame, Leaf } from 'lucide-react';

interface KrathongCustomizerProps {
  design: KrathongDesign;
  onChange: (design: KrathongDesign) => void;
  isCouple?: boolean;
  isFamily?: boolean;
  name?: string;
  partnerName?: string;
}

export const KrathongCustomizer: React.FC<KrathongCustomizerProps> = ({
  design,
  onChange,
  isCouple = false,
  isFamily = false,
  name,
  partnerName,
}) => {
  const baseOptions: { id: KrathongBase; label: string; desc: string; icon: string }[] = [
    { id: 'banana-leaf', label: 'ใบตองมรกต', desc: 'ขนบดั้งเดิม เสริมความราบรื่น', icon: '🍃' },
    { id: 'lotus', label: 'ดอกบัวชมพู', desc: 'บริสุทธิ์ เมตตามหานิยม', icon: '🪷' },
    { id: 'bread', label: 'ขนมปังเต่าบุญ', desc: 'รักษ์สิ่งแวดล้อม ปลากินได้', icon: '🐢' },
    { id: 'coconut', label: 'กะลามะพร้าว', desc: 'ธรรมชาติ เรียบง่าย มั่นคง', icon: '🥥' },
  ];

  const flowerOptions: { id: KrathongFlower; label: string; desc: string; badge: string }[] = [
    { id: 'marigold', label: 'ดอกดาวเรือง', desc: 'เสริมโชคลาภ เงินทองอร่ามเรืองรอง', badge: '💰 เงินทอง' },
    { id: 'orchid', label: 'ดอกกล้วยไม้', desc: 'เสริมความรักมั่นคง สง่างามยั่งยืน', badge: '💜 รักแท้' },
    { id: 'rose', label: 'ดอกกุหลาบ', desc: 'เสริมเสน่ห์ดึงดูดใจ หวานฉ่ำโรแมนติก', badge: '🌹 เสน่ห์' },
    { id: 'mixed', label: 'ดอกไม้มงคลรวม', desc: 'รวมความปังทุกด้าน ครบสูตรสายมู', badge: '✨ รวมมงคล' },
  ];

  const candleOptions: { id: KrathongCandle; label: string; desc: string }[] = [
    { id: 'classic', label: 'เทียนทองส่องสว่าง', desc: 'แสงเทียนสีทองนำทางชีวิต' },
    { id: 'pink-love', label: 'เทียนคู่หัวใจสีชมพู', desc: 'เติมความหวานฉ่ำให้หัวใจ' },
    { id: 'scented', label: 'เทียนหอมดอกไม้', desc: 'กลิ่นหอมผ่อนคลายสบายใจ' },
  ];

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* 2D Live Preview Stage */}
      <div className="relative w-full h-64 sm:h-72 rounded-3xl bg-radial from-indigo-900/60 via-slate-900/80 to-slate-950 flex items-center justify-center border border-amber-500/20 shadow-2xl overflow-hidden mb-6 backdrop-blur-md">
        {/* Night Water Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute top-4 right-5 text-amber-200/50 flex items-center gap-1.5 text-xs font-light">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          ตัวอย่างกระทงของคุณ
        </div>

        {/* Render Krathong 2D with live custom styles */}
        <div className="transform hover:scale-105 transition-transform duration-300">
          <Krathong2D
            design={design}
            size={isFamily ? 170 : isCouple ? 180 : 210}
            isCouple={isCouple}
            isFamily={isFamily}
            name={name || (isFamily ? 'ครอบครัวสุขสันต์' : isCouple ? 'เรา' : 'ตัวเรา')}
            partnerName={partnerName || 'หวานใจ'}
          />
        </div>
      </div>

      {/* Tabs / Selectors */}
      <div className="w-full space-y-5 bg-slate-900/80 border border-slate-800 p-5 rounded-3xl backdrop-blur-md shadow-xl text-left">
        {/* 1. Base Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-2.5">
            <Leaf className="w-4 h-4 text-emerald-400" />
            1. เลือกฐานกระทง
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {baseOptions.map((opt) => {
              const isSelected = design.base === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...design, base: opt.id })}
                  className={`flex items-start gap-2.5 p-3 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl select-none">{opt.icon}</span>
                  <div>
                    <div className="font-medium text-xs sm:text-sm">{opt.label}</div>
                    <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Flower Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-2.5">
            <Heart className="w-4 h-4 text-pink-400" />
            2. เลือกดอกไม้เสริมดวง
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {flowerOptions.map((opt) => {
              const isSelected = design.flower === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...design, flower: opt.id })}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-400 text-pink-200 shadow-md ring-1 ring-pink-400/50'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs sm:text-sm">{opt.label}</span>
                    <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded text-amber-300 border border-slate-700">
                      {opt.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight mt-1">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Candle Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-amber-300 mb-2.5">
            <Flame className="w-4 h-4 text-amber-400" />
            3. เลือกเทียนและธูป
          </label>
          <div className="grid grid-cols-3 gap-2">
            {candleOptions.map((opt) => {
              const isSelected = design.candle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...design, candle: opt.id })}
                  className={`p-2.5 rounded-2xl text-center transition-all border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium text-xs truncate">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
