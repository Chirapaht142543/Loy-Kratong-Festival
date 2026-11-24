'use client';

import React from 'react';
import { KrathongDesign } from '@/types/krathong';

interface Krathong2DProps {
  design: KrathongDesign;
  size?: number;
  className?: string;
  isLit?: boolean;
  isCouple?: boolean;
  isFamily?: boolean;
  familyCount?: number;
  familyMembers?: any[];
  showRipple?: boolean;
  name?: string;
  partnerName?: string;
}

export const Krathong2D: React.FC<Krathong2DProps> = ({
  design,
  size = 200,
  className = '',
  isLit = true,
  isCouple = false,
  isFamily = false,
  familyCount,
  familyMembers,
  showRipple = true,
  name,
  partnerName,
}) => {
  // If Family mode, render a warm majestic family raft of krathongs
  if (isFamily) {
    let humans = 0;
    let pets = 0;
    if (Array.isArray(familyMembers) && familyMembers.length > 0) {
      familyMembers.forEach((m: any) => {
        if (
          typeof m === 'object' &&
          m !== null &&
          (m.isPet ||
            (m.role &&
              (m.role.includes('น้องหมา') ||
                m.role.includes('น้องแมว') ||
                m.role.includes('สัตว์เลี้ยง') ||
                m.role.includes('กระต่าย') ||
                m.role.includes('แฮมสเตอร์'))))
        ) {
          pets++;
        } else {
          humans++;
        }
      });
    }

    const memberCount = familyCount || (familyMembers && familyMembers.length) || (humans + pets) || 3;
    const badgeText =
      pets > 0
        ? humans > 0
          ? `${humans} คน + 🐾 ${pets}`
          : `🐾 ${pets} ตัว`
        : `${memberCount} คน`;

    return (
      <div className={`relative flex flex-col items-center justify-center ${className}`}>
        {showRipple && (
          <div className="absolute inset-0 -bottom-6 flex items-center justify-center pointer-events-none">
            <div className="w-[210%] h-20 rounded-full bg-amber-400/15 blur-lg animate-pulse" />
            <div className="absolute w-[160%] h-14 rounded-full border border-amber-300/40 animate-ping opacity-40 duration-1000" />
            <div className="absolute w-[120%] h-10 rounded-full bg-cyan-400/15 blur-md" />
          </div>
        )}

        <div className="relative flex items-center justify-center">
          {/* Left Companion Krathong */}
          <div className="relative -mr-8 sm:-mr-10 z-10 transform -rotate-6 scale-75 opacity-90 transition-transform">
            <SingleKrathongSVG
              design={{
                ...design,
                flower: 'marigold',
              }}
              size={size * 0.7}
              isLit={isLit}
            />
          </div>

          {/* Central Main Family Krathong */}
          <div className="relative z-20 transform scale-100 transition-transform">
            <SingleKrathongSVG design={design} size={size * 0.9} isLit={isLit} />
          </div>

          {/* Golden Sacred Thread linking family krathongs */}
          <div className="absolute z-25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full flex items-center justify-center">
            <svg width={size * 1.3} height="30" viewBox="0 0 200 30" fill="none">
              <path
                d="M10 20 Q 55 5, 100 20 T 190 20"
                stroke="#FBBF24"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
              <path
                d="M10 20 Q 55 5, 100 20 T 190 20"
                stroke="#FDE68A"
                strokeWidth="1.2"
              />
              <circle cx="100" cy="20" r="3.5" fill="#F59E0B" />
            </svg>
          </div>

          {/* Right Companion Krathong */}
          <div className="relative -ml-8 sm:-ml-10 z-10 transform rotate-6 scale-75 opacity-90 transition-transform">
            <SingleKrathongSVG
              design={{
                ...design,
                flower: 'orchid',
              }}
              size={size * 0.7}
              isLit={isLit}
            />
          </div>
        </div>

        {/* Family Name & Member Count Badge */}
        {name && (
          <div className="mt-1 relative z-30 flex items-center gap-1.5 bg-gradient-to-r from-amber-950/95 via-yellow-950/95 to-amber-950/95 backdrop-blur-md text-amber-200 text-xs px-3 py-0.5 rounded-full shadow-xl border border-amber-500/50 font-bold whitespace-nowrap">
            <span>🏡</span>
            <span>{name}</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {badgeText}
            </span>
          </div>
        )}
      </div>
    );
  }

  // If couple mode, render dual krathongs side by side with binding thread
  if (isCouple) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        {showRipple && (
          <div className="absolute inset-0 -bottom-4 flex items-center justify-center pointer-events-none">
            <div className="w-[180%] h-16 rounded-full bg-cyan-400/10 blur-md animate-pulse" />
            <div className="absolute w-[140%] h-10 rounded-full border border-cyan-300/30 animate-ping opacity-40 duration-1000" />
          </div>
        )}

        {/* First Krathong */}
        <div className="relative -mr-6 z-10 transform -rotate-3 scale-95 transition-transform">
          <SingleKrathongSVG design={design} size={size * 0.8} isLit={isLit} />
          {name && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-900/80 backdrop-blur-xs text-amber-200 text-xs px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-amber-500/40 font-medium">
              {name}
            </div>
          )}
        </div>

        {/* Sacred Pink/Gold Ribbon connecting them */}
        <div className="relative z-30 flex flex-col items-center justify-center -mx-2 pointer-events-none">
          <svg width="40" height="24" viewBox="0 0 40 24" fill="none">
            <path
              d="M2 12C12 4 28 20 38 12"
              stroke="#F472B6"
              strokeWidth="3"
              strokeDasharray="2 2"
            />
            <path
              d="M2 12C12 4 28 20 38 12"
              stroke="#FDE047"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="12" r="4" fill="#EC4899" />
            <path
              d="M17 10C17 8 20 8 20 10C20 8 23 8 23 10C23 13 20 15 20 15C20 15 17 13 17 10Z"
              fill="#FFF"
            />
          </svg>
        </div>

        {/* Second Krathong */}
        <div className="relative -ml-6 z-20 transform rotate-3 scale-95 transition-transform">
          <SingleKrathongSVG 
            design={{
              ...design,
              candle: 'pink-love'
            }} 
            size={size * 0.8} 
            isLit={isLit} 
          />
          {partnerName && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-pink-900/80 backdrop-blur-xs text-pink-200 text-xs px-2 py-0.5 rounded-full whitespace-nowrap shadow-md border border-pink-500/40 font-medium">
              {partnerName}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex flex-col items-center justify-center ${className}`}>
      {showRipple && (
        <div className="absolute -bottom-4 inset-x-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-12 rounded-full bg-cyan-400/15 blur-sm animate-pulse" />
          <div className="absolute w-[120%] h-8 rounded-full border border-cyan-300/40 animate-ping opacity-30" />
        </div>
      )}

      <SingleKrathongSVG design={design} size={size} isLit={isLit} />

      {name && (
        <div className="mt-1 bg-amber-950/80 backdrop-blur-xs text-amber-200 text-xs px-3 py-0.5 rounded-full shadow-lg border border-amber-500/40 font-medium tracking-wide">
          {name}
        </div>
      )}
    </div>
  );
};

// Single 2D Krathong Component
const SingleKrathongSVG: React.FC<{
  design: KrathongDesign;
  size: number;
  isLit: boolean;
}> = ({ design, size, isLit }) => {
  const { base, flower, candle } = design;

  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 240 204"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="filter drop-shadow-xl overflow-visible select-none"
    >
      <defs>
        {/* Glow Filters */}
        <filter id="candleGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#FEF08A" />
          <stop offset="70%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>

        <linearGradient id="bananaLeafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
        <linearGradient id="bananaLeafGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        <linearGradient id="lotusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="70%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>

        <linearGradient id="breadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="coconutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A16207" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>

      {/* 1. Base Shadow on Water */}
      <ellipse cx="120" cy="180" rx="90" ry="16" fill="#030712" fillOpacity="0.4" />

      {/* 2. BASE LAYER */}
      {base === 'banana-leaf' && <BananaLeafBase />}
      {base === 'lotus' && <LotusBase />}
      {base === 'bread' && <BreadBase />}
      {base === 'coconut' && <CoconutBase />}

      {/* 3. FLOWER LAYER */}
      {flower === 'marigold' && <MarigoldFlowers />}
      {flower === 'orchid' && <OrchidFlowers />}
      {flower === 'rose' && <RoseFlowers />}
      {flower === 'mixed' && <MixedFlowers />}

      {/* 4. INCENSE & CANDLE LAYER */}
      <IncenseSticks isLit={isLit} />
      <CandleModel type={candle} isLit={isLit} />
    </svg>
  );
};

// --- BASE COMPONENTS ---

const BananaLeafBase = () => (
  <g id="base-banana">
    {/* Outer Folded Petals */}
    {[
      { d: 'M40 145 C20 120 45 105 70 125 Z', fill: '#166534' },
      { d: 'M70 135 C50 100 85 90 105 115 Z', fill: '#15803D' },
      { d: 'M170 135 C190 100 155 90 135 115 Z', fill: '#15803D' },
      { d: 'M200 145 C220 120 195 105 170 125 Z', fill: '#166534' },
      { d: 'M100 125 C90 90 130 85 140 125 Z', fill: '#22C55E' },
    ].map((p, i) => (
      <path key={i} d={p.d} fill={p.fill} stroke="#14532D" strokeWidth="1.5" />
    ))}

    {/* Main Circular Banana Trunk Disc */}
    <ellipse cx="120" cy="155" rx="80" ry="24" fill="url(#bananaLeafGrad2)" stroke="#166534" strokeWidth="2" />
    <ellipse cx="120" cy="153" rx="74" ry="20" fill="url(#bananaLeafGrad1)" />

    {/* Inner Leaf Petal Trim */}
    <path
      d="M50 150 Q60 138 75 148 Q90 136 105 147 Q120 135 135 147 Q150 136 165 148 Q180 138 190 150"
      stroke="#86EFAC"
      strokeWidth="2.5"
      fill="none"
    />
  </g>
);

const LotusBase = () => (
  <g id="base-lotus">
    {/* Outer Pink Lotus Petals */}
    <path d="M40 155 C20 115 65 110 80 135 Z" fill="#9D174D" />
    <path d="M200 155 C220 115 175 110 160 135 Z" fill="#9D174D" />
    <path d="M65 145 C45 100 100 95 105 125 Z" fill="#BE185D" />
    <path d="M175 145 C195 100 140 95 135 125 Z" fill="#BE185D" />
    <path d="M95 135 C90 85 150 85 145 135 Z" fill="url(#lotusGrad)" />

    {/* Lotus Bed */}
    <ellipse cx="120" cy="155" rx="82" ry="25" fill="#DB2777" stroke="#F472B6" strokeWidth="1.5" />
    <ellipse cx="120" cy="153" rx="74" ry="20" fill="#F472B6" />
    <ellipse cx="120" cy="152" rx="66" ry="16" fill="#FDF2F8" />
  </g>
);

const BreadBase = () => (
  <g id="base-bread">
    {/* Bread Turtle / Bun Shape */}
    <ellipse cx="120" cy="155" rx="82" ry="26" fill="url(#breadGrad)" stroke="#78350F" strokeWidth="2" />
    {/* Little Bread Buns / Turtle Flippers around */}
    <circle cx="50" cy="160" r="14" fill="#B45309" stroke="#78350F" strokeWidth="1" />
    <circle cx="190" cy="160" r="14" fill="#B45309" stroke="#78350F" strokeWidth="1" />
    <circle cx="65" cy="140" r="12" fill="#D97706" />
    <circle cx="175" cy="140" r="12" fill="#D97706" />
    {/* Center Bread Top */}
    <ellipse cx="120" cy="152" rx="68" ry="18" fill="#FDE047" fillOpacity="0.85" />
    {/* Sesame seeds */}
    <circle cx="100" cy="150" r="1.5" fill="#78350F" />
    <circle cx="125" cy="148" r="1.5" fill="#78350F" />
    <circle cx="140" cy="152" r="1.5" fill="#78350F" />
    <circle cx="115" cy="155" r="1.5" fill="#78350F" />
  </g>
);

const CoconutBase = () => (
  <g id="base-coconut">
    {/* Coconut Shell Bowl */}
    <path
      d="M45 150 C45 185 195 185 195 150 C180 135 60 135 45 150 Z"
      fill="url(#coconutGrad)"
      stroke="#291404"
      strokeWidth="2.5"
    />
    <ellipse cx="120" cy="148" rx="74" ry="18" fill="#FEF3C7" stroke="#92400E" strokeWidth="2" />
    <ellipse cx="120" cy="148" rx="68" ry="14" fill="#451A03" />
  </g>
);

// --- FLOWER COMPONENTS ---

const MarigoldFlowers = () => (
  <g id="flowers-marigold">
    {/* Ruffled Golden Marigold Heads */}
    <FlowerHead cx={85} cy={140} color="#F59E0B" innerColor="#FBBF24" />
    <FlowerHead cx={155} cy={140} color="#F59E0B" innerColor="#FBBF24" />
    <FlowerHead cx={120} cy={145} color="#D97706" innerColor="#FDE047" r={16} />
    <FlowerHead cx={65} cy={148} color="#D97706" innerColor="#F59E0B" r={12} />
    <FlowerHead cx={175} cy={148} color="#D97706" innerColor="#F59E0B" r={12} />
    <FlowerHead cx={100} cy={135} color="#FBBF24" innerColor="#FFFBEB" r={13} />
    <FlowerHead cx={140} cy={135} color="#FBBF24" innerColor="#FFFBEB" r={13} />
  </g>
);

const OrchidFlowers = () => (
  <g id="flowers-orchid">
    <OrchidPetal cx={80} cy={138} />
    <OrchidPetal cx={160} cy={138} />
    <OrchidPetal cx={120} cy={142} isCenter />
    <OrchidPetal cx={60} cy={146} scale={0.8} />
    <OrchidPetal cx={180} cy={146} scale={0.8} />
    <OrchidPetal cx={100} cy={134} scale={0.9} />
    <OrchidPetal cx={140} cy={134} scale={0.9} />
  </g>
);

const RoseFlowers = () => (
  <g id="flowers-rose">
    <RoseHead cx={120} cy={142} r={17} color="#E11D48" />
    <RoseHead cx={85} cy={138} r={14} color="#BE123C" />
    <RoseHead cx={155} cy={138} r={14} color="#BE123C" />
    <RoseHead cx={60} cy={146} r={12} color="#F43F5E" />
    <RoseHead cx={180} cy={146} r={12} color="#F43F5E" />
    <RoseHead cx={102} cy={135} r={13} color="#FB7185" />
    <RoseHead cx={138} cy={135} r={13} color="#FB7185" />
  </g>
);

const MixedFlowers = () => (
  <g id="flowers-mixed">
    {/* Blend of yellow, pink, and purple flowers */}
    <FlowerHead cx={120} cy={142} color="#F59E0B" innerColor="#FEF08A" r={16} />
    <RoseHead cx={85} cy={138} r={14} color="#E11D48" />
    <OrchidPetal cx={155} cy={138} />
    <FlowerHead cx={60} cy={146} color="#EC4899" innerColor="#FDF2F8" r={12} />
    <FlowerHead cx={180} cy={146} color="#EAB308" innerColor="#FEF9C3" r={12} />
    <RoseHead cx={102} cy={135} r={12} color="#FB7185" />
    <FlowerHead cx={140} cy={135} color="#A855F7" innerColor="#F3E8FF" r={12} />
  </g>
);

// Flower Helper Shapes
const FlowerHead: React.FC<{ cx: number; cy: number; color: string; innerColor: string; r?: number }> = ({
  cx,
  cy,
  color,
  innerColor,
  r = 14,
}) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={color} />
    <circle cx={cx} cy={cy} r={r * 0.7} fill={innerColor} />
    <circle cx={cx} cy={cy} r={r * 0.35} fill={color} />
  </g>
);

const RoseHead: React.FC<{ cx: number; cy: number; r: number; color: string }> = ({ cx, cy, r, color }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={color} />
    <path
      d={`M${cx - r * 0.5} ${cy} A${r * 0.5} ${r * 0.5} 0 0 1 ${cx + r * 0.5} ${cy}`}
      stroke="#FFE4E6"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx={cx} cy={cy} r={r * 0.3} fill="#881337" />
  </g>
);

const OrchidPetal: React.FC<{ cx: number; cy: number; scale?: number; isCenter?: boolean }> = ({
  cx,
  cy,
  scale = 1,
  isCenter = false,
}) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    <path d="M-8 -6 C-12 -12 0 -16 0 -10 C0 -16 12 -12 8 -6 C14 0 6 8 0 6 C-6 8 -14 0 -8 -6 Z" fill="#A855F7" />
    <circle cx="0" cy="0" r={isCenter ? 4 : 3} fill="#FAF5FF" stroke="#7E22CE" strokeWidth="1" />
  </g>
);

// --- INCENSE & CANDLE COMPONENTS ---

const IncenseSticks: React.FC<{ isLit: boolean }> = ({ isLit }) => (
  <g id="incense">
    {/* 3 Traditional Incense Sticks */}
    <line x1="108" y1="130" x2="98" y2="70" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="113" y1="128" x2="108" y2="60" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="117" y1="130" x2="116" y2="65" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />

    {isLit && (
      <>
        {/* Burning Embers */}
        <circle cx="98" cy="70" r="1.8" fill="#EF4444" className="animate-pulse" />
        <circle cx="108" cy="60" r="1.8" fill="#F97316" className="animate-pulse" />
        <circle cx="116" cy="65" r="1.8" fill="#EF4444" className="animate-pulse" />

        {/* Soft Smoke Wisps */}
        <path
          d="M98 68 Q92 50 96 35 T102 15"
          stroke="#E2E8F0"
          strokeWidth="1.2"
          fill="none"
          opacity="0.4"
          className="animate-pulse"
        />
        <path
          d="M108 58 Q114 42 110 28 T118 10"
          stroke="#E2E8F0"
          strokeWidth="1.2"
          fill="none"
          opacity="0.5"
          className="animate-pulse"
        />
      </>
    )}
  </g>
);

const CandleModel: React.FC<{ type: KrathongDesign['candle']; isLit: boolean }> = ({ type, isLit }) => {
  return (
    <g id="candle">
      {type === 'classic' && (
        <>
          {/* Gold Yellow Candle */}
          <rect x="122" y="75" width="12" height="50" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <line x1="128" y1="75" x2="128" y2="68" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
          {isLit && <FlickeringFlame cx={128} cy={56} />}
        </>
      )}

      {type === 'pink-love' && (
        <>
          {/* Dual Heart / Pink Love Candle */}
          <rect x="119" y="80" width="10" height="45" rx="3" fill="#EC4899" stroke="#9D174D" strokeWidth="1" />
          <rect x="131" y="84" width="9" height="41" rx="3" fill="#F472B6" stroke="#9D174D" strokeWidth="1" />
          <line x1="124" y1="80" x2="124" y2="72" stroke="#451A03" strokeWidth="1.8" />
          <line x1="135" y1="84" x2="135" y2="76" stroke="#451A03" strokeWidth="1.8" />
          {isLit && (
            <>
              <FlickeringFlame cx={124} cy={60} scale={0.85} />
              <FlickeringFlame cx={135} cy={64} scale={0.75} />
            </>
          )}
        </>
      )}

      {type === 'scented' && (
        <>
          {/* Ivory White Scented Candle */}
          <rect x="121" y="82" width="14" height="42" rx="4" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <line x1="128" y1="82" x2="128" y2="74" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
          {isLit && <FlickeringFlame cx={128} cy={62} />}
        </>
      )}
    </g>
  );
};

// Flickering Flame with SVG animation & glow
const FlickeringFlame: React.FC<{ cx: number; cy: number; scale?: number }> = ({ cx, cy, scale = 1 }) => {
  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
      {/* Outer Halo Glow */}
      <circle cx="0" cy="0" r="22" fill="#F59E0B" fillOpacity="0.25" filter="url(#candleGlow)" />
      <circle cx="0" cy="0" r="14" fill="#FDE047" fillOpacity="0.35" />

      {/* Main Dancing Flame */}
      <path
        d="M0 -18 C6 -10 8 -2 5 4 C2 8 -2 8 -5 4 C-8 -2 -6 -10 0 -18 Z"
        fill="url(#flameGrad)"
        filter="url(#candleGlow)"
        className="animate-pulse"
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1 1; 1.08 0.95; 0.95 1.05; 1 1"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>

      {/* Inner White Flame Core */}
      <ellipse cx="0" cy="2" rx="2.5" ry="5" fill="#FFFFFF" />
    </g>
  );
};
