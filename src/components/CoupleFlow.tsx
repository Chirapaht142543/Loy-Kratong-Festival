'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { CoupleProfile, CoupleRoom, KrathongDesign } from '@/types/krathong';
import { PRESET_AVATARS } from '@/lib/imageUtils';
import { KrathongCustomizer } from './KrathongCustomizer';
import {
  createApiCoupleRoom,
  fetchApiCoupleRoom,
  joinApiCoupleRoom,
  markApiCoupleRoomFloated,
} from '@/lib/api';
import {
  Heart,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Users,
  LogIn,
  KeyRound,
  RefreshCw,
  Clock,
  UserCheck,
} from 'lucide-react';

interface CoupleFlowProps {
  onComplete: (profile: CoupleProfile) => void;
  onBack: () => void;
  initialRoomCode?: string;
}

type CoupleSubMode = 'create_room' | 'join_room' | 'direct';

export const CoupleFlow: React.FC<CoupleFlowProps> = ({
  onComplete,
  onBack,
  initialRoomCode,
}) => {
  const { currentUser } = useAuth();
  const { alert, toast } = useDialog();

  // Mode Selection
  const [subMode, setSubMode] = useState<CoupleSubMode>(
    initialRoomCode ? 'join_room' : 'create_room'
  );

  // Step 1: Info/Room, Step 2: Customizer (for direct or host before create)
  const [step, setStep] = useState<1 | 2>(1);

  // Direct Mode State
  const [partner1Name, setPartner1Name] = useState(currentUser?.nickname || '');
  const [partner2Name, setPartner2Name] = useState('');
  const [loveMessage, setLoveMessage] = useState('');

  // Krathong Design
  const [design, setDesign] = useState<KrathongDesign>({
    base: 'lotus',
    flower: 'rose',
    candle: 'pink-love',
  });

  // Room State
  const [roomCodeInput, setRoomCodeInput] = useState(initialRoomCode || '');
  const [activeRoom, setActiveRoom] = useState<CoupleRoom | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);

  // Room Join State
  const [joinPartnerName, setJoinPartnerName] = useState(currentUser?.nickname || '');
  const [joinPartnerWish, setJoinPartnerWish] = useState('');

  // Host Create State
  const [hostName, setHostName] = useState(currentUser?.nickname || '');
  const [hostWish, setHostWish] = useState('ขอให้ความรักของเราสองคนมั่นคง หวานชื่น และจับมือเคียงข้างกันตลอดไป 💖');

  // Auto-sync nickname from auth
  useEffect(() => {
    if (currentUser?.nickname) {
      if (!partner1Name) setPartner1Name(currentUser.nickname);
      if (!hostName) setHostName(currentUser.nickname);
      if (!joinPartnerName) setJoinPartnerName(currentUser.nickname);
    }
  }, [currentUser]);

  // Polling for Room Updates (when waiting for partner to join or float)
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!activeRoom || activeRoom.status === 'floated') {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    const poll = async () => {
      if (document.hidden) return;
      const latest = await fetchApiCoupleRoom(activeRoom.code);
      if (latest) {
        setActiveRoom(latest);
        if (latest.status === 'floated' && latest.krathongId) {
          // Both finish together!
          handleRoomFloatedDone(latest);
        }
      }
    };

    pollingTimerRef.current = setInterval(poll, 2500);
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [activeRoom]);

  // Handle Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) {
      alert({
        title: 'กรุณากรอกชื่อของคุณ',
        message: 'กรุณากรอกชื่อของคุณเพื่อสร้างห้องลอยคู่ครับ ❤️',
        type: 'warning',
      });
      return;
    }

    setIsLoadingRoom(true);
    const avatar = currentUser?.avatarUrl || PRESET_AVATARS[0].url;
    const room = await createApiCoupleRoom({
      hostName: hostName.trim(),
      hostAvatar: avatar,
      hostWish: hostWish.trim(),
      design,
    });
    setIsLoadingRoom(false);

    if (room) {
      setActiveRoom(room);
      toast.success(`สร้างห้องลอยคู่สำเร็จ! รหัสห้องคือ ${room.code}`);
    } else {
      alert({
        title: 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถสร้างห้องได้ กรุณาลองใหม่อีกครั้งครับ',
        type: 'error',
      });
    }
  };

  // Handle Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      alert({
        title: 'กรุณากรอกรหัสห้อง',
        message: 'กรุณาระบุรหัสห้องลอยคู่ 6 หลัก (เช่น CP-8842) ที่ได้รับจากหวานใจครับ ❤️',
        type: 'warning',
      });
      return;
    }
    if (!joinPartnerName.trim()) {
      alert({
        title: 'กรุณากรอกชื่อของคุณ',
        message: 'กรุณากรอกชื่อของคุณเพื่อร่วมลอยกระทงคู่ครับ ❤️',
        type: 'warning',
      });
      return;
    }

    setIsLoadingRoom(true);
    const avatar = currentUser?.avatarUrl || PRESET_AVATARS[1].url;
    const room = await joinApiCoupleRoom({
      code: cleanCode,
      partnerName: joinPartnerName.trim(),
      partnerAvatar: avatar,
      partnerWish: joinPartnerWish.trim() || 'ขอให้เราสองคนรักกันยืนยาว มีความสุขในทุกๆ วันนะ 💕',
    });
    setIsLoadingRoom(false);

    if (room) {
      setActiveRoom(room);
      toast.success(`เข้าร่วมห้องของ "${room.hostName}" เรียบร้อยแล้ว! 💕`);
    } else {
      alert({
        title: 'ไม่พบห้องลอยคู่',
        message: `ไม่พบรหัสห้อง "${cleanCode}" หรือห้องอาจถูกลอยไปแล้ว กรุณาตรวจสอบรหัสอีกครั้งครับ`,
        type: 'warning',
      });
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.code);
    setIsCopiedCode(true);
    toast.success('คัดลอกรหัสห้องแล้ว!');
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Copy Link to Clipboard
  const handleCopyLink = () => {
    if (!activeRoom || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/?couple_room=${activeRoom.code}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopiedLink(true);
    toast.success('คัดลอกลิงก์ชวนหวานใจแล้ว! ส่งให้แฟนได้เลย 💕');
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  // Handle Float Couple Room
  const handleFloatRoom = async () => {
    if (!activeRoom) return;
    const finalId = `cpl-${Date.now()}`;
    const p1Name = activeRoom.hostName;
    const p2Name = activeRoom.partnerName || 'หวานใจ';
    const combinedWish = activeRoom.partnerWish
      ? `"${activeRoom.hostWish}" • "${activeRoom.partnerWish}"`
      : activeRoom.hostWish;

    const profile: CoupleProfile = {
      id: finalId,
      mode: 'couple',
      partner1Name: p1Name,
      partner2Name: p2Name,
      partner1Avatar: activeRoom.hostAvatar || PRESET_AVATARS[0].url,
      partner2Avatar: activeRoom.partnerAvatar || PRESET_AVATARS[1].url,
      loveMessage: combinedWish,
      design: activeRoom.design || design,
      roomCode: activeRoom.code,
      createdAt: new Date().toISOString(),
    };

    // Mark room floated on server
    await markApiCoupleRoomFloated(activeRoom.code, finalId);

    try {
      localStorage.setItem('loy_krathong_saved_couple_profile', JSON.stringify(profile));
    } catch {}

    onComplete(profile);
  };

  const handleRoomFloatedDone = (room: CoupleRoom) => {
    const profile: CoupleProfile = {
      id: room.krathongId || `cpl-${Date.now()}`,
      mode: 'couple',
      partner1Name: room.hostName,
      partner2Name: room.partnerName || 'หวานใจ',
      partner1Avatar: room.hostAvatar || PRESET_AVATARS[0].url,
      partner2Avatar: room.partnerAvatar || PRESET_AVATARS[1].url,
      loveMessage: room.partnerWish
        ? `"${room.hostWish}" • "${room.partnerWish}"`
        : room.hostWish,
      design: room.design || design,
      roomCode: room.code,
      createdAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  // Finish Direct Mode
  const handleFinishDirect = () => {
    const finalAvatar = currentUser?.avatarUrl || PRESET_AVATARS[0].url;
    const profile: CoupleProfile = {
      id: 'cpl-' + Date.now(),
      mode: 'couple',
      partner1Name: partner1Name.trim(),
      partner2Name: partner2Name.trim(),
      partner1Avatar: finalAvatar,
      partner2Avatar: PRESET_AVATARS[1].url,
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header Badge */}
      <div className="text-center pb-5">
        <span className="inline-flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs px-3.5 py-1.5 rounded-full mb-3 shadow-sm">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
          ลอยกระทงคู่รัก เคียงข้างกันหวานฉ่ำ ๒๕๖๙
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-200">
          สายธารแห่งรัก ลอยคู่ใจมั่นคง
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          กระทงสองใบจะถูกผูกโยงด้วยสายสิญจน์แห่งรัก ลอยเคียงคู่กันไปตามสายน้ำ ไม่โดนใครพัดแยก
        </p>
      </div>

      {/* Mode Tabs: Create Room / Join Room / Direct */}
      {!activeRoom && step === 1 && (
        <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl backdrop-blur-xl mb-6 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setSubMode('create_room')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              subMode === 'create_room'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💌</span>
            <span>สร้างห้องชวนแฟน</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('join_room')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              subMode === 'join_room'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>มีรหัสห้องแล้ว</span>
          </button>
          <button
            type="button"
            onClick={() => setSubMode('direct')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              subMode === 'direct'
                ? 'bg-slate-800 text-amber-300 shadow-md border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>👩‍❤️‍👨</span>
            <span>ลอยคู่ทันที</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIVE ROOM VIEW (WAITING OR READY TO FLOAT)             */}
      {/* ========================================================= */}
      {activeRoom ? (
        <div className="bg-slate-900/95 border border-pink-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
            ห้องลอยคู่รัก รหัส: <strong className="text-white text-sm tracking-wider font-mono">{activeRoom.code}</strong>
          </div>

          {/* Dual Profile Visual Pairing */}
          <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-3xl flex items-center justify-around relative">
            {/* Host Side */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeRoom.hostAvatar || PRESET_AVATARS[0].url}
                  alt={activeRoom.hostName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-pink-400 object-cover shadow-lg"
                />
                <span className="absolute -bottom-2 -right-1 bg-pink-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  เจ้าของห้อง
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-pink-200 mt-1">
                {activeRoom.hostName}
              </h4>
              <p className="text-[11px] text-slate-400 italic max-w-[130px] truncate mt-0.5">
                &ldquo;{activeRoom.hostWish}&rdquo;
              </p>
            </div>

            {/* Middle Animated Heart */}
            <div className="flex flex-col items-center justify-center px-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  activeRoom.status === 'ready'
                    ? 'bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.8)] scale-110 animate-bounce'
                    : 'bg-pink-500/20 text-pink-400 border border-pink-500/40 animate-pulse'
                }`}
              >
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <span className="text-[10px] text-pink-300 font-bold mt-1.5">
                {activeRoom.status === 'ready' ? 'พร้อมลอยคู่ 💕' : 'รอหวานใจ...'}
              </span>
            </div>

            {/* Partner Side */}
            <div className="flex flex-col items-center">
              {activeRoom.partnerName ? (
                <>
                  <div className="relative mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeRoom.partnerAvatar || PRESET_AVATARS[1].url}
                      alt={activeRoom.partnerName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-rose-400 object-cover shadow-lg"
                    />
                    <span className="absolute -bottom-2 -right-1 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      หวานใจ
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-rose-200 mt-1">
                    {activeRoom.partnerName}
                  </h4>
                  <p className="text-[11px] text-slate-400 italic max-w-[130px] truncate mt-0.5">
                    &ldquo;{activeRoom.partnerWish}&rdquo;
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 mb-2">
                    <Clock className="w-6 h-6 text-pink-400/60 animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">รอหวานใจเข้าร่วม</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">ส่งรหัสห้องให้แฟน</span>
                </div>
              )}
            </div>
          </div>

          {/* Invitation Box (When waiting) */}
          {activeRoom.status === 'waiting' && (
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300">
                ส่งรหัสห้องนี้ให้หวานใจของคุณเปิดเว็บแล้วกด <strong>&ldquo;มีรหัสห้องแล้ว&rdquo;</strong> เพื่อเข้าร่วม:
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="bg-slate-900 border border-pink-500/50 px-5 py-2.5 rounded-xl font-mono text-xl sm:text-2xl font-black text-pink-300 tracking-widest shadow-inner">
                  {activeRoom.code}
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold px-3 py-3 rounded-xl text-xs transition flex items-center gap-1.5"
                  title="คัดลอกรหัส"
                >
                  {isCopiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedCode ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'}</span>
                </button>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-500/40 text-pink-200 text-xs font-bold px-4 py-2 rounded-xl transition transform hover:scale-102"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isCopiedLink ? 'คัดลอกลิงก์แล้ว! ส่งให้แฟนได้ทันที' : 'คัดลอกลิงก์ส่งให้แฟน (คลิกแล้วเข้าห้องทันที)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Ready Banner */}
          {activeRoom.status === 'ready' && (
            <div className="bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-amber-500/20 border border-pink-400/50 p-4 rounded-2xl animate-pulse">
              <h3 className="text-base font-extrabold text-pink-200 flex items-center justify-center gap-2">
                <span>✨</span>
                <span>ทั้งสองคนเชื่อมใจกันเรียบร้อยแล้ว!</span>
                <span>💖</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                พร้อมปล่อยกระทงคู่รักลอยเคียงข้างกันในแม่น้ำมหานคราแล้วครับ
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveRoom(null)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> ออกจากห้องนี้
            </button>

            {activeRoom.status === 'ready' ? (
              <button
                type="button"
                onClick={handleFloatRoom}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold px-7 py-3 rounded-2xl text-sm shadow-xl shadow-rose-500/30 transform hover:scale-105 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>ปล่อยกระทงคู่รักลงแม่น้ำด้วยกัน 💖</span>
              </button>
            ) : (
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-400" />
                <span>กำลังรอหวานใจกดเข้าร่วม...</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* SUBMODES: 1. CREATE ROOM | 2. JOIN ROOM | 3. DIRECT FLOW  */}
          {/* ========================================================= */}
          {/* TAB 1: CREATE COUPLE ROOM (ชวนแฟน) */}
          {subMode === 'create_room' && (
            <form onSubmit={handleCreateRoom} className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-5">
              <div className="text-center pb-2">
                <h3 className="text-lg sm:text-xl font-bold text-pink-200">
                  สร้างห้องลอยคู่เพื่อรับรหัสชวนแฟน
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  กรอกชื่อและข้อความของคุณ ระบบจะสร้างรหัสห้องและลิงก์ให้คุณส่งชวนแฟนมาลอยคู่กันได้จากทุกที่
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  ชื่อของคุณ <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="เช่น พี่ต้น, แทน"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  ข้อความบอกรัก หรือคำอธิษฐานของคุณ <span className="text-slate-400 text-xs font-normal">(แสดงบนการ์ดคู่รัก)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={150}
                  value={hostWish}
                  onChange={(e) => setHostWish(e.target.value)}
                  placeholder="เช่น ขอบคุณที่อยู่ข้างกันเสมอ ขอให้ทุกวันของเรามีแต่ความสุข รักเธอที่สุดนะ ❤️"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-pink-400"
                />
                <div className="text-right text-[11px] text-slate-500 mt-1">
                  {hostWish.length}/150
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </button>

                <button
                  type="submit"
                  disabled={isLoadingRoom}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/20 transform hover:-translate-y-0.5 transition"
                >
                  <span>{isLoadingRoom ? 'กำลังสร้างห้อง...' : 'สร้างห้อง & รับรหัสชวนแฟน'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: JOIN COUPLE ROOM (มีรหัสห้องแล้ว) */}
          {subMode === 'join_room' && (
            <form onSubmit={handleJoinRoom} className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-5">
              <div className="text-center pb-2">
                <h3 className="text-lg sm:text-xl font-bold text-rose-200">
                  เข้าร่วมห้องลอยคู่ด้วยรหัสห้อง
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ใส่รหัสห้อง 6 หลักที่หวานใจของคุณส่งให้ เพื่อเชื่อมโยงกระทงคู่รักเข้าด้วยกัน
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  รหัสห้องลอยคู่ (เช่น CP-8842) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="ระบุรหัส เช่น CP-8842"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  ชื่อของคุณ (หวานใจ) <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={joinPartnerName}
                  onChange={(e) => setJoinPartnerName(e.target.value)}
                  placeholder="เช่น น้องมายด์, พิมพ์"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  ข้อความความในใจตอบกลับหวานใจ
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={joinPartnerWish}
                  onChange={(e) => setJoinPartnerWish(e.target.value)}
                  placeholder="เช่น ดีใจที่ได้มาลอยกระทงด้วยกันนะ รักเธอเหมือนกันนะ 💕"
                  className="w-full bg-slate-800/70 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                </button>

                <button
                  type="submit"
                  disabled={isLoadingRoom}
                  className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 disabled:opacity-50 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-lg shadow-rose-500/20 transform hover:-translate-y-0.5 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isLoadingRoom ? 'กำลังตรวจสอบห้อง...' : 'เข้าร่วมห้องลอยคู่ 💕'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DIRECT COUPLE FLOW (ลอยคู่ทันที บนเครื่องเดียว) */}
          {subMode === 'direct' && (
            <>
              {step === 1 ? (
                <form
                  onSubmit={(e) => {
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
                  }}
                  className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-5"
                >
                  <div className="text-center pb-2">
                    <h3 className="text-lg sm:text-xl font-bold text-pink-200">
                      กรอกชื่อคู่รักทั้งสองคน
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      เหมาะสำหรับคู่รักที่นั่งอยู่ด้วยกันหน้าจอเดียวกัน สามารถลอยคู่กันได้ทันที
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">
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
                      <label className="block text-sm font-semibold text-slate-200 mb-1.5">
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

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-1.5">
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

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={onBack}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                    >
                      <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold px-7 py-3 rounded-2xl text-sm shadow-lg shadow-pink-500/20 transform hover:-translate-y-0.5 transition"
                    >
                      <span>ไปแต่งกระทงคู่</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <KrathongCustomizer
                    design={design}
                    onChange={setDesign}
                    isCouple={true}
                    name={partner1Name}
                    partnerName={partner2Name}
                  />

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
                      onClick={handleFinishDirect}
                      className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold px-8 py-3.5 rounded-2xl text-base shadow-xl shadow-rose-500/25 transform hover:scale-102 transition"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span>จุดเทียน & ปล่อยกระทงคู่รัก 💖</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
