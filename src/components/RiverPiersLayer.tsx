'use client';

import React from 'react';
import { FESTIVAL_PIERS, PierLocation } from '@/types/map';
import { Sparkles } from 'lucide-react';

interface RiverPiersLayerProps {
  activePierId?: string | null;
  onFlyToPier: (pier: PierLocation) => void;
}

export const RiverPiersLayer: React.FC<RiverPiersLayerProps> = React.memo(
  ({ activePierId, onFlyToPier }) => {
    return (
      <div className="absolute inset-0 pointer-events-auto">
        {FESTIVAL_PIERS.map((pier) => {
          const isSelected = activePierId === pier.id;
          return (
            <div
              key={pier.id}
              onClick={(e) => {
                e.stopPropagation();
                onFlyToPier(pier);
              }}
              style={{
                left: `${pier.x}px`,
                top: `${pier.y}px`,
              }}
              className="interactive-el absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
            >
              {/* Pier Dock Beacon Ring */}
              <div className="absolute inset-0 -m-6 rounded-full bg-amber-400/35 animate-ping opacity-70" />

              {/* Pier Badge Pill */}
              <div
                className={`relative flex items-center gap-2.5 px-4 py-2 rounded-full shadow-2xl transition transform group-hover:scale-110 border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold ring-4 ring-amber-400/40 border-amber-300 scale-110'
                    : 'bg-slate-900/95 text-slate-100 border-amber-500/50 hover:border-amber-300'
                }`}
              >
                <span className="text-xl select-none">{pier.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">{pier.shortName}</div>
                  <div
                    className={`text-[10px] leading-tight font-semibold ${
                      isSelected ? 'text-slate-900' : 'text-amber-300'
                    }`}
                  >
                    {pier.krathongCount} ใบในสายน้ำ
                  </div>
                </div>
                <Sparkles
                  className={`w-3.5 h-3.5 animate-spin ${
                    isSelected ? 'text-slate-900' : 'text-amber-300'
                  }`}
                  style={{ animationDuration: '6s' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

RiverPiersLayer.displayName = 'RiverPiersLayer';
