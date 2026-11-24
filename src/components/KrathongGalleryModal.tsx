'use client';

import React, { useState } from 'react';
import { RiverKrathongItem } from './MainRiverView';
import { Krathong2D } from './Krathong2D';
import {
  X,
  Search,
  Heart,
  Sparkles,
  ExternalLink,
  Flame,
  User,
  Filter,
} from 'lucide-react';

interface KrathongGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  krathongs: RiverKrathongItem[];
  myKrathongId?: string | null;
  onSelectKrathong: (krathong: RiverKrathongItem) => void;
  onLikeKrathong: (id: string) => void;
}

export const KrathongGalleryModal: React.FC<KrathongGalleryModalProps> = ({
  isOpen,
  onClose,
  krathongs,
  myKrathongId,
  onSelectKrathong,
  onLikeKrathong,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'single' | 'couple' | 'family' | 'mine' | 'matched'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter items
  const filteredKrathongs = krathongs.filter((k) => {
    let matchesFilter = true;
    if (filterMode === 'single') matchesFilter = k.mode === 'single';
    else if (filterMode === 'couple') matchesFilter = k.mode === 'couple';
    else if (filterMode === 'family') matchesFilter = k.mode === 'family';
    else if (filterMode === 'mine') matchesFilter = myKrathongId ? k.id === myKrathongId : false;
    else if (filterMode === 'matched') matchesFilter = !!k.isMatchedWithMe;

    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (k.partnerName && k.partnerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (k.familyName && k.familyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      k.wish.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-fade-in select-none">
      <div className="relative w-full max-w-4xl h-[88vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header & Close */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📜</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-amber-200 leading-tight">
                สมุดส่องกระทงและคำอธิษฐาน
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                อ่านคำขอพร ส่งหัวใจ และเปิดดูวาร์ปของเพื่อนๆ ในสายน้ำทั้งหมด ({krathongs.length} ใบ)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="py-3 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเล่น หรือ คำอธิษฐาน..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap bg-slate-800/80 p-1 rounded-2xl border border-slate-700 shrink-0 w-full sm:w-auto gap-1">
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === 'all'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทั้งหมด ({krathongs.length})
            </button>
            <button
              onClick={() => setFilterMode('single')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === 'single'
                  ? 'bg-pink-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💖 คนโสด
            </button>
            <button
              onClick={() => setFilterMode('couple')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === 'couple'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩‍❤️‍👨 มีคู่
            </button>
            <button
              onClick={() => setFilterMode('family')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterMode === 'family'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨‍👩‍👧‍👦 ครอบครัว
            </button>
            {krathongs.some((k) => k.isMatchedWithMe) && (
              <button
                onClick={() => setFilterMode('matched')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  filterMode === 'matched'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md ring-2 ring-pink-400/50'
                    : 'bg-pink-500/20 text-pink-300 border border-pink-500/40 hover:bg-pink-500/30'
                }`}
              >
                <span>💕</span> ใจตรงกัน
              </button>
            )}
            {myKrathongId && (
              <button
                onClick={() => setFilterMode('mine')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                  filterMode === 'mine'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-md ring-2 ring-amber-400/50'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                <span>👑</span> กระทงของฉัน
              </button>
            )}
          </div>
        </div>

        {/* Krathongs Cards Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredKrathongs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 text-sm">
              <span className="text-4xl mb-2">🔍</span>
              ไม่พบกระทงที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredKrathongs.map((k) => (
              <div
                key={k.id}
                onClick={() => {
                  onSelectKrathong(k);
                  onClose();
                }}
                className="group relative bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-400/60 p-4 rounded-2xl transition cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between text-left transform hover:-translate-y-0.5"
              >
                {/* Top: Avatar, Name & Mode Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {k.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={k.avatarUrl}
                        alt={k.name}
                        className="w-8 h-8 rounded-full border border-amber-400 object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-amber-300 transition">
                        {k.name}
                        {k.partnerName && ` ❤️ ${k.partnerName}`}
                      </h4>
                      {k.zodiac && (
                        <div className="text-[10px] text-amber-300/80 truncate">
                          {k.zodiac}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      k.isMatchedWithMe
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-sm'
                        : k.mode === 'single'
                        ? 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                        : k.mode === 'family'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {k.isMatchedWithMe ? '💕 ใจตรงกัน' : k.mode === 'single' ? 'โสด' : k.mode === 'family' ? '👨‍👩‍👧‍👦 ครอบครัว' : 'มีคู่'}
                  </span>
                </div>

                {/* Krathong 2D Tiny Preview */}
                <div className="flex items-center justify-center -my-3 transform scale-60 pointer-events-none">
                  <Krathong2D
                    design={k.design}
                    size={110}
                    isCouple={k.mode === 'couple'}
                    isFamily={k.mode === 'family'}
                    showRipple={false}
                  />
                </div>

                {/* Wish Text Excerpt */}
                <p className="text-xs text-slate-300 italic line-clamp-2 my-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                  &ldquo;{k.wish}&rdquo;
                </p>

                {/* Footer: Like count & Action */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikeKrathong(k.id);
                    }}
                    className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-700"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-400" />
                    <span className="font-semibold text-[11px]">{k.likes}</span>
                  </button>

                  <span className="text-[11px] text-amber-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>เปิดดูคำอธิษฐาน</span> &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Status */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>แสดงกระทงทั้งหมด {filteredKrathongs.length} ใบ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
