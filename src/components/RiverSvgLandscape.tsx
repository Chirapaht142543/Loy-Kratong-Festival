'use client';

import React from 'react';
import { MAP_WORLD_WIDTH, MAP_WORLD_HEIGHT, RIVER_WIDTH } from '@/lib/riverSpline';

interface RiverSvgLandscapeProps {
  riverPathD: string;
}

export const RiverSvgLandscape: React.FC<RiverSvgLandscapeProps> = React.memo(({ riverPathD }) => {
  return (
    <svg
      width={MAP_WORLD_WIDTH}
      height={MAP_WORLD_HEIGHT}
      viewBox={`0 0 ${MAP_WORLD_WIDTH} ${MAP_WORLD_HEIGHT}`}
      className="absolute inset-0 pointer-events-none"
    >
      <defs>
        {/* Deep Night Atmosphere Radial */}
        <radialGradient id="nightSkyGrad" cx="55%" cy="18%" r="90%">
          <stop offset="0%" stopColor="#0B1B3D" />
          <stop offset="35%" stopColor="#061229" />
          <stop offset="70%" stopColor="#020817" />
          <stop offset="100%" stopColor="#01040D" />
        </radialGradient>

        {/* The Grand River Water Gradient */}
        <linearGradient id="grandRiverWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="25%" stopColor="#0284C7" />
          <stop offset="50%" stopColor="#0369A1" />
          <stop offset="75%" stopColor="#075985" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </linearGradient>

        {/* River Shimmer Inner Gradient */}
        <linearGradient id="riverCoreShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#BAE6FD" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.3" />
        </linearGradient>

        {/* Full Moon Glow */}
        <radialGradient id="fullMoonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
          <stop offset="30%" stopColor="#FDE047" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
        </radialGradient>

        {/* Diagonal Moonlight Beam on Water */}
        <linearGradient id="moonlightBeamGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.22" />
          <stop offset="40%" stopColor="#FDE047" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
        </linearGradient>

        {/* Ocean Delta Estuary Glow */}
        <radialGradient id="oceanDeltaGlow" cx="100%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.65" />
          <stop offset="45%" stopColor="#0369A1" stopOpacity="0.35" />
          <stop offset="85%" stopColor="#0C4A6E" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#020817" stopOpacity="0" />
        </radialGradient>

        {/* Star Pattern */}
        <pattern id="starfieldPattern" width="320" height="320" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="35" r="1.5" fill="#FFFFFF" opacity="0.7" />
          <circle cx="110" cy="90" r="2.2" fill="#FEF08A" opacity="0.85" />
          <circle cx="175" cy="45" r="1.2" fill="#FFFFFF" opacity="0.6" />
          <circle cx="255" cy="120" r="1.8" fill="#FDE047" opacity="0.75" />
          <circle cx="65" cy="205" r="1.4" fill="#BAE6FD" opacity="0.65" />
          <circle cx="155" cy="245" r="2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="230" cy="210" r="1.6" fill="#FEF08A" opacity="0.7" />
          <circle cx="290" cy="285" r="1.2" fill="#FFFFFF" opacity="0.5" />
        </pattern>
      </defs>

      {/* 1. Starry Night Sky Base */}
      <rect width={MAP_WORLD_WIDTH} height={MAP_WORLD_HEIGHT} fill="url(#nightSkyGrad)" />
      <rect width={MAP_WORLD_WIDTH} height={MAP_WORLD_HEIGHT} fill="url(#starfieldPattern)" opacity="0.9" />

      {/* Celestial Cosmic Nebula Haze in Sky */}
      <ellipse cx="1200" cy="350" rx="600" ry="250" fill="#4338CA" opacity="0.08" />
      <ellipse cx="2300" cy="400" rx="700" ry="300" fill="#6366F1" opacity="0.09" />

      {/* Ocean Delta Estuary at Downstream Exit */}
      <rect x="2900" y="1700" width="900" height="700" fill="url(#oceanDeltaGlow)" />

      {/* 2. Moonlight Beam Streaming Down from East Sky */}
      <polygon
        points="2450,240 2150,2400 2750,2400"
        fill="url(#moonlightBeamGrad)"
        opacity="0.8"
      />

      {/* 3. Grand Full Moon (ดวงจันทร์วันเพ็ญเดือน ๑๒) */}
      <g transform="translate(2450, 240)">
        <circle cx="0" cy="0" r="290" fill="url(#fullMoonGlow)" opacity="0.35" />
        <circle cx="0" cy="0" r="155" fill="url(#fullMoonGlow)" opacity="0.75" />
        <circle cx="0" cy="0" r="88" fill="#FEF08A" />
        {/* Realistic Craters */}
        <circle cx="-28" cy="-22" r="18" fill="#FDE047" opacity="0.4" />
        <circle cx="22" cy="32" r="24" fill="#FDE047" opacity="0.35" />
        <circle cx="-12" cy="38" r="14" fill="#FBBF24" opacity="0.3" />
        <circle cx="38" cy="-16" r="16" fill="#FDE047" opacity="0.3" />
        <circle cx="5" cy="-5" r="10" fill="#FBBF24" opacity="0.25" />
      </g>

      {/* 4. Floating Sky Lanterns (โคมลอยยี่เป็ง) Drifting Up */}
      {[
        { cx: 380, cy: 260, r: 8, delay: '0s' },
        { cx: 580, cy: 190, r: 6.5, delay: '1.2s' },
        { cx: 820, cy: 310, r: 9.5, delay: '2.5s' },
        { cx: 1150, cy: 210, r: 7.5, delay: '0.8s' },
        { cx: 1480, cy: 270, r: 10, delay: '3.1s' },
        { cx: 1780, cy: 190, r: 8.5, delay: '1.7s' },
        { cx: 2150, cy: 340, r: 11, delay: '2.2s' },
        { cx: 2520, cy: 200, r: 9, delay: '0.5s' },
        { cx: 2850, cy: 280, r: 7.5, delay: '2.8s' },
        { cx: 3180, cy: 350, r: 8.5, delay: '1.4s' },
        { cx: 1600, cy: 140, r: 6, delay: '3.6s' },
        { cx: 2700, cy: 150, r: 7, delay: '2.1s' },
      ].map((lantern, idx) => (
        <g key={idx} className="animate-sky-lantern" style={{ animationDelay: lantern.delay }}>
          <circle cx={lantern.cx} cy={lantern.cy} r={lantern.r * 3} fill="#F59E0B" opacity="0.3" />
          <rect
            x={lantern.cx - lantern.r}
            y={lantern.cy - lantern.r * 1.45}
            width={lantern.r * 2}
            height={lantern.r * 2.9}
            rx={lantern.r * 0.45}
            fill="#FEF08A"
          />
          <circle cx={lantern.cx} cy={lantern.cy + lantern.r * 1.15} r={lantern.r * 0.45} fill="#EF4444" />
        </g>
      ))}

      {/* ========================================================= */}
      {/* 5. THE SINGLE GRAND RIVER (สายธารแม่น้ำสายหลัก)            */}
      {/* ========================================================= */}

      {/* Layer 1: Lush Night Earth & Outer Shore Margin */}
      <path
        d={riverPathD}
        stroke="#021C2B"
        strokeWidth={RIVER_WIDTH + 140}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Layer 2: River Bank Stone & Flora Grass Contours */}
      <path
        d={riverPathD}
        stroke="#063E5A"
        strokeWidth={RIVER_WIDTH + 70}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Layer 3: Main River Deep Water Channel */}
      <path
        d={riverPathD}
        stroke="url(#grandRiverWaterGrad)"
        strokeWidth={RIVER_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Layer 4: Shimmering Radiant Water Center */}
      <path
        d={riverPathD}
        stroke="url(#riverCoreShimmer)"
        strokeWidth={RIVER_WIDTH - 80}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="animate-river-glow"
      />

      {/* Layer 5: Flowing Water Current Streams */}
      <path
        d={riverPathD}
        stroke="#38BDF8"
        strokeWidth="8.5"
        strokeDasharray="45 85"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
        className="animate-river-current"
      />
      <path
        d={riverPathD}
        stroke="#BAE6FD"
        strokeWidth="5"
        strokeDasharray="28 65"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
        className="animate-river-current-fast"
      />
      <path
        d={riverPathD}
        stroke="#7DD3FC"
        strokeWidth="3.2"
        strokeDasharray="18 50"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        className="animate-river-current-slow"
      />

      {/* Golden Candlelight Reflection Streaks along River */}
      <path
        d={riverPathD}
        stroke="#FEF08A"
        strokeWidth="26"
        strokeDasharray="10 70"
        strokeLinecap="round"
        fill="none"
        opacity="0.32"
        className="animate-pulse"
      />

      {/* ========================================================= */}
      {/* 6. LANDMARKS & THAI RIVERSIDE FESTIVAL DETAILS           */}
      {/* ========================================================= */}

      {/* LANDMARK 1: สะพานพระราม ๘ (Rama VIII Bridge) */}
      <g id="landmark-rama8">
        <line x1="720" y1="580" x2="1000" y2="270" stroke="#0F172A" strokeWidth="24" strokeLinecap="round" />
        <line x1="720" y1="580" x2="1000" y2="270" stroke="#F59E0B" strokeWidth="14" strokeLinecap="round" />
        {[0.18, 0.32, 0.46, 0.6, 0.74, 0.88].map((ratio, idx) => (
          <circle
            key={idx}
            cx={720 + (1000 - 720) * ratio}
            cy={580 + (270 - 580) * ratio}
            r="3.5"
            fill="#FEF08A"
          />
        ))}
        <line x1="760" y1="540" x2="760" y2="330" stroke="#FBBF24" strokeWidth="20" strokeLinecap="round" />
        <polygon points="748,330 772,330 760,280" fill="#F59E0B" />
        <circle cx="760" cy="280" r="5" fill="#EF4444" className="animate-ping" />
        {[340, 370, 400, 430, 460, 490].map((py, idx) => (
          <line
            key={idx}
            x1="760"
            y1={py}
            x2={810 + idx * 30}
            y2={480 - idx * 34}
            stroke="#FEF08A"
            strokeWidth="2.2"
            opacity="0.85"
          />
        ))}
      </g>

      {/* LANDMARK 2: พระปรางค์วัดอรุณราชวราราม (Wat Arun) */}
      <g id="landmark-watarun" transform="translate(1040, 810)">
        <circle cx="80" cy="90" r="110" fill="#F59E0B" opacity="0.22" />
        <polygon points="20,130 140,130 130,115 30,115" fill="#B45309" />
        <polygon points="30,115 130,115 120,98 40,98" fill="#D97706" />
        <polygon points="25,75 15,115 35,115" fill="#FBBF24" />
        <polygon points="135,75 125,115 145,115" fill="#FBBF24" />
        <polygon points="45,85 38,110 52,110" fill="#F59E0B" />
        <polygon points="115,85 108,110 122,110" fill="#F59E0B" />
        <polygon points="80,10 55,80 105,80" fill="#FBBF24" />
        <polygon points="80,28 50,98 110,98" fill="#D97706" />
        <polygon points="80,48 40,120 120,120" fill="#B45309" />
        <line x1="80" y1="0" x2="80" y2="18" stroke="#FEF08A" strokeWidth="3.5" />
        <circle cx="80" cy="0" r="4" fill="#FFF" />
        <rect x="35" y="128" width="90" height="12" fill="#78350F" rx="3" />
        <polygon points="25,128 80,112 135,128" fill="#DC2626" />
        <polygon points="32,114 80,102 128,114" fill="#FBBF24" />
      </g>

      {/* LANDMARK 3: ไอคอนวอเตอร์ฟร้อนท์ (Icon Waterfront Promenade & Fountains) */}
      <g id="landmark-icon" transform="translate(1810, 1320)">
        <rect x="0" y="20" width="180" height="38" rx="12" fill="#0F172A" stroke="#0284C7" strokeWidth="3.5" />
        <line x1="12" y1="28" x2="168" y2="28" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="8 8" />
        <rect x="25" y="-55" width="34" height="75" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" rx="4" />
        <rect x="68" y="-85" width="42" height="105" fill="#0F172A" stroke="#06B6D4" strokeWidth="2" rx="5" />
        <rect x="118" y="-45" width="32" height="65" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.8" rx="4" />
        <circle cx="20" cy="15" r="10" fill="#059669" />
        <circle cx="160" cy="15" r="10" fill="#059669" />
        <path d="M 45 18 Q 50 -10 55 18" stroke="#EC4899" strokeWidth="3.5" fill="none" className="animate-pulse" />
        <path d="M 88 18 Q 94 -22 100 18" stroke="#38BDF8" strokeWidth="4" fill="none" className="animate-pulse" />
        <path d="M 132 18 Q 137 -10 142 18" stroke="#A855F7" strokeWidth="3.5" fill="none" className="animate-pulse" />
      </g>

      {/* LANDMARK 4: ชิงช้าสวรรค์ราตรี (Asiatique Giant Ferris Wheel) */}
      <g id="landmark-asiatique" transform="translate(2750, 1070)">
        <circle cx="85" cy="85" r="115" fill="#EC4899" opacity="0.18" />
        <g className="animate-ferris-wheel" style={{ transformOrigin: '85px 85px' }}>
          <circle cx="85" cy="85" r="75" stroke="#F472B6" strokeWidth="5.5" fill="none" opacity="0.95" />
          <circle cx="85" cy="85" r="50" stroke="#F472B6" strokeWidth="3" fill="none" opacity="0.7" />
          {/* 12 Spokes with pre-rounded coordinates */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x2 = Math.round((85 + Math.cos(rad) * 75) * 100) / 100;
            const y2 = Math.round((85 + Math.sin(rad) * 75) * 100) / 100;
            return (
              <line
                key={deg}
                x1="85"
                y1="85"
                x2={x2}
                y2={y2}
                stroke="#F472B6"
                strokeWidth="2.2"
              />
            );
          })}
          {/* Gondolas with pre-rounded coordinates */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const cx = Math.round((85 + Math.cos(rad) * 75) * 100) / 100;
            const cy = Math.round((85 + Math.sin(rad) * 75) * 100) / 100;
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r="6.5"
                fill="#FDF2F8"
                stroke="#DB2777"
                strokeWidth="2"
              />
            );
          })}
        </g>
        <line x1="85" y1="85" x2="48" y2="185" stroke="#BE185D" strokeWidth="8" strokeLinecap="round" />
        <line x1="85" y1="85" x2="122" y2="185" stroke="#BE185D" strokeWidth="8" strokeLinecap="round" />
        <circle cx="85" cy="85" r="11" fill="#FDF2F8" />
      </g>

      {/* LANDMARK 5: ตลาดคลองโบราณ (Ancient Canal Market & Thai Stilt Houses) */}
      <g id="landmark-canal" transform="translate(2930, 1870)">
        <rect x="0" y="30" width="105" height="45" fill="#451A03" rx="5" />
        <polygon points="-12,30 52,8 116,30" fill="#78350F" />
        <rect x="18" y="44" width="16" height="18" fill="#FDE047" rx="3" />
        <rect x="70" y="44" width="16" height="18" fill="#FDE047" rx="3" />
        <circle cx="10" cy="36" r="6" fill="#EF4444" />
        <circle cx="95" cy="36" r="6" fill="#EF4444" />
        <path d="M 40 90 Q 80 105 120 90 Q 80 94 40 90" fill="#92400E" stroke="#78350F" strokeWidth="2.5" />
        <circle cx="80" cy="88" r="4.5" fill="#FEF08A" />
      </g>

      {/* 7. Shoreline Lotus Pads & Blossoms (บัวหลวงริมน้ำ) */}
      {[
        { cx: 620, cy: 390, r: 20 },
        { cx: 665, cy: 405, r: 16 },
        { cx: 1350, cy: 750, r: 18 },
        { cx: 1395, cy: 765, r: 22 },
        { cx: 1770, cy: 1180, r: 20 },
        { cx: 2370, cy: 1240, r: 24 },
        { cx: 2510, cy: 1380, r: 18 },
        { cx: 3210, cy: 1880, r: 22 },
      ].map((lily, idx) => (
        <g key={idx}>
          <circle cx={lily.cx} cy={lily.cy} r={lily.r} fill="#065F46" opacity="0.85" />
          <path
            d={`M ${lily.cx} ${lily.cy} L ${lily.cx + lily.r} ${lily.cy - 3}`}
            stroke="#022C22"
            strokeWidth="2.5"
          />
          <circle cx={lily.cx + 6} cy={lily.cy - 6} r="7" fill="#F472B6" />
          <circle cx={lily.cx + 6} cy={lily.cy - 6} r="3" fill="#FEF08A" />
        </g>
      ))}

      {/* 8. Glowing Fireflies (หิ่งห้อยระยิบระยับริมฝั่งน้ำ) */}
      {[
        { cx: 520, cy: 340, delay: '0.2s' },
        { cx: 640, cy: 420, delay: '1.4s' },
        { cx: 960, cy: 560, delay: '2.1s' },
        { cx: 1120, cy: 680, delay: '0.7s' },
        { cx: 1380, cy: 670, delay: '1.9s' },
        { cx: 1680, cy: 920, delay: '0.4s' },
        { cx: 1950, cy: 1040, delay: '2.8s' },
        { cx: 2220, cy: 1260, delay: '1.1s' },
        { cx: 2480, cy: 1180, delay: '2.4s' },
        { cx: 2850, cy: 1520, delay: '0.9s' },
        { cx: 3020, cy: 1680, delay: '1.6s' },
      ].map((fly, idx) => (
        <g key={idx} className="animate-firefly" style={{ animationDelay: fly.delay }}>
          <circle cx={fly.cx} cy={fly.cy} r="8" fill="#FDE047" opacity="0.3" />
          <circle cx={fly.cx} cy={fly.cy} r="3" fill="#A7F3D0" />
        </g>
      ))}
    </svg>
  );
});

RiverSvgLandscape.displayName = 'RiverSvgLandscape';
