'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDialog } from '@/context/DialogContext';
import { FamilyProfile, FamilyMember, KrathongDesign } from '@/types/krathong';
import { PRESET_AVATARS } from '@/lib/imageUtils';
import { KrathongCustomizer } from './KrathongCustomizer';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Heart,
  Smile,
  Copy,
  Shuffle,
  ShieldCheck,
  PawPrint,
  ChevronDown,
} from 'lucide-react';

interface FamilyFlowProps {
  onComplete: (profile: FamilyProfile) => void;
  onBack: () => void;
}

const FAMILY_ROLE_PRESETS = [
  { label: 'คุณพ่อ', icon: '👨' },
  { label: 'คุณแม่', icon: '👩' },
  { label: 'ลูกชาย', icon: '👦' },
  { label: 'ลูกสาว', icon: '👧' },
  { label: 'คุณปู่ / คุณตา', icon: '👴' },
  { label: 'คุณย่า / คุณยาย', icon: '👵' },
  { label: 'พี่ชาย / พี่สาว', icon: '🧑' },
  { label: 'น้องชาย / น้องสาว', icon: '🧒' },
  { label: 'แฟน / คนรัก', icon: '👩‍❤️‍👨' },
  { label: 'สมาชิกครอบครัว', icon: '👤' },
];

export const PET_ROLE_PRESETS = [
  {
    type: 'dog' as const,
    label: 'น้องหมา 🐶',
    icon: '🐶',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LuckyDog&backgroundColor=ffecb5',
    defaultWish: 'ขอให้น้องหมาแข็งแรง ร่าเริง วิ่งเล่นได้ทุกวัน ไม่เจ็บไม่ป่วย 🦴',
  },
  {
    type: 'cat' as const,
    label: 'น้องแมว 🐱',
    icon: '🐱',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SomCat&backgroundColor=ffd5dc',
    defaultWish: 'ขอให้เหมียวกินอิ่มนอนอุ่น ขนสวย สุขภาพดี เป็นเจ้านายที่น่ารัก 🐾',
  },
  {
    type: 'rabbit' as const,
    label: 'น้องกระต่าย 🐰',
    icon: '🐰',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BunnyJoy&backgroundColor=d1e7dd',
    defaultWish: 'ขอให้น้องกระต่ายสดใส อารมณ์ดี อายุยืนยาว 🥕',
  },
  {
    type: 'hamster' as const,
    label: 'แฮมสเตอร์ 🐹',
    icon: '🐹',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=HammyCute&backgroundColor=e2d9f3',
    defaultWish: 'ขอให้ตัวกลมขนปุย กินเก่ง สุขภาพแข็งแรง 🌻',
  },
  {
    type: 'bird' as const,
    label: 'นกแก้ว/นก 🦜',
    icon: '🦜',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BirdySong&backgroundColor=cff4fc',
    defaultWish: 'ขอให้เสียงใส ร้องเพลงร่าเริง บินได้อย่างมีความสุข 🎶',
  },
  {
    type: 'turtle' as const,
    label: 'น้องเต่า 🐢',
    icon: '🐢',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TurtleSlow&backgroundColor=d1e7dd',
    defaultWish: 'ขอให้อายุยืนยาว ปลอดภัย ร่มเย็นเป็นสุข 🌿',
  },
  {
    type: 'fish' as const,
    label: 'ปลาสวยงาม 🐠',
    icon: '🐠',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoldFish&backgroundColor=cff4fc',
    defaultWish: 'ขอให้ว่ายน้ำอย่างมีความสุข นำพาโชคลาภมาสู่บ้าน 🌊',
  },
  {
    type: 'other' as const,
    label: '🐾 ชนิดอื่นๆ (ระบุเอง...)',
    icon: '🐾',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MyPetCute&backgroundColor=ffecb5',
    defaultWish: 'ขอให้น้องสุขภาพแข็งแรง ร่าเริง อายุยืนยาว อยู่ด้วยกันไปนานๆ 🌿',
  },
];

