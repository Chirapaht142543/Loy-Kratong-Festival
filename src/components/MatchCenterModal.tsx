'use client';

import React, { useState } from 'react';
import { RiverKrathongItem } from './MainRiverView';
import { Krathong2D } from './Krathong2D';
import { FacebookIcon, InstagramIcon, TikTokIcon } from './Icons';
import {
  Heart,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  X,
  Flame,
  User,
  MessageCircle,
  HelpCircle,
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

export interface MatchRecord {
  id: string; // match ID
  partnerKrathong: RiverKrathongItem;
  matchedAt: string;
  harmonyScore: number;
  harmonyTitle: string;
}

interface MatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchRecord[];
  admirersCount: number;
  onSelectKrathong: (krathong: RiverKrathongItem) => void;
  onOpenSingleFlow: () => void;
  hasMyKrathong: boolean;
}

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  isOpen,
  onClose,
  matches,
  admirersCount,
  onSelectKrathong,
  onOpenSingleFlow,
  hasMyKrathong,
}) => {
  const { toast } = useDialog();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(label);
      toast.success(`คัดลอก ${label} เรียบร้อยแล้ว ✨`);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-pink-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Glow Ambient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>กล่องกระทงใจตรงกัน</span>
                <span className="text-xs bg-pink-500 text-white font-black px-2 py-0.5 rounded-full">
                  {matches.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ปลดล็อกวาร์ปของคนที่ส่งใจให้กระทงของคุณและคุณส่งใจกลับ 💕
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secret Admirers Teaser Banner */}
        <div className="my-3 px-4 py-2.5 bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/25 rounded-2xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-pink-200">
            <span className="text-base">💌</span>
            <span>
              มีผู้ส่งหัวใจให้กระทงของคุณแล้วทั้งหมด{' '}
              <strong className="text-amber-300 font-extrabold">{admirersCount}</strong> ดวง
            </span>
          </div>
          <span className="text-[11px] text-pink-300/80 font-medium hidden sm:inline">
            ส่องกระทงในน้ำเพื่อลุ้นใจตรงกัน ✨
          </span>
        </div>

        {/* Matches List (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-3">
          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-3xl mb-3 animate-pulse">
                💖
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1">
                ยังไม่มีกระทงที่ใจตรงกันในขณะนี้
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
                {hasMyKrathong
                  ? 'ลองกดส่งหัวใจให้กระทงคนโสดคนอื่นๆ ในแม่น้ำ เมื่อเขาถูกใจกระทงคุณกลับ วาร์ปจะถูกปลดล็อกทันที!'
                  : 'คุณยังไม่ได้ลอยกระทงคนโสด มาร่วมเขียนคำอธิษฐานและส่งกระทงเพื่อเริ่มตามหาคนใจตรงกันกันเลย!'}
              </p>
              {!hasMyKrathong && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSingleFlow();
                  }}
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-pink-500/20 hover:opacity-95 transition cursor-pointer"
                >
                  🌸 ลอยกระทงคนโสดหาคู่
                </button>
              )}
            </div>
          ) : (
            matches.map((m) => {
              const k = m.partnerKrathong;
              const contacts = k.contacts || {};
              return (
                <div
                  key={m.id}
                  className="bg-slate-850/80 border border-pink-500/30 rounded-2xl p-4 transition hover:border-pink-400/60 shadow-md text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {k.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={k.avatarUrl}
                            alt={k.name}
                            className="w-12 h-12 rounded-full border-2 border-pink-400 object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-pink-400 flex items-center justify-center text-slate-300">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                          Match
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-100 truncate">
                            {k.name}
                          </h4>
                          <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-0.2 rounded-full">
                            <Flame className="w-3 h-3 fill-amber-400" />
                            {m.harmonyScore}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {k.zodiac || m.harmonyTitle}
                        </div>
                      </div>
                    </div>

                    {/* View in River Button */}
                    <button
                      onClick={() => {
                        onSelectKrathong(k);
                        onClose();
                      }}
                      className="self-start sm:self-center text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      ส่องกระทงนี้ 🪷
                    </button>
                  </div>

                  {/* Wish */}
                  {k.wish && (
                    <div className="bg-slate-900/80 border border-slate-850 px-3 py-2 rounded-xl text-xs text-slate-300 italic mb-3">
                      &ldquo;{k.wish}&rdquo;
                    </div>
                  )}

                  {/* Unlocked Socials Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                    <span className="text-[11px] text-pink-300 font-bold flex items-center gap-1 mr-1">
                      <span>🔓 วาร์ป:</span>
                    </span>

                    {contacts.instagram ? (
                      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 px-2.5 py-1 rounded-xl text-xs">
                        <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                        <span className="font-bold text-pink-200 max-w-[120px] truncate">
                          {contacts.instagram}
                        </span>
                        <button
                          onClick={() => handleCopy(contacts.instagram!, 'Instagram')}
                          className="text-slate-400 hover:text-white transition p-0.5"
                          title="คัดลอก"
                        >
                          {copiedKey === 'Instagram' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://instagram.com/${contacts.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-400 hover:text-pink-300 ml-0.5"
                          title="เปิด Instagram"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : null}

                    {contacts.facebook ? (
                      <div className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-xl text-xs">
                        <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-blue-200 max-w-[120px] truncate">
                          {contacts.facebook}
                        </span>
                        <button
                          onClick={() => handleCopy(contacts.facebook!, 'Facebook')}
                          className="text-slate-400 hover:text-white transition p-0.5"
                          title="คัดลอก"
                        >
                          {copiedKey === 'Facebook' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://www.facebook.com/search/top?q=${encodeURIComponent(contacts.facebook)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 ml-0.5"
                          title="ค้นหา Facebook"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : null}

                    {contacts.tiktok ? (
                      <div className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl text-xs">
                        <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-slate-200 max-w-[120px] truncate">
                          {contacts.tiktok}
                        </span>
                        <button
                          onClick={() => handleCopy(contacts.tiktok!, 'TikTok')}
                          className="text-slate-400 hover:text-white transition p-0.5"
                          title="คัดลอก"
                        >
                          {copiedKey === 'TikTok' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    ) : null}

                    {!contacts.instagram && !contacts.facebook && !contacts.tiktok && (
                      <span className="text-[11px] text-slate-400">
                        ไม่ได้ระบุวาร์ปโซเชียล
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>วาร์ปจะมองเห็นได้เฉพาะคนที่ใจตรงกันทั้งสองฝ่ายเท่านั้น 🔒✨</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
