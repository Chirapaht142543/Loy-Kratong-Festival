'use client';

import React, { useState, useEffect } from 'react';
import { SingleProfile, CoupleProfile, FamilyProfile, MatchResult } from '@/types/krathong';
import { findBestAstrologyMatch, ZODIAC_INFO, ELEMENT_THAI, getElementCompatibility } from '@/lib/astrology';
import { RiverKrathongItem } from '@/components/MainRiverView';
import { InteractiveRiverMap } from '@/components/InteractiveRiverMap';
import { PierLocation, FESTIVAL_PIERS } from '@/types/map';
import { SingleFlow } from '@/components/SingleFlow';
import { CoupleFlow } from '@/components/CoupleFlow';
import { FamilyFlow } from '@/components/FamilyFlow';
import { RiverScene } from '@/components/RiverScene';
import { ResultCardModal } from '@/components/ResultCardModal';
import { AuthModal } from '@/components/AuthModal';
import { KrathongGalleryModal } from '@/components/KrathongGalleryModal';
import { MatchCelebrationModal } from '@/components/MatchCelebrationModal';
import { MatchCenterModal, MatchRecord } from '@/components/MatchCenterModal';
import { Krathong2D } from '@/components/Krathong2D';
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/Icons';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { PRESET_AVATARS } from '@/lib/imageUtils';
import {
  fetchApiKrathongs,
  insertApiKrathong,
  likeApiKrathong,
} from '@/lib/api';
import {
  isSupabaseConfigured,
  fetchRemoteKrathongs,
  insertRemoteKrathong,
  incrementRemoteLikes,
  subscribeToRealtimeKrathongs,
} from '@/lib/supabase';
import { User, LogIn, X, Heart, ExternalLink, Copy, Check, Flame } from 'lucide-react';

type AppView = 'landing' | 'single_form' | 'couple_form' | 'family_form' | 'river';

// Initial River Krathongs (starts clean; dynamically loaded from Database / local storage)
const createInitialRiverKrathongs = (): RiverKrathongItem[] => {
  return [];
};