const FAMILY_WISH_SUGGESTIONS = [
  'ขอให้ครอบครัวและสัตว์เลี้ยงแสนรักของเราอบอุ่น ร่มเย็นเป็นสุข สุขภาพแข็งแรง ปราศจากโรคภัยตลอดไป 🏡✨',
  'ขอขมาพระแม่คงคา ดลบันดาลให้คนในบ้านและน้องๆ สี่ขาทุกตัวมีแต่ความสุข ร่ำรวย และปลอดภัย 🙏💖',
  'ขอให้บ้านเรามีแต่เสียงหัวเราะและรอยยิ้ม สัตว์เลี้ยงร่าเริงแข็งแรง รักและคอยดูแลกันตลอดไป 🐾👨‍👩‍👧‍👦',
  'ขอให้ปัญหาอุปสรรคลอยไปกับสายน้ำ นำพาแต่สิ่งดีๆ มิตรภาพ และความมั่งคั่งมาสู่ครอบครัวเรา 🌸🌊',
];

export const FamilyFlow: React.FC<FamilyFlowProps> = ({ onComplete, onBack }) => {
  const { currentUser } = useAuth();
  const { confirm, alert, toast } = useDialog();
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [familyName, setFamilyName] = useState('ครอบครัวสุขสันต์');
  const [members, setMembers] = useState<FamilyMember[]>([
    {
      id: 'mem-1',
      name: currentUser?.nickname || 'คุณพ่อ',
      role: 'คุณพ่อ',
      isPet: false,
      avatarUrl: currentUser?.avatarUrl || PRESET_AVATARS[1].url,
      wish: 'ขอให้ทุกคนในบ้านสุขภาพแข็งแรง',
    },
    {
      id: 'mem-2',
      name: 'คุณแม่',
      role: 'คุณแม่',
      isPet: false,
      avatarUrl: PRESET_AVATARS[0].url,
      wish: 'ขอให้ครอบครัวมีแต่ความสุขสมหวัง',
    },
    {
      id: 'mem-3',
      name: 'ลูกน้อย',
      role: 'ลูกสาว',
      isPet: false,
      avatarUrl: PRESET_AVATARS[4].url,
      wish: 'เรียนเก่งๆ เป็นเด็กดี',
    },
    {
      id: 'mem-4',
      name: 'เจ้าส้ม',
      role: 'น้องแมว 🐱',
      isPet: true,
      petType: 'cat',
      avatarUrl: PET_ROLE_PRESETS[1].avatar,
      wish: 'ขอให้กินอิ่มนอนหลับ ขนสวย ร่าเริง 🐾',
    },
  ]);
  const [familyWish, setFamilyWish] = useState(FAMILY_WISH_SUGGESTIONS[0]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Counts
  const humanCount = members.filter((m) => !m.isPet).length;
  const petCount = members.filter((m) => m.isPet).length;

  // Restore saved family from localStorage or currentUser
  useEffect(() => {
    try {
      const saved = localStorage.getItem('loy_krathong_saved_family_profile');
      if (saved) {
        const parsed = JSON.parse(saved) as FamilyProfile;
        if (parsed.familyName) setFamilyName(parsed.familyName);
        if (parsed.members && parsed.members.length > 0) setMembers(parsed.members);
        if (parsed.familyWish) setFamilyWish(parsed.familyWish);
      } else if (currentUser?.nickname) {
        setMembers((prev) =>
          prev.map((m, idx) =>
            idx === 0
              ? {
                  ...m,
                  name: currentUser.nickname,
                  avatarUrl: currentUser.avatarUrl || m.avatarUrl,
                }
              : m
          )
        );
      }
    } catch {}
  }, [currentUser]);

  // Krathong Design
  const [design, setDesign] = useState<KrathongDesign>({
    base: 'lotus',
    flower: 'mixed',
    candle: 'classic',
  });

  // Add Human Member
  const handleAddMember = () => {
    const nextIdx = members.length + 1;
    const defaultRole = nextIdx === 4 ? 'ลูกชาย' : 'สมาชิก';
    const newMember: FamilyMember = {
      id: `mem-${Date.now()}-${nextIdx}`,
      name: `สมาชิกคนที่ ${nextIdx}`,
      role: defaultRole,
      isPet: false,
      avatarUrl: PRESET_AVATARS[(nextIdx - 1) % PRESET_AVATARS.length].url,
      wish: 'ขอให้ครอบครัวอบอุ่นและมีความสุข',
    };
    setMembers((prev) => [...prev, newMember]);
  };

  // Add Pet Member
  const handleAddPet = (type: 'dog' | 'cat' | 'rabbit' | 'hamster' | 'bird' | 'turtle' | 'fish' | 'other' = 'dog') => {
    const currentPetCount = members.filter((m) => m.isPet).length + 1;
    const petMeta = PET_ROLE_PRESETS.find((p) => p.type === type) || PET_ROLE_PRESETS[0];
    const defaultPetNames: Record<string, string> = {
      dog: `น้องหมา (${currentPetCount})`,
      cat: `น้องแมว (${currentPetCount})`,
      rabbit: `น้องกระต่าย (${currentPetCount})`,
      hamster: `แฮมสเตอร์ (${currentPetCount})`,
      bird: `นกแก้ว (${currentPetCount})`,
      turtle: `น้องเต่า (${currentPetCount})`,
      fish: `ปลาสวยงาม (${currentPetCount})`,
      other: `สัตว์เลี้ยง (${currentPetCount})`,
    };

    const newPet: FamilyMember = {
      id: `pet-${Date.now()}-${currentPetCount}`,
      name: defaultPetNames[type] || `สัตว์เลี้ยงตัวที่ ${currentPetCount}`,
      role: petMeta.label,
      isPet: true,
      petType: type,
      customPetType: '',
      avatarUrl: petMeta.avatar,
      wish: petMeta.defaultWish,
    };
    setMembers((prev) => [...prev, newPet]);
  };

  // Select Pet Type for an existing pet member
  const handleSelectPetType = (memberId: string, type: 'dog' | 'cat' | 'rabbit' | 'hamster' | 'bird' | 'turtle' | 'fish' | 'other') => {
    const petMeta = PET_ROLE_PRESETS.find((p) => p.type === type) || PET_ROLE_PRESETS[0];
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const currentCustom = m.customPetType?.trim();
        const newRole =
          type === 'other'
            ? currentCustom
              ? `🐾 ${currentCustom}`
              : '🐾 สัตว์เลี้ยง'
            : currentCustom
            ? `${petMeta.label} (${currentCustom})`
            : petMeta.label;

        return {
          ...m,
          role: newRole,
          isPet: true,
          petType: type,
          avatarUrl: petMeta.avatar,
          wish: !m.wish || m.wish.includes('ขอให้') ? petMeta.defaultWish : m.wish,
        };
      })
    );
  };

  const handleRemoveMember = async (id: string) => {
    if (members.length <= 1) {
      alert({
        title: 'ไม่สามารถลบได้',
        message: 'กระทงครอบครัวควรมีสมาชิกอย่างน้อย 1 คนหรือสัตว์เลี้ยง 1 ตัวครับ',
        type: 'warning',
      });
      return;
    }

    const member = members.find((m) => m.id === id);
    const confirmed = await confirm({
      title: 'ลบสมาชิก',
      message: `ต้องการลบ "${member?.name || 'สมาชิกนี้'}" ออกจากกระทงครอบครัวใช่หรือไม่?`,
      confirmText: 'ลบ',
      cancelText: 'ยกเลิก',
      type: 'danger',
      icon: 'delete',
    });

    if (confirmed) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.info(`ลบ "${member?.name || 'สมาชิก'}" ออกแล้ว`);
    }
  };

  const handleUpdateMember = (id: string, field: keyof FamilyMember, val: any) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  // Quick Preset Templates
  const handleApplyPreset = (presetType: 'parents_child' | 'family_with_pets' | 'pet_lovers' | 'big_family') => {
    if (presetType === 'parents_child') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: currentUser?.nickname || 'คุณพ่อ', role: 'คุณพ่อ', isPet: false, avatarUrl: PRESET_AVATARS[1].url },
        { id: `mem-${Date.now()}-2`, name: 'คุณแม่', role: 'คุณแม่', isPet: false, avatarUrl: PRESET_AVATARS[0].url },
        { id: `mem-${Date.now()}-3`, name: 'ลูกคนเก่ง', role: 'ลูกสาว', isPet: false, avatarUrl: PRESET_AVATARS[4].url },
      ]);
    } else if (presetType === 'family_with_pets') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: currentUser?.nickname || 'คุณพ่อ', role: 'คุณพ่อ', isPet: false, avatarUrl: PRESET_AVATARS[1].url },
        { id: `mem-${Date.now()}-2`, name: 'คุณแม่', role: 'คุณแม่', isPet: false, avatarUrl: PRESET_AVATARS[0].url },
        { id: `mem-${Date.now()}-3`, name: 'ลูกน้อย', role: 'ลูกชาย', isPet: false, avatarUrl: PRESET_AVATARS[4].url },
        { id: `mem-${Date.now()}-4`, name: 'ถั่วต้ม 🐶', role: 'น้องหมา 🐶', isPet: true, petType: 'dog', avatarUrl: PET_ROLE_PRESETS[0].avatar, wish: PET_ROLE_PRESETS[0].defaultWish },
        { id: `mem-${Date.now()}-5`, name: 'เจ้าส้ม 🐱', role: 'น้องแมว 🐱', isPet: true, petType: 'cat', avatarUrl: PET_ROLE_PRESETS[1].avatar, wish: PET_ROLE_PRESETS[1].defaultWish },
      ]);
    } else if (presetType === 'pet_lovers') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: currentUser?.nickname || 'พ่อแมวแม่หมา', role: 'คุณพ่อ/ทาสรัก', isPet: false, avatarUrl: PRESET_AVATARS[1].url, wish: 'ขอให้ลูกๆ สี่ขาทุกตัวอยู่ด้วยกันอย่างมีความสุข' },
        { id: `mem-${Date.now()}-2`, name: 'มอมแมม 🐶', role: 'น้องหมา 🐶', isPet: true, petType: 'dog', avatarUrl: PET_ROLE_PRESETS[0].avatar, wish: 'ขอให้สุขภาพแข็งแรง วิ่งเล่นสนุกทุกวัน 🦴' },
        { id: `mem-${Date.now()}-3`, name: 'น้องชาโคล 🐱', role: 'น้องแมว 🐱', isPet: true, petType: 'cat', avatarUrl: PET_ROLE_PRESETS[1].avatar, wish: 'ขอให้กินอิ่มนอนอุ่น ขนสวย สุขภาพดี 🐾' },
      ]);
    } else if (presetType === 'big_family') {
      setMembers([
        { id: `mem-${Date.now()}-1`, name: 'คุณปู่/คุณตา', role: 'คุณปู่/ตา', isPet: false, avatarUrl: PRESET_AVATARS[3].url },
        { id: `mem-${Date.now()}-2`, name: 'คุณย่า/คุณยาย', role: 'คุณย่า/ยาย', isPet: false, avatarUrl: PRESET_AVATARS[5].url },
        { id: `mem-${Date.now()}-3`, name: currentUser?.nickname || 'คุณพ่อ', role: 'คุณพ่อ', isPet: false, avatarUrl: PRESET_AVATARS[1].url },
        { id: `mem-${Date.now()}-4`, name: 'คุณแม่', role: 'คุณแม่', isPet: false, avatarUrl: PRESET_AVATARS[0].url },
        { id: `mem-${Date.now()}-5`, name: 'ลูกน้อย', role: 'ลูกชาย', isPet: false, avatarUrl: PRESET_AVATARS[4].url },
        { id: `mem-${Date.now()}-6`, name: 'นกแก้วรวยโชค 🦜', role: 'นกแก้ว/นก 🦜', isPet: true, petType: 'bird', avatarUrl: PET_ROLE_PRESETS[4].avatar, wish: PET_ROLE_PRESETS[4].defaultWish },
      ]);
    }
  };

  // Share / Copy Invite Link
  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined') {
      const inviteUrl = `${window.location.origin}/?join_family=${encodeURIComponent(familyName)}`;
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      toast.success('คัดลอกลิงก์ชวนครอบครัวเรียบร้อยแล้ว! 🔗');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Random wish generator
  const handleRandomWish = () => {
    const randomItem =
      FAMILY_WISH_SUGGESTIONS[
        Math.floor(Math.random() * FAMILY_WISH_SUGGESTIONS.length)
      ];
    setFamilyWish(randomItem);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
      alert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อครอบครัว เช่น ครอบครัวสุขสันต์',
        type: 'warning',
      });
      return;
    }
    const hasEmptyName = members.some((m) => !m.name.trim());
    if (hasEmptyName) {
      alert({
        title: 'ข้อมูลไม่ครบถ้วน',
        message: 'กรุณากรอกชื่อของสมาชิกทุกคนและสัตว์เลี้ยงให้ครบถ้วนครับ',
        type: 'warning',
      });
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    const finalAvatar = members[0]?.avatarUrl || currentUser?.avatarUrl || PRESET_AVATARS[1].url;
    const profile: FamilyProfile = {
      id: 'fam-' + Date.now(),
      mode: 'family',
      familyName: familyName.trim(),
      members: members.map((m) => ({
        ...m,
        name: m.name.trim(),
        role: m.role || (m.isPet ? 'สัตว์เลี้ยงแสนรัก 🐾' : 'สมาชิก'),
      })),
      familyWish: familyWish.trim() || 'ขอให้ครอบครัวและสัตว์เลี้ยงของเราอบอุ่น มีความสุข และสุขภาพแข็งแรงตลอดไป 🏡🐾✨',
      inviteCode: 'FAM' + Math.floor(1000 + Math.random() * 9000),
      avatarUrl: finalAvatar,
      design,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('loy_krathong_saved_family_profile', JSON.stringify(profile));
    } catch {}

    onComplete(profile);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 1
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>1</span>
          <span>คนในบ้าน & สัตว์เลี้ยงแสนรัก 🐾</span>
        </div>
        <div className="w-6 h-0.5 bg-slate-700" />
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            step === 2
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          <span>2</span>
          <span>แต่งกระทงรวมใจครอบครัว</span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: Family Name, Members & Pet Management */
        <form
          onSubmit={handleNextStep}
          className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-left space-y-6"
        >
          {/* Header Title */}
          <div className="text-center pb-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1 rounded-full mb-3">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>ลอยกระทงครอบครัวรวมใจ ทั้งคนและสัตว์เลี้ยงแสนรัก</span>
              <PawPrint className="w-3.5 h-3.5 text-amber-400 ml-0.5" />
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-200">
              บันทึกชื่อครอบครัว & สัตว์เลี้ยงแสนรัก
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-lg mx-auto">
              แอดเพิ่มได้ทั้งพ่อ แม่ ลูก ปู่ ย่า ตา ยาย รวมถึงน้องหมา น้องแมว สัตว์เลี้ยงตัวโปรด
              ร่วมลงเรือกระทงใบเดียวกัน ขอพรให้แข็งแรงและอยู่ด้วยกันอย่างมีความสุข
            </p>
          </div>

          {/* Family Name Input */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 sm:p-5 rounded-2xl">
            <label className="block text-sm font-bold text-amber-300 mb-1.5">
              ชื่อครอบครัว / ซุ้มบ้าน <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="เช่น ครอบครัวอารีย์กุล & แก๊งสี่ขา, บ้านสุขสันต์ใจดี"
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-semibold"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>ชื่อนี้จะแสดงเด่นอยู่เหนือกะทงบนสายน้ำ</span>
              <span className="text-amber-300 font-semibold">
                รวมสมาชิก: {humanCount} คน {petCount > 0 && `+ 🐾 สัตว์เลี้ยง ${petCount} ตัว`}
              </span>
            </div>
          </div>

          {/* Quick Presets & Invite Bar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">💌</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">
                    ชวนคนในครอบครัวมาร่วมลอยด้วยกัน
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    แชร์ลิงก์ส่งเข้า LINE กลุ่มครอบครัว เพื่อชวนทุกคนเข้ามาดูหรือแอดชื่อ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyInviteLink}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shrink-0 active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span>คัดลอกลิงก์แล้ว!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์เชิญ</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Template Buttons */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-amber-500/15 overflow-x-auto text-[11px]">
              <span className="text-slate-400 shrink-0">เทมเพลตด่วน:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('family_with_pets')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-lg transition whitespace-nowrap font-medium"
              >
                👨‍👩‍👧🐾 ครอบครัว + สัตว์เลี้ยง
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('pet_lovers')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2.5 py-1 rounded-lg transition whitespace-nowrap"
              >
                🧑🐾 ทาสรักหมาแมว
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('parents_child')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2.5 py-1 rounded-lg transition whitespace-nowrap"
              >
                👨‍👩‍👧 พ่อ-แม่-ลูก
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('big_family')}
                className="bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 px-2.5 py-1 rounded-lg transition whitespace-nowrap"
              >
                👴👵 ครอบครัวใหญ่
              </button>
            </div>
          </div>

          {/* Members Dynamic List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>สมาชิกครอบครัว & สัตว์เลี้ยง</span>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full text-xs font-black">
                  {humanCount} คน {petCount > 0 && `• 🐾 ${petCount} ตัว`}
                </span>
              </label>

              {/* Action Buttons: Add Human OR Add Pet */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition transform hover:scale-102 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ เพิ่มคนในบ้าน</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPet('dog')}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-md transition transform hover:scale-102 active:scale-95"
                >
                  <PawPrint className="w-3.5 h-3.5 fill-slate-950" />
                  <span>+ เพิ่มสัตว์เลี้ยง 🐾</span>
                </button>
              </div>
            </div>

            {/* Member Cards */}
            <div className="space-y-3">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className={`border p-4 rounded-2xl space-y-3 transition group ${
                    member.isPet
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.08)]'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      {/* Avatar preview */}
                      <div className="relative shrink-0">
                        {member.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className={`w-11 h-11 rounded-full object-cover shadow ${
                              member.isPet
                                ? 'border-2 border-orange-400 bg-amber-500/10'
                                : 'border border-amber-400'
                            }`}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                            {member.isPet ? '🐾' : '👤'}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border ${
                            member.isPet
                              ? 'bg-orange-500 text-white border-orange-300'
                              : 'bg-slate-900 border-slate-700 text-amber-300'
                          }`}
                        >
                          {member.isPet ? '🐾' : idx + 1}
                        </span>
                      </div>

                      {/* Name Input & Pet Indicator */}
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {member.isPet ? (
                            <span className="bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[10px] font-black px-2 py-0.2 rounded-md flex items-center gap-1">
                              <PawPrint className="w-2.5 h-2.5" /> สัตว์เลี้ยงแสนรัก
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              สมาชิกคนที่ {idx + 1}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={25}
                          value={member.name}
                          onChange={(e) =>
                            handleUpdateMember(member.id, 'name', e.target.value)
                          }
                          placeholder={
                            member.isPet
                              ? 'เช่น เจ้าส้ม, น้องถั่วต้ม, มอมแมม'
                              : `ชื่อสมาชิกคนที่ ${idx + 1}`
                          }
                          className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-amber-400 font-medium"
                        />
                      </div>
                    </div>

                    {/* Delete button */}
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800/80 transition"
                        title={member.isPet ? 'ลบสัตว์เลี้ยงตัวนี้' : 'ลบสมาชิกคนนี้'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Role or Pet Type Selector as Dropdown */}
                  {member.isPet ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <label className="text-orange-300 text-xs font-semibold shrink-0 flex items-center gap-1">
                          <PawPrint className="w-3.5 h-3.5" />
                          <span>ชนิดสัตว์เลี้ยง:</span>
                        </label>
                        <div className="relative flex-1">
                          <select
                            value={member.petType || 'dog'}
                            onChange={(e) => handleSelectPetType(member.id, e.target.value as any)}
                            className="w-full bg-slate-900/90 hover:bg-slate-900 border border-orange-500/40 hover:border-orange-400 focus:border-orange-400 text-orange-200 rounded-xl px-3 py-2 text-xs font-semibold outline-hidden appearance-none cursor-pointer transition shadow-sm pr-8"
                          >
                            {PET_ROLE_PRESETS.map((p) => (
                              <option key={p.type} value={p.type} className="bg-slate-900 text-slate-100 py-1">
                                {p.icon} {p.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-orange-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* ช่องพิมพ์ชนิดหรือสายพันธุ์สัตว์เลี้ยงเอง */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 bg-orange-950/20 border border-orange-500/20 p-2 rounded-xl">
                        <span className="text-[11px] text-orange-300 font-medium shrink-0 flex items-center gap-1">
                          <span>✍️</span>
                          <span>
                            {member.petType === 'other'
                              ? 'พิมพ์ระบุชนิดสัตว์เลี้ยง:'
                              : 'พิมพ์ระบุสายพันธุ์/ชนิดเอง:'}
                          </span>
                        </span>
                        <input
                          type="text"
                          maxLength={35}
                          value={member.customPetType || ''}
                          onChange={(e) => {
                            const custom = e.target.value;
                            setMembers((prev) =>
                              prev.map((m) => {
                                if (m.id !== member.id) return m;
                                const baseMeta = PET_ROLE_PRESETS.find(
                                  (p) => p.type === member.petType
                                );
                                const baseLabel =
                                  member.petType && member.petType !== 'other'
                                    ? baseMeta?.label || 'สัตว์เลี้ยง'
                                    : '';
                                const finalRole = custom.trim()
                                  ? baseLabel
                                    ? `${baseLabel} (${custom.trim()})`
                                    : `🐾 ${custom.trim()}`
                                  : baseLabel || 'สัตว์เลี้ยง 🐾';

                                return {
                                  ...m,
                                  customPetType: custom,
                                  role: finalRole,
                                };
                              })
                            );
                          }}
                          placeholder={
                            member.petType === 'other'
                              ? 'เช่น เม่นแคระ, ชูการ์ไรเดอร์, กิ้งก่า, หนูแกสบี้, เป็ด'
                              : member.petType === 'dog'
                              ? 'เช่น โกลเด้น, ปอมเมอเรเนียน, ไซบีเรียน, ชิวาวา'
                              : member.petType === 'cat'
                              ? 'เช่น แมวส้ม, สก็อตติช, เปอร์เซีย, ขาวมณี'
                              : 'พิมพ์ชนิดหรือสายพันธุ์ที่ต้องการ เช่น พันธุ์ผสม'
                          }
                          className="flex-1 bg-slate-900 border border-orange-500/30 hover:border-orange-400 focus:border-orange-400 text-orange-100 placeholder-slate-500 rounded-xl px-3 py-1.5 text-xs outline-hidden font-medium transition"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                      <label className="text-slate-300 text-xs font-semibold shrink-0 flex items-center gap-1">
                        <span>บทบาทในครอบครัว:</span>
                      </label>
                      <div className="relative flex-1">
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateMember(member.id, 'role', e.target.value)}
                          className="w-full bg-slate-900/90 hover:bg-slate-900 border border-slate-700 hover:border-amber-400 focus:border-amber-400 text-amber-200 rounded-xl px-3 py-2 text-xs font-semibold outline-hidden appearance-none cursor-pointer transition shadow-sm pr-8"
                        >
                          {FAMILY_ROLE_PRESETS.map((r) => (
                            <option key={r.label} value={r.label} className="bg-slate-900 text-slate-100 py-1">
                              {r.icon} {r.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Optional Personal Wish */}
                  <div>
                    <input
                      type="text"
                      maxLength={60}
                      value={member.wish || ''}
                      onChange={(e) =>
                        handleUpdateMember(member.id, 'wish', e.target.value)
                      }
                      placeholder={
                        member.isPet
                          ? 'คำอธิษฐานให้น้อง เช่น ขอให้สุขภาพแข็งแรง วิ่งเล่นสนุก อายุยืนยาว'
                          : 'คำขอพรส่วนตัว (ไม่บังคับ เช่น ขอให้สุขภาพดี, สอบติด)'
                      }
                      className="w-full bg-slate-900/60 border border-slate-800 text-slate-300 placeholder-slate-600 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Add Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleAddMember}
                className="py-2.5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-teal-400/60 text-slate-400 hover:text-teal-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition bg-slate-950/30"
              >
                <Plus className="w-4 h-4" />
                <span>+ เพิ่มคนในครอบครัว</span>
              </button>

              <button
                type="button"
                onClick={() => handleAddPet('dog')}
                className="py-2.5 rounded-2xl border-2 border-dashed border-orange-500/40 hover:border-orange-400 text-orange-300/80 hover:text-orange-300 text-xs font-bold flex items-center justify-center gap-1.5 transition bg-orange-950/20"
              >
                <PawPrint className="w-4 h-4" />
                <span>+ เพิ่มสัตว์เลี้ยงแสนรัก (หมา/แมว/สัตว์เลี้ยง) 🐾</span>
              </button>
            </div>
          </div>

          {/* Family Wish */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-200">
                คำอธิษฐานรวมของครอบครัว & สัตว์เลี้ยง <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleRandomWish}
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 hover:underline"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>สุ่มคำอวยพรมงคล</span>
              </button>
            </div>

            <textarea
              rows={3}
              required
              maxLength={250}
              value={familyWish}
              onChange={(e) => setFamilyWish(e.target.value)}
              placeholder="เขียนคำขอพรให้ครอบครัวและสัตว์เลี้ยงของคุณ..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-2xl p-4 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400 leading-relaxed"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1">
              {familyWish.length}/250 ตัวอักษร
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-7 py-3 rounded-2xl text-xs sm:text-sm font-extrabold shadow-xl transition transform hover:scale-102 active:scale-98"
            >
              <span>ถัดไป: ตกแต่งกระทงครอบครัว</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        /* STEP 2: Customizing the Family Krathong */
        <div className="bg-slate-900/90 border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6">
          <div className="pb-1">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              กระทงรวมใจครอบครัว ({humanCount} คน {petCount > 0 && `+ 🐾 ${petCount} ตัว`})
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-200">
              แต่งกระทงของ {familyName}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              เลือกฐานกระทง ดอกไม้มงคล และแสงเทียนนำทางชีวิตให้กับคนในบ้านและสัตว์เลี้ยงทุกคน
            </p>
          </div>

          {/* Interactive Krathong Customizer */}
          <KrathongCustomizer
            design={design}
            onChange={setDesign}
            isFamily={true}
            name={familyName}
          />

          {/* Preview of Family Members & Pets in Krathong */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl max-w-lg mx-auto text-left">
            <div className="text-xs font-bold text-amber-300 mb-2 flex items-center justify-between">
              <span>👨‍👩‍👧‍👦 รวมผู้ร่วมลอยในกระทงใบนี้:</span>
              <span className="text-[11px] text-slate-400">
                {humanCount} คน {petCount > 0 && `• 🐾 สัตว์เลี้ยง ${petCount} ตัว`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {members.map((m) => (
                <span
                  key={m.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${
                    m.isPet
                      ? 'bg-orange-950/60 border border-orange-500/40 text-orange-200'
                      : 'bg-slate-900 border border-slate-700 text-slate-200'
                  }`}
                >
                  <span className={`text-[11px] ${m.isPet ? 'text-orange-300' : 'text-amber-400'}`}>
                    {m.role}:
                  </span>
                  <span className="font-semibold">{m.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" /> แก้ไขรายชื่อ & สัตว์เลี้ยง
            </button>

            <button
              onClick={handleFinish}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 px-8 py-3.5 rounded-2xl text-sm sm:text-base font-extrabold shadow-xl shadow-amber-500/25 transition transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>ปล่อยกระทงครอบครัวลงสู่สายน้ำ 🌊</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
