'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
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
  MessageCircle,
  Eye,
} from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface MatchCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  myKrathong: RiverKrathongItem | null;
  partnerKrathong: RiverKrathongItem | null;
  harmonyScore?: number;
  harmonyTitle?: string;
  onViewInRiver?: () => void;
}

const ICEBREAKERS = [
  'สุขสันต์วันลอยกระทงนะ! พรบนกระทงของคุณน่ารักมากเลย ✨',
  'ยินดีที่กระทงของเราได้มาลอยเจอกันในคืนวันเพ็ญนะค้าบ 🌕💖',
  'เห็นคำอธิษฐานของคุณแล้วชอบมาก ขอให้คำขอพรของคุณเป็นจริงนะ 🌸',
  'ดวงเราสมพงษ์กันพอดีเลย มาลอยกระทงออนไลน์ด้วยกันนะ 🪷',
];

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  isOpen,
  onClose,
  myKrathong,
  partnerKrathong,
  harmonyScore = 95,
  harmonyTitle = 'ธาตุเกื้อหนุน นำพารักสดใส',
  onViewInRiver,
}) => {
  const { toast } = useDialog();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedIcebreaker, setCopiedIcebreaker] = useState(false);
  const [selectedIcebreaker, setSelectedIcebreaker] = useState(ICEBREAKERS[0]);

  // Fire celebratory confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIcebreaker(
        ICEBREAKERS[Math.floor(Math.random() * ICEBREAKERS.length)]
      );

      // 1st burst: pink and gold
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f43f5e', '#fb7185', '#fbbf24', '#fde047', '#ffffff'],
      });

      // 2nd delayed burst: hearts & stars feel
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 70,
          origin: { x: 0.2, y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#fbbf24'],
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 70,
          origin: { x: 0.8, y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#fbbf24'],
        });
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !partnerKrathong) return null;

  const contacts = partnerKrathong.contacts || {};
  const hasAnyContact = !!(contacts.facebook || contacts.instagram || contacts.tiktok);

  const handleCopy = (text: string, key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`คัดลอก ${key} เรียบร้อยแล้ว ✨`);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleCopyIcebreaker = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(selectedIcebreaker);
      setCopiedIcebreaker(true);
      toast.success('คัดลอกข้อความทักทายเรียบร้อยแล้ว 💬');
      setTimeout(() => setCopiedIcebreaker(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-lg my-6 bg-gradient-to-b from-slate-900 via-rose-950/30 to-slate-950 border border-pink-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(244,63,94,0.3)] text-center overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white font-extrabold px-4 py-1.5 rounded-full text-xs shadow-lg shadow-pink-500/30 mb-3 animate-pulse">
          <Heart className="w-4 h-4 fill-white" />
          <span>ใจตรงกันในคืนวันเพ็ญ! 🌕💕</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-rose-300 to-amber-200 mb-1">
          คุณและ {partnerKrathong.name} ถูกใจกระทงของกันและกัน!
        </h2>

        <div className="inline-flex items-center gap-1.5 text-xs text-amber-300/90 font-medium mb-5">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>ดวงสมพงษ์เข้ากันได้ {harmonyScore}% • {harmonyTitle}</span>
        </div>

        {/* Visual Pairing: 2 Avatars & 2 Krathongs */}
        <div className="relative bg-slate-850/80 border border-pink-500/30 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner">
          <div className="flex items-center justify-around">
            {/* Left: User */}
            <div className="flex flex-col items-center">
              <div className="relative mb-1">
                {myKrathong?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={myKrathong.avatarUrl}
                    alt={myKrathong.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-2xl">
                    🌕
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                  คุณ
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-200 max-w-[80px] truncate">
                {myKrathong?.name || 'คุณ'}
              </span>
              <div className="transform scale-60 -my-4 pointer-events-none">
                {myKrathong?.design && (
                  <Krathong2D design={myKrathong.design} size={90} showRipple={false} />
                )}
              </div>
            </div>

            {/* Center Heart Beat */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/50 animate-bounce">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white" />
              </div>
              <span className="text-[11px] font-bold text-pink-300 mt-1">
                ใจตรงกัน
              </span>
            </div>

            {/* Right: Partner */}
            <div className="flex flex-col items-center">
              <div className="relative mb-1">
                {partnerKrathong.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partnerKrathong.avatarUrl}
                    alt={partnerKrathong.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-pink-400 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 border-2 border-pink-400 flex items-center justify-center text-2xl">
                    💖
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                  แมตช์
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-pink-200 max-w-[80px] truncate">
                {partnerKrathong.name}
              </span>
              <div className="transform scale-60 -my-4 pointer-events-none">
                <Krathong2D design={partnerKrathong.design} size={90} showRipple={false} />
              </div>
            </div>
          </div>

          {/* Partner's wish */}
          {partnerKrathong.wish && (
            <div className="mt-2 pt-2 border-t border-slate-700/60 text-xs text-slate-300 italic">
              &ldquo;{partnerKrathong.wish}&rdquo;
            </div>
          )}
        </div>

        {/* Unlocked Contact Channels Section */}
        <div className="space-y-2.5 mb-5 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-pink-300 px-1">
            <span className="flex items-center gap-1.5">
              <span>🔓</span> ช่องทางติดต่อที่ปลดล็อกแล้ว
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              แตะเพื่อเปิดหรือคัดลอก
            </span>
          </div>

          {hasAnyContact ? (
            <div className="grid grid-cols-1 gap-2">
              {/* Instagram */}
              {contacts.instagram && (
                <div className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-pink-500/30 rounded-2xl px-3.5 py-2.5 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium">Instagram</div>
                      <div className="text-xs font-bold text-pink-200 truncate">
                        {contacts.instagram}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contacts.instagram!, 'Instagram')}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                      title="คัดลอก"
                    >
                      {copiedKey === 'Instagram' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`https://instagram.com/${contacts.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      เปิด <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Facebook */}
              {contacts.facebook && (
                <div className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-blue-500/30 rounded-2xl px-3.5 py-2.5 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <FacebookIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium">Facebook</div>
                      <div className="text-xs font-bold text-blue-200 truncate">
                        {contacts.facebook}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contacts.facebook!, 'Facebook')}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                      title="คัดลอก"
                    >
                      {copiedKey === 'Facebook' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`https://www.facebook.com/search/top?q=${encodeURIComponent(contacts.facebook)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      ค้นหา <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* TikTok */}
              {contacts.tiktok && (
                <div className="flex items-center justify-between bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl px-3.5 py-2.5 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-white shrink-0">
                      <TikTokIcon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium">TikTok</div>
                      <div className="text-xs font-bold text-slate-200 truncate">
                        {contacts.tiktok}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contacts.tiktok!, 'TikTok')}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                      title="คัดลอก"
                    >
                      {copiedKey === 'TikTok' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <a
                      href={`https://www.tiktok.com/${contacts.tiktok.startsWith('@') ? contacts.tiktok : '@' + contacts.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-300 bg-slate-700/60 hover:bg-slate-700 px-2.5 py-1 rounded-xl transition cursor-pointer"
                    >
                      เปิด <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-800/60 rounded-2xl text-xs text-slate-400 text-center">
              ผู้ใช้ท่านนี้ยังไม่ได้ระบุวาร์ปโซเชียลไว้ แต่สามารถทักทายผ่านกระทงได้ ✨
            </div>
          )}
        </div>

        {/* Icebreaker Starter Note */}
        <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-slate-900 border border-pink-500/20 rounded-2xl p-3 sm:p-3.5 mb-5 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1 text-[11px] font-bold text-pink-300">
              <MessageCircle className="w-3.5 h-3.5" />
              ข้อความเริ่มทักทาย (Icebreaker)
            </span>
            <button
              onClick={handleCopyIcebreaker}
              className="flex items-center gap-1 text-[10px] text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md transition cursor-pointer"
            >
              {copiedIcebreaker ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            &ldquo;{selectedIcebreaker}&rdquo;
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3">
          {onViewInRiver && (
            <button
              type="button"
              onClick={() => {
                onViewInRiver();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>ดูในแม่น้ำ</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:opacity-95 shadow-lg shadow-pink-500/25 transition cursor-pointer"
          >
            ยอดเยี่ยมมาก ✨
          </button>
        </div>
      </div>
    </div>
  );
};