export default function Home() {
  const { currentUser, isLoggedIn, register, updateProfile } = useAuth();
  const { toast } = useDialog();
  const [view, setView] = useState<AppView>('landing');
  const [selectedMode, setSelectedMode] = useState<'single' | 'couple' | 'family'>('single');
  const [selectedPier, setSelectedPier] = useState<PierLocation | null>(null);
  const [inspectingKrathong, setInspectingKrathong] = useState<RiverKrathongItem | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Mutual Match & Like State
  const [likedKrathongIds, setLikedKrathongIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [isMatchCelebrationOpen, setIsMatchCelebrationOpen] = useState(false);
  const [isMatchCenterOpen, setIsMatchCenterOpen] = useState(false);
  const [currentMatchPair, setCurrentMatchPair] = useState<{
    myKrathong: RiverKrathongItem | null;
    partnerKrathong: RiverKrathongItem | null;
    score: number;
    title: string;
  } | null>(null);

  // Community River Krathongs
  const [riverKrathongs, setRiverKrathongs] = useState<RiverKrathongItem[]>(createInitialRiverKrathongs);

  // User's own Krathong ID & localStorage persistence + PostgreSQL / Realtime synchronization
  const [myKrathongId, setMyKrathongId] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    // 1. Restore local persistence
    try {
      const savedId = localStorage.getItem('loy_krathong_my_id');
      const savedItem = localStorage.getItem('loy_krathong_my_item');
      if (savedId) {
        setMyKrathongId(savedId);
      }
      if (savedItem) {
        const parsed = JSON.parse(savedItem) as RiverKrathongItem;
        if (parsed && parsed.id) {
          setRiverKrathongs((prev) => {
            if (prev.some((k) => k.id === parsed.id)) return prev;
            return [parsed, ...prev];
          });
        }
      }

      // Restore Liked Krathongs
      const savedLikes = localStorage.getItem('loy_krathong_my_liked_ids');
      if (savedLikes) {
        setLikedKrathongIds(JSON.parse(savedLikes));
      }

      // Restore Matches
      const savedMatches = localStorage.getItem('loy_krathong_my_matches');
      if (savedMatches) {
        const parsedMatches = JSON.parse(savedMatches) as MatchRecord[];
        setMatches(parsedMatches);
        const matchedIds = new Set(parsedMatches.map((m) => m.partnerKrathong.id));
        setRiverKrathongs((prev) =>
          prev.map((k) => (matchedIds.has(k.id) ? { ...k, isMatchedWithMe: true } : k))
        );
      }
    } catch {}

    // 2. Fetch from PostgreSQL Database API & setup auto-refresh polling
    let isMounted = true;
    const syncFromPostgres = () => {
      fetchApiKrathongs().then(({ configured, data }) => {
        if (!isMounted) return;
        if (configured) {
          setIsDbConnected(true);
          if (data && data.length > 0) {
            setRiverKrathongs((prev) => {
              const remoteIds = new Set(data.map((r) => r.id));
              const retained = prev.filter((p) => !remoteIds.has(p.id));
              return [...data, ...retained];
            });
          }
        }
      });
    };

    syncFromPostgres();
    const pollInterval = setInterval(syncFromPostgres, 8000);

    // 3. If Supabase is configured as well, subscribe to Realtime
    let unsubscribeSupabase = () => {};
    if (isSupabaseConfigured()) {
      fetchRemoteKrathongs(150).then((remoteItems) => {
        if (isMounted && remoteItems && remoteItems.length > 0) {
          setRiverKrathongs((prev) => {
            const remoteIds = new Set(remoteItems.map((r) => r.id));
            const retained = prev.filter((p) => !remoteIds.has(p.id));
            return [...remoteItems, ...retained];
          });
        }
      });

      unsubscribeSupabase = subscribeToRealtimeKrathongs(
        (newRemoteItem) => {
          setRiverKrathongs((prev) => {
            if (prev.some((k) => k.id === newRemoteItem.id)) return prev;
            return [newRemoteItem, ...prev];
          });
        },
        (updatedItem) => {
          setRiverKrathongs((prev) =>
            prev.map((k) =>
              k.id === updatedItem.id
                ? {
                    ...k,
                    likes: typeof updatedItem.likes === 'number' ? updatedItem.likes : k.likes,
                    wish: updatedItem.wish !== undefined ? updatedItem.wish : k.wish,
                  }
                : k
            )
          );
        }
      );
    }

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      unsubscribeSupabase();
    };
  }, []);

  // Single Data
  const [singleProfile, setSingleProfile] = useState<SingleProfile | undefined>(undefined);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  // Couple Data
  const [coupleProfile, setCoupleProfile] = useState<CoupleProfile | undefined>(undefined);

  // Family Data
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | undefined>(undefined);

  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);

  // Handle Like Krathong in River / Map & Check for Mutual Match
  const handleLikeKrathong = (id: string) => {
    // Prevent liking own Krathong
    if (id === myKrathongId) {
      toast.info('กระทงของคุณเอง สวยงามและเปล่งประกายมาก ✨');
      return;
    }

    const alreadyLiked = likedKrathongIds.includes(id);

    // Increment like count in local state & DB
    setRiverKrathongs((prev) =>
      prev.map((k) => (k.id === id ? { ...k, likes: k.likes + (alreadyLiked ? 0 : 1) } : k))
    );

    if (!alreadyLiked) {
      const updatedLiked = [...likedKrathongIds, id];
      setLikedKrathongIds(updatedLiked);
      try {
        localStorage.setItem('loy_krathong_my_liked_ids', JSON.stringify(updatedLiked));
      } catch {}

      likeApiKrathong(id);
      if (isSupabaseConfigured()) {
        incrementRemoteLikes(id);
      }
    }

    // Find target Krathong
    const target = riverKrathongs.find((k) => k.id === id);
    if (!target) return;

    // Check if target is already matched
    const alreadyMatched = matches.some((m) => m.partnerKrathong.id === id);
    if (alreadyMatched) {
      toast.success(`คุณและ ${target.name} ใจตรงกันแล้ว 💕 (ดูวาร์ปในกล่องใจตรงกัน)`);
      return;
    }

    // Find user's own Krathong
    const myItem = riverKrathongs.find((k) => k.id === myKrathongId);

    // If user has not floated a single krathong yet:
    if (!myItem || myItem.mode !== 'single') {
      toast.info(`ส่งหัวใจให้ ${target.name} แล้ว! 💖 ลอยกระทงคนโสดของคุณเพื่อลุ้นใจตรงกันนะ`);
      return;
    }

    // If both are single mode krathongs -> Mutual Match!
    if (target.mode === 'single') {
      const myEl = myItem.rawElement || 'water';
      const targetEl = target.rawElement || 'fire';
      const compatibility = getElementCompatibility(myEl, targetEl);

      const newMatch: MatchRecord = {
        id: `match-${Date.now()}-${target.id}`,
        partnerKrathong: target,
        matchedAt: new Date().toISOString(),
        harmonyScore: compatibility.score,
        harmonyTitle: compatibility.title,
      };

      const updatedMatches = [newMatch, ...matches.filter((m) => m.partnerKrathong.id !== id)];
      setMatches(updatedMatches);
      try {
        localStorage.setItem('loy_krathong_my_matches', JSON.stringify(updatedMatches));
      } catch {}

      // Mark this target in riverKrathongs as matched
      setRiverKrathongs((prev) =>
        prev.map((k) => (k.id === id ? { ...k, isMatchedWithMe: true } : k))
      );

      // If inspecting modal is open, update it
      if (inspectingKrathong && inspectingKrathong.id === id) {
        setInspectingKrathong({
          ...inspectingKrathong,
          likes: inspectingKrathong.likes + (alreadyLiked ? 0 : 1),
          isMatchedWithMe: true,
        });
      }

      // Open the Match Celebration Modal!
      setCurrentMatchPair({
        myKrathong: myItem,
        partnerKrathong: target,
        score: compatibility.score,
        title: compatibility.title,
      });
      setIsMatchCelebrationOpen(true);
      return;
    }

    toast.success(`ส่งหัวใจให้กระทงของ ${target.name} แล้ว! ✨`);
  };

  // Handle Single Flow Completed
  const handleSingleComplete = (profile: SingleProfile) => {
    setSingleProfile(profile);

    // Find candidates from existing single krathongs in the river (excluding current user)
    const riverCandidates: SingleProfile[] = riverKrathongs
      .filter(
        (k) =>
          k.mode === 'single' &&
          k.id !== profile.id &&
          k.rawZodiac &&
          k.rawBirthDay &&
          k.rawElement
      )
      .map((k) => ({
        id: k.id,
        mode: 'single',
        nickname: k.name,
        gender: k.gender || 'female',
        targetGender: k.targetGender || 'any',
        birthDay: k.rawBirthDay!,
        zodiac: k.rawZodiac!,
        element: k.rawElement!,
        contacts: k.contacts || {},
        allowContact: k.allowContact ?? true,
        avatarUrl: k.avatarUrl,
        wish: k.wish,
        design: k.design,
        createdAt: new Date().toISOString(),
      }));

    const match = findBestAstrologyMatch(profile, riverCandidates);
    setMatchResult(match);
    setSelectedMode('single');

    // Automatically synchronize user profile with AuthContext
    if (isLoggedIn && currentUser) {
      updateProfile({
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl || currentUser.avatarUrl,
        gender: profile.gender,
        targetGender: profile.targetGender,
        birthDay: profile.birthDay,
        zodiac: profile.zodiac,
        contacts: profile.contacts,
        allowContact: profile.allowContact,
        bio: profile.wish || currentUser.bio,
      });
    } else if (!isLoggedIn) {
      const cleanUser =
        profile.nickname.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        `user_${Date.now().toString().slice(-4)}`;
      register({
        username: cleanUser,
        nickname: profile.nickname,
        avatarUrl: profile.avatarUrl || PRESET_AVATARS[0].url,
        gender: profile.gender,
        targetGender: profile.targetGender,
        birthDay: profile.birthDay,
        zodiac: profile.zodiac,
        contacts: profile.contacts,
        allowContact: profile.allowContact,
        bio: profile.wish || '',
      });
    }

    // Save user's own Krathong ID and full item
    setMyKrathongId(profile.id);

    // Add user's new Krathong to the live river
    const newRiverItem: RiverKrathongItem = {
      id: profile.id,
      mode: 'single',
      name: profile.nickname,
      design: profile.design,
      wish: profile.wish,
      zodiac: `${ZODIAC_INFO[profile.zodiac].thai} (${ELEMENT_THAI[profile.element].name})`,
      element: ELEMENT_THAI[profile.element].name,
      avatarUrl: profile.avatarUrl,
      likes: 1,
      lane: 3,
      speed: 25,
      delay: 0,
      contacts: profile.contacts,
      allowContact: profile.allowContact,
      userId: currentUser?.id || profile.id,
      gender: profile.gender,
      targetGender: profile.targetGender,
      rawZodiac: profile.zodiac,
      rawBirthDay: profile.birthDay,
      rawElement: profile.element,
    };

    try {
      localStorage.setItem('loy_krathong_my_id', profile.id);
      localStorage.setItem('loy_krathong_my_item', JSON.stringify(newRiverItem));
    } catch {}

    setRiverKrathongs((prev) => [newRiverItem, ...prev]);

    // Send Krathong to PostgreSQL backend
    insertApiKrathong(newRiverItem, currentUser?.id);

    // Send Krathong to Supabase Realtime if configured
    if (isSupabaseConfigured()) {
      insertRemoteKrathong(newRiverItem, currentUser?.id);
    }

    setView('river');
  };

  // Handle Couple Flow Completed
  const handleCoupleComplete = (profile: CoupleProfile) => {
    setCoupleProfile(profile);
    setSelectedMode('couple');

    // Automatically synchronize couple user with AuthContext
    if (isLoggedIn && currentUser) {
      updateProfile({
        nickname: profile.partner1Name,
        avatarUrl: profile.partner1Avatar || currentUser.avatarUrl,
        bio: profile.loveMessage || currentUser.bio,
      });
    } else if (!isLoggedIn) {
      const cleanUser =
        profile.partner1Name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        `user_${Date.now().toString().slice(-4)}`;
      register({
        username: cleanUser,
        nickname: profile.partner1Name,
        avatarUrl: profile.partner1Avatar || PRESET_AVATARS[0].url,
        gender: 'female',
        birthDay: 'friday',
        zodiac: 'libra',
        contacts: { facebook: '', instagram: '', tiktok: '' },
        allowContact: false,
        bio: profile.loveMessage || '',
      });
    }

    // Save user's own Krathong ID and full item
    setMyKrathongId(profile.id);

    // Add couple's new Krathong to the live river
    const newRiverItem: RiverKrathongItem = {
      id: profile.id,
      mode: 'couple',
      name: profile.partner1Name,
      partnerName: profile.partner2Name,
      design: profile.design,
      wish: profile.loveMessage,
      avatarUrl: profile.partner1Avatar,
      likes: 1,
      lane: 4,
      speed: 27,
      delay: 0,
    };

    try {
      localStorage.setItem('loy_krathong_my_id', profile.id);
      localStorage.setItem('loy_krathong_my_item', JSON.stringify(newRiverItem));
    } catch {}

    setRiverKrathongs((prev) => [newRiverItem, ...prev]);

    // Send Krathong to PostgreSQL backend
    insertApiKrathong(newRiverItem, currentUser?.id);

    // Send Krathong to Supabase Realtime if configured
    if (isSupabaseConfigured()) {
      insertRemoteKrathong(newRiverItem, currentUser?.id);
    }

    setView('river');
  };

  // Handle Family Flow Completed
  const handleFamilyComplete = (profile: FamilyProfile) => {
    setFamilyProfile(profile);
    setSelectedMode('family');

    // Automatically synchronize family user with AuthContext
    if (isLoggedIn && currentUser) {
      updateProfile({
        nickname: profile.familyName,
        avatarUrl: profile.avatarUrl || currentUser.avatarUrl,
        bio: profile.familyWish || currentUser.bio,
      });
    } else if (!isLoggedIn) {
      const cleanUser =
        profile.familyName.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') ||
        `fam_${Date.now().toString().slice(-4)}`;
      register({
        username: cleanUser,
        nickname: profile.familyName,
        avatarUrl: profile.avatarUrl || PRESET_AVATARS[1].url,
        gender: 'female',
        birthDay: 'friday',
        zodiac: 'libra',
        contacts: { facebook: '', instagram: '', tiktok: '' },
        allowContact: false,
        bio: profile.familyWish || '',
      });
    }

    // Save user's own Krathong ID and full item
    setMyKrathongId(profile.id);

    // Add family's new Krathong to the live river
    const newRiverItem: RiverKrathongItem = {
      id: profile.id,
      mode: 'family',
      name: profile.familyName,
      familyName: profile.familyName,
      familyMembers: profile.members,
      design: profile.design,
      wish: profile.familyWish,
      avatarUrl: profile.avatarUrl,
      likes: 1,
      lane: 2,
      speed: 26,
      delay: 0,
    };

    try {
      localStorage.setItem('loy_krathong_my_id', profile.id);
      localStorage.setItem('loy_krathong_my_item', JSON.stringify(newRiverItem));
    } catch {}

    setRiverKrathongs((prev) => [newRiverItem, ...prev]);

    // Send Krathong to PostgreSQL backend
    insertApiKrathong(newRiverItem, currentUser?.id);

    // Send Krathong to Supabase Realtime if configured
    if (isSupabaseConfigured()) {
      insertRemoteKrathong(newRiverItem, currentUser?.id);
    }

    setView('river');
  };

  // Handle Restart / Back to Main Landing
  const handleRestart = () => {
    setShowResultModal(false);
    setSingleProfile(undefined);
    setCoupleProfile(undefined);
    setFamilyProfile(undefined);
    setMatchResult(null);
    setSelectedPier(null);
    setView('landing');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="relative z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <button
          onClick={handleRestart}
          className="flex items-center gap-2 font-bold text-amber-300 text-sm sm:text-lg hover:text-amber-200 transition"
        >
          <span className="text-xl">🌕</span>
          <span className="tracking-wide hidden xs:inline">ลอยกระทงออนไลน์ ๒๕๖๙</span>
        </button>

        {/* Krathong Gallery Button & Realtime Badge */}
        {view === 'landing' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-200 px-3 py-2 rounded-2xl text-xs font-bold shadow-md transition transform hover:scale-102"
              title="ส่องกระทงและคำอธิษฐานของทุกคน"
            >
              <span>📜</span>
              <span className="hidden sm:inline">ส่องกระทงทั้งหมด</span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold">
                {riverKrathongs.length}
              </span>
            </button>

            {isDbConnected ? (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Live
              </span>
            ) : isSupabaseConfigured() ? (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Realtime
              </span>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Match Center Button */}
          <button
            onClick={() => setIsMatchCenterOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border border-pink-500/40 text-pink-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition transform hover:scale-102 cursor-pointer"
            title="กล่องกระทงใจตรงกัน (Mutual Matches)"
          >
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 animate-pulse" />
            <span className="hidden sm:inline">ใจตรงกัน</span>
            <span className="bg-pink-500 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black shadow-sm">
              {matches.length}
            </span>
          </button>

          {view !== 'landing' && (
            <button
              onClick={handleRestart}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              กลับหน้าแผนที่
            </button>
          )}

          {/* Simple Login / Profile Avatar Button */}
          {isLoggedIn && currentUser ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full transition shadow-md group"
              title="แก้ไขโปรไฟล์และวาร์ป"
            >
              {currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.nickname}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-amber-400"
                />
              ) : (
                <User className="w-4 h-4 text-amber-300" />
              )}
              <span className="text-xs font-semibold text-amber-200 max-w-[70px] sm:max-w-[120px] truncate">
                {currentUser.nickname}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md transition transform hover:scale-102"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">เข้าสู่ระบบ / โปรไฟล์</span>
              <span className="sm:hidden">โปรไฟล์</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* 1. LANDING VIEW: BIG INTERACTIVE RIVER MAP */}
        {view === 'landing' && (
          <InteractiveRiverMap
            krathongs={riverKrathongs}
            myKrathongId={myKrathongId}
            onFloatSingleAtPier={(pier) => {
              setSelectedPier(pier);
              setSelectedMode('single');
              setView('single_form');
            }}
            onFloatCoupleAtPier={(pier) => {
              setSelectedPier(pier);
              setSelectedMode('couple');
              setView('couple_form');
            }}
            onFloatFamilyAtPier={(pier) => {
              setSelectedPier(pier);
              setSelectedMode('family');
              setView('family_form');
            }}
            onSelectKrathong={(k) => setInspectingKrathong(k)}
          />
        )}

        {/* 2. SINGLE FORM VIEW */}
        {view === 'single_form' && (
          <div className="w-full">
            {selectedPier && (
              <div className="text-center pt-4">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1 rounded-full shadow-lg">
                  <span>{selectedPier.icon}</span>
                  <span>กำลังจะลอยที่: <strong>{selectedPier.name}</strong></span>
                </span>
              </div>
            )}
            <SingleFlow
              onComplete={handleSingleComplete}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {/* 3. COUPLE FORM VIEW */}
        {view === 'couple_form' && (
          <div className="w-full">
            {selectedPier && (
              <div className="text-center pt-4">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1 rounded-full shadow-lg">
                  <span>{selectedPier.icon}</span>
                  <span>กำลังจะลอยที่: <strong>{selectedPier.name}</strong></span>
                </span>
              </div>
            )}
            <CoupleFlow
              onComplete={handleCoupleComplete}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {/* 3.5. FAMILY FORM VIEW */}
        {view === 'family_form' && (
          <div className="w-full">
            {selectedPier && (
              <div className="text-center pt-4">
                <span className="inline-flex items-center gap-1.5 bg-slate-900 border border-amber-500/40 text-amber-300 text-xs px-3.5 py-1 rounded-full shadow-lg">
                  <span>{selectedPier.icon}</span>
                  <span>กำลังจะลอยกระทงครอบครัวที่: <strong>{selectedPier.name}</strong></span>
                </span>
              </div>
            )}
            <FamilyFlow
              onComplete={handleFamilyComplete}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {/* 4. RIVER SCENE VIEW (INDIVIDUAL FLOATING MOMENT) */}
        {view === 'river' && (
          <div className="w-full h-full flex-1">
            <RiverScene
              mode={selectedMode}
              singleData={singleProfile}
              coupleData={coupleProfile}
              familyData={familyProfile}
              matchResult={matchResult}
              onRevealResult={() => setShowResultModal(true)}
            />
          </div>
        )}
      </div>

      {/* Result Modal Popup */}
      {showResultModal && (
        <ResultCardModal
          mode={selectedMode}
          singleData={singleProfile}
          coupleData={coupleProfile}
          familyData={familyProfile}
          matchResult={matchResult}
          onRestart={handleRestart}
        />
      )}

      {/* Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Krathong Gallery Modal */}
      <KrathongGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        krathongs={riverKrathongs}
        myKrathongId={myKrathongId}
        onSelectKrathong={(k) => setInspectingKrathong(k)}
        onLikeKrathong={handleLikeKrathong}
      />

      {/* Inspect Krathong Popup (When clicked on the Big Map) */}
      {inspectingKrathong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <button
              onClick={() => setInspectingKrathong(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badge */}
            <div className="flex items-center justify-center gap-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  myKrathongId === inspectingKrathong.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : inspectingKrathong.mode === 'single'
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : inspectingKrathong.mode === 'family'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {myKrathongId === inspectingKrathong.id
                  ? '👑 กระทงของคุณ'
                  : inspectingKrathong.mode === 'single'
                  ? '💖 กระทงคนโสดหาคู่'
                  : inspectingKrathong.mode === 'family'
                  ? '👨‍👩‍👧‍👦 กระทงครอบครัว'
                  : '👩‍❤️‍👨 กระทงคู่รัก'}
              </div>
            </div>

            {/* Large Profile Picture & Krathong Body */}
            <div className="flex flex-col items-center justify-center gap-3">
              {inspectingKrathong.avatarUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectingKrathong.avatarUrl}
                    alt={inspectingKrathong.name}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-2 border-amber-400 object-cover shadow-[0_0_25px_rgba(251,191,36,0.35)]"
                  />
                  {myKrathongId === inspectingKrathong.id && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-2 py-0.5 rounded-full text-xs font-black shadow-lg">
                      👑 ของฉัน
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-xl">
                  {inspectingKrathong.mode === 'couple'
                    ? '👩‍❤️‍👨'
                    : inspectingKrathong.mode === 'family'
                    ? '👨‍👩‍👧‍👦'
                    : '🪷'}
                </div>
              )}

              {/* Krathong 2D Design Thumbnail */}
              <div className="transform scale-75 -my-3">
                <Krathong2D
                  design={inspectingKrathong.design}
                  size={110}
                  isCouple={inspectingKrathong.mode === 'couple'}
                  isFamily={inspectingKrathong.mode === 'family'}
                  familyMembers={inspectingKrathong.familyMembers}
                  familyCount={
                    Array.isArray(inspectingKrathong.familyMembers)
                      ? inspectingKrathong.familyMembers.length
                      : 3
                  }
                  showRipple={false}
                />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-amber-200">
                  {inspectingKrathong.name}
                  {inspectingKrathong.partnerName && (
                    <span className="text-pink-300 font-bold"> ❤️ {inspectingKrathong.partnerName}</span>
                  )}
                </h3>
                {inspectingKrathong.zodiac && (
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">
                    {inspectingKrathong.zodiac}
                  </div>
                )}
              </div>

              {/* Family Members & Pets Pills if in family mode */}
              {Array.isArray(inspectingKrathong.familyMembers) &&
                inspectingKrathong.familyMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto px-2">
                    {inspectingKrathong.familyMembers.map((m: any, mIdx: number) => {
                      const isPet =
                        typeof m === 'object' &&
                        m !== null &&
                        (m.isPet ||
                          (m.role &&
                            (m.role.includes('🐾') ||
                              m.role.includes('หมา') ||
                              m.role.includes('แมว') ||
                              m.role.includes('สัตว์เลี้ยง'))));
                      return (
                        <span
                          key={mIdx}
                          className={`border text-[11px] px-2.5 py-0.5 rounded-full ${
                            isPet
                              ? 'bg-orange-950/60 border-orange-500/40 text-orange-200 font-medium'
                              : 'bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          {typeof m === 'string' ? m : `${m.role ? m.role + ': ' : ''}${m.name}`}
                        </span>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* Wish Quotation */}
            <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl text-xs sm:text-sm text-slate-200 italic leading-relaxed text-left">
              &ldquo;{inspectingKrathong.wish}&rdquo;
            </div>

            {/* Unlocked Contacts or Lock Teaser (Single Mode) */}
            {inspectingKrathong.mode === 'single' && myKrathongId !== inspectingKrathong.id && (
              <div className="w-full text-left">
                {inspectingKrathong.isMatchedWithMe || matches.some((m) => m.partnerKrathong.id === inspectingKrathong.id) ? (
                  <div className="bg-gradient-to-r from-pink-950/40 via-rose-950/30 to-slate-900 border border-pink-500/40 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-pink-300">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-pink-400 text-pink-400 animate-pulse" />
                        <span>ใจตรงกันแล้ว! ปลดล็อกวาร์ปเรียบร้อย</span>
                      </span>
                      <span className="text-[10px] bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-full font-black shadow-sm">
                        Matched 💕
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {inspectingKrathong.contacts?.instagram && (
                        <a
                          href={`https://instagram.com/${inspectingKrathong.contacts.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500/20 to-purple-500/20 hover:from-pink-500/30 hover:to-purple-500/30 border border-pink-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-pink-200 transition"
                        >
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span>{inspectingKrathong.contacts.instagram}</span>
                          <ExternalLink className="w-3 h-3 text-pink-400" />
                        </a>
                      )}
                      {inspectingKrathong.contacts?.facebook && (
                        <a
                          href={`https://www.facebook.com/search/top?q=${encodeURIComponent(inspectingKrathong.contacts.facebook)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-200 transition"
                        >
                          <FacebookIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{inspectingKrathong.contacts.facebook}</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </a>
                      )}
                      {inspectingKrathong.contacts?.tiktok && (
                        <a
                          href={`https://www.tiktok.com/${inspectingKrathong.contacts.tiktok.startsWith('@') ? inspectingKrathong.contacts.tiktok : '@' + inspectingKrathong.contacts.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 transition"
                        >
                          <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{inspectingKrathong.contacts.tiktok}</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-850/80 border border-slate-700/80 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>🔒</span> วาร์ปจะปลดล็อกเมื่อใจตรงกันทั้งสองฝ่าย
                    </span>
                    <span className="text-[11px] text-pink-400 font-semibold">
                      {likedKrathongIds.includes(inspectingKrathong.id)
                        ? '💌 ส่งใจแล้ว (รอลุ้น)'
                        : 'ส่งใจเพื่อลุ้น!'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-center gap-3">
              {myKrathongId !== inspectingKrathong.id && (
                <button
                  onClick={() => {
                    handleLikeKrathong(inspectingKrathong.id);
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition transform active:scale-95 cursor-pointer ${
                    inspectingKrathong.isMatchedWithMe || matches.some((m) => m.partnerKrathong.id === inspectingKrathong.id)
                      ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 text-white shadow-pink-500/30'
                      : likedKrathongIds.includes(inspectingKrathong.id)
                      ? 'bg-slate-800 text-pink-300 border border-pink-500/40'
                      : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      inspectingKrathong.isMatchedWithMe || matches.some((m) => m.partnerKrathong.id === inspectingKrathong.id)
                        ? 'fill-white text-white animate-bounce'
                        : likedKrathongIds.includes(inspectingKrathong.id)
                        ? 'fill-pink-400 text-pink-400'
                        : 'fill-white text-white animate-pulse'
                    }`}
                  />
                  <span>
                    {inspectingKrathong.isMatchedWithMe || matches.some((m) => m.partnerKrathong.id === inspectingKrathong.id)
                      ? `ใจตรงกันแล้ว 💕 (${inspectingKrathong.likes})`
                      : likedKrathongIds.includes(inspectingKrathong.id)
                      ? `ส่งใจแล้ว (${inspectingKrathong.likes})`
                      : `ส่งหัวใจ (${inspectingKrathong.likes})`}
                  </span>
                </button>
              )}

              <button
                onClick={() => setInspectingKrathong(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-2xl text-xs font-semibold transition cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Match Celebration Modal */}
      {currentMatchPair && (
        <MatchCelebrationModal
          isOpen={isMatchCelebrationOpen}
          onClose={() => setIsMatchCelebrationOpen(false)}
          myKrathong={currentMatchPair.myKrathong}
          partnerKrathong={currentMatchPair.partnerKrathong}
          harmonyScore={currentMatchPair.score}
          harmonyTitle={currentMatchPair.title}
          onViewInRiver={() => {
            if (currentMatchPair.partnerKrathong) {
              setInspectingKrathong(currentMatchPair.partnerKrathong);
            }
          }}
        />
      )}

      {/* Match Center Modal */}
      <MatchCenterModal
        isOpen={isMatchCenterOpen}
        onClose={() => setIsMatchCenterOpen(false)}
        matches={matches}
        admirersCount={
          riverKrathongs.find((k) => k.id === myKrathongId)?.likes || 0
        }
        onSelectKrathong={(k) => setInspectingKrathong(k)}
        onOpenSingleFlow={() => {
          setSelectedMode('single');
          setView('single_form');
        }}
        hasMyKrathong={!!myKrathongId}
      />
    </main>
  );
}
