'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Users,
  User,
  LogIn,
  ShieldCheck,
  ArrowRight,
  Flame,
  KeyRound,
  Compass,
} from 'lucide-react';

export type FloatGuideTab = 'single' | 'couple' | 'family' | 'rules';

interface HowToFloatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: FloatGuideTab;
  onStartSingle: () => void;
  onStartCouple: () => void;
  onStartFamily: () => void;
  onOpenAuth: () => void;
}

export const HowToFloatModal: React.FC<HowToFloatModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'single',
  onStartSingle,
  onStartCouple,
  onStartFamily,
  onOpenAuth,
}) => {
  const [activeTab, setActiveTab] = useState<FloatGuideTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-2xl my-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-left overflow-hidden">
        {/* Decorative Top Ambient Light */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition cursor-pointer z-10"
          title="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 relative">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>คู่มือเทศกาลลอยกระทงออนไลน์ ๒๕๖๙</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
            แนะนำวิธีการลอยกระทงแบบต่างๆ
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            เลือกโหมดที่เหมาะกับคุณ เพื่อส่งความปรารถนาและลอยสะท้อนบนสายน้ำเดียวกัน
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>💖</span>
            <span>ลอยคนโสด</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('couple')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'couple'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>👩‍❤️‍👨</span>
            <span>ลอยคู่รัก</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('family')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'family'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>👨‍👩‍👧‍👦</span>
            <span>ครอบครัว</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>📜</span>
            <span>กติกา 1 คน 1 ใบ</span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: SINGLE MODE                                        */}
        {/* ========================================================= */}
        {activeTab === 'single' && (
          <div className="space-y-4 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-transparent border border-pink-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                💖
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-pink-200 flex items-center gap-2">
                  <span>ลอยคนโสด — หาคู่ดวงสมพงษ์ & ใจตรงกัน</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  สำหรับคนโสดที่อยากปล่อยความทุกข์ เขียนคำอธิษฐาน และลุ้นพบคนที่ธาตุสมพงษ์กันในสายน้ำ พร้อมระบบสลับเปิดวาร์ปเมื่อใจตรงกัน!
                </p>
              </div>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[11px]">1</span>
                  <span>กรอกข้อมูล & ราศีประจำตัว</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ใส่ชื่อเล่น วันเกิด และราศี ระบบจะคำนวณ <strong>ธาตุประจำตัว (ดิน น้ำ ลม ไฟ)</strong> พร้อมสเปกที่ตามหา
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[11px]">2</span>
                  <span>ออกแบบกระทง & ใส่คำอธิษฐาน</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  เลือกฐานกระทง ดอกไม้มงคล เทียนสว่างไสว พร้อมเขียนคำอธิษฐานจากใจลงในกระทง
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[11px]">3</span>
                  <span>จับคู่ดวงสมพงษ์ในแม่น้ำ</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ระบบจะจับคู่กระทงของคุณกับผู้ลอยท่านอื่นที่มีธาตุและดวงสมพงษ์กันมากที่สุด
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-[11px]">4</span>
                  <span>กดหัวใจ ❤️ ปลดล็อกใจตรงกัน</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  หากคุณกดใจให้กระทงใคร และเขาคนนั้นก็กดใจให้คุณ ระบบจะเปิดกล่องวาร์ปแลก IG/FB ทันที!
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartSingle();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-pink-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💖 เริ่มลอยคนโสดทันที</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: COUPLE MODE                                        */}
        {/* ========================================================= */}
        {activeTab === 'couple' && (
          <div className="space-y-4 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shrink-0">
                👩‍❤️‍👨
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-rose-200">
                  ลอยคู่รัก — ชวนแฟนมาลอยด้วยกันผ่านรหัสห้อง
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ไม่ว่าจะนั่งข้างกัน หรืออยู่ไกลคนละจังหวัด/ต่างประเทศ ก็สามารถลอยกระทงคู่ใบเดียวกันได้แบบ Real-time พร้อมข้อความรักหวานซึ้ง
                </p>
              </div>
            </div>

            {/* 3 Methods */}
            <div className="space-y-2.5">
              <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                    สร้างห้องชวนแฟน (ได้รหัสห้อง CP-XXXX)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    คุณกดสร้างห้อง กรอกชื่อและคำอธิษฐานของคุณ ระบบจะสร้างรหัสห้องเช่น <strong className="text-amber-300">CP-8492</strong> พร้อมปุ่มคัดลอกลิงก์ส่งให้แฟนใน Line/Messenger ได้ทันที
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                    มีรหัสห้องแล้ว (เข้าร่วมห้องแฟน)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    นำรหัสห้องที่แฟนส่งให้มากรอก ระบบจะดึงกระทงและชื่อของแฟนขึ้นมาให้คุณร่วมเขียนข้อความรักและส่งลงน้ำคู่กัน
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-3.5 flex items-start gap-3">
                <span className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-rose-200">
                    ลอยคู่ทันที (เครื่องเดียวสำหรับคนนั่งข้างกัน)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    เหมาะสำหรับคู่รักที่นั่งเล่นด้วยกัน กรอกชื่อทั้ง 2 คนและคำอวยพรพร้อมกันได้เลยในหน้าเดียว
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartCouple();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-rose-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👩‍❤️‍👨 เริ่มสร้างห้องหรือลอยคู่รัก</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FAMILY MODE                                        */}
        {/* ========================================================= */}
        {activeTab === 'family' && (
          <div className="space-y-4 animate-fade-in">
            {/* Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center text-2xl shadow-lg shrink-0">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-200">
                  ลอยครอบครัว — รวมใจและคำอธิษฐานคนในบ้าน
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  สำหรับครอบครัว แก๊งเพื่อนสนิท หรือกลุ่มทำงาน ร่วมกันลอยกระทงใบใหญ่พิเศษ สว่างไสว รวมชื่อทุกคนในบ้านเพื่อความสุขและความอบอุ่น
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="text-2xl">🏡</div>
                <div className="text-xs font-bold text-amber-300">ระบุชื่อตระกูล / บ้าน</div>
                <p className="text-[11px] text-slate-400">
                  เช่น &quot;ครอบครัวใจดี&quot;, &quot;บ้านสุขสันต์&quot;
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="text-2xl">👥</div>
                <div className="text-xs font-bold text-amber-300">เพิ่มชื่อสมาชิกทุกคน</div>
                <p className="text-[11px] text-slate-400">
                  ใส่ชื่อพ่อ แม่ ลูก หลาน หรือเพื่อนๆ ได้ครบทุกคน
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 text-center space-y-1.5">
                <div className="text-2xl">🪷</div>
                <div className="text-xs font-bold text-amber-300">กระทงขนาดใหญ่พิเศษ</div>
                <p className="text-[11px] text-slate-400">
                  เปล่งประกายด้วยแสงสีทอง อบอุ่นและโดดเด่นในสายน้ำ
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartFamily();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>👨‍👩‍👧‍👦 เริ่มลอยครอบครัว</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: RULES & ACCOUNT                                    */}
        {/* ========================================================= */}
        {activeTab === 'rules' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1 Person 1 Krathong Rule */}
            <div className="bg-gradient-to-r from-indigo-500/15 via-cyan-500/10 to-transparent border border-cyan-500/30 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shrink-0">
                🌕
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-cyan-200">
                  กติกาเทศกาล: 1 ท่านสามารถลอยได้ 1 ใบ
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  เพื่อร่วมกันจำลองการอนุรักษ์สิ่งแวดล้อมและดูแลความสะอาดของแม่น้ำสายธาร ระบบจึงกำหนดให้ 1 ท่านมีกระทงในสายน้ำได้ 1 ใบ
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>ต้องการลอยใหม่ทำอย่างไร?</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  หากคุณมีกระทงในสายน้ำอยู่แล้ว เมื่อกดลอยใบใหม่ ระบบจะมีปุ่มให้เลือกว่าจะ <strong>&quot;ลอยใหม่ (แทนที่ใบเดิม)&quot;</strong> หรือ <strong>&quot;ดูกระทงเดิมของฉัน&quot;</strong> ได้ทันที
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>เข้าสู่ระบบเพื่อค้นหากระทงจากเครื่องไหนก็ได้</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ไม่ว่าจะเปิดเว็บจากมือถือ ไอแพด หรือคอมพิวเตอร์เครื่องอื่น เพียงกด <strong>&quot;เข้าสู่ระบบ&quot;</strong> แล้วกรอก <strong>ชื่อเล่นของคุณ</strong> ระบบจะค้นหากระทงของคุณในแม่น้ำและวาร์ปกล้องไปแสดงให้ทันที
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>ปุ่ม &quot;ดูกระทงของฉัน&quot; บนแผนที่แม่น้ำ</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  กดปุ่มสีทอง <strong>&quot;ดูกระทงของฉัน (1/1 ใบ)&quot;</strong> ที่แถบด้านบนของแผนที่ เพื่อเลื่อนกล้องและโฟกัสไปที่กระทงของคุณพร้อมยอดหัวใจได้อย่างรวดเร็ว
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ / จัดการโปรไฟล์</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
