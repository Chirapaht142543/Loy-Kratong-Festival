'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FESTIVAL_PIERS, PierLocation } from '@/types/map';
import { RiverKrathongItem } from './MainRiverView';
import { Krathong2D } from './Krathong2D';
import { RiverSvgLandscape } from './RiverSvgLandscape';
import { RiverPiersLayer } from './RiverPiersLayer';
import {
  MAP_WORLD_WIDTH,
  MAP_WORLD_HEIGHT,
  RIVER_WIDTH,
  getRiverCenterlinePath,
  getRiverPoint,
  getKrathongCoordinates,
} from '@/lib/riverSpline';
import {
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Heart,
  Navigation,
  MapPin,
  X,
  Search,
  SlidersHorizontal,
  Layers,
  Eye,
  Play,
  Pause,
  HelpCircle,
  Maximize2,
  Waves,
  Flame,
  ChevronDown,
} from 'lucide-react';

interface InteractiveRiverMapProps {
  krathongs: RiverKrathongItem[];
  myKrathongId?: string | null;
  onFloatSingleAtPier: (pier: PierLocation) => void;
  onFloatCoupleAtPier: (pier: PierLocation) => void;
  onFloatFamilyAtPier?: (pier: PierLocation) => void;
  onSelectKrathong: (krathong: RiverKrathongItem) => void;
}

export const InteractiveRiverMap: React.FC<InteractiveRiverMapProps> = ({
  krathongs,
  myKrathongId,
  onFloatSingleAtPier,
  onFloatCoupleAtPier,
  onFloatFamilyAtPier,
  onSelectKrathong,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mounted & Container size tracking (prevents SSR hydration mismatch)
  const [isMounted, setIsMounted] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 1440, h: 900 });

  // Pan & Zoom State
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: -700, y: -350 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch pinch state
  const touchPinchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);

  // Smooth camera animation ref
  const animFrameRef = useRef<number | null>(null);

  // River flow simulation state
  const [isFlowing, setIsFlowing] = useState(true);
  const [riverFlowTime, setRiverFlowTime] = useState(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Search & Filter State
  const [filterMode, setFilterMode] = useState<'all' | 'single' | 'couple' | 'family'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Selected Pier Drawer
  const [activePier, setActivePier] = useState<PierLocation | null>(null);

  // Active Highlighted Krathong ID
  const [focusedKrathongId, setFocusedKrathongId] = useState<string | null>(null);

  // Hovered Krathong for big profile preview card
  const [hoveredKrathongId, setHoveredKrathongId] = useState<string | null>(null);

  // Prompt modal when user has not floated a Krathong yet
  const [isNoMyKrathongModalOpen, setIsNoMyKrathongModalOpen] = useState(false);

  // Pan bounds strict clamp: ensures canvas edge is NEVER exposed inside viewport when zoomed in
  const clampPan = useCallback(
    (newX: number, newY: number, curZoom: number) => {
      const w = containerSize.w;
      const h = containerSize.h;
      const worldW = MAP_WORLD_WIDTH * curZoom;
      const worldH = MAP_WORLD_HEIGHT * curZoom;

      let clampedX: number;
      if (worldW <= w) {
        clampedX = (w - worldW) / 2;
      } else {
        clampedX = Math.max(w - worldW, Math.min(0, newX));
      }

      let clampedY: number;
      if (worldH <= h) {
        clampedY = (h - worldH) / 2;
      } else {
        clampedY = Math.max(h - worldH, Math.min(0, newY));
      }

      return { x: clampedX, y: clampedY };
    },
    [containerSize]
  );

  // Center view on initial mount
  useEffect(() => {
    setIsMounted(true);
    if (containerRef.current) {
      const w = containerRef.current.clientWidth || 1440;
      const h = containerRef.current.clientHeight || 900;
      setContainerSize({ w, h });
      const initialZoom = w < 640 ? 0.45 : w < 1024 ? 0.68 : 0.85;
      setZoom(initialZoom);
      const rawX = w / 2 - 1900 * initialZoom;
      const rawY = h / 2 - 1200 * initialZoom;
      const worldW = MAP_WORLD_WIDTH * initialZoom;
      const worldH = MAP_WORLD_HEIGHT * initialZoom;
      const clampedX = worldW <= w ? (w - worldW) / 2 : Math.max(w - worldW, Math.min(0, rawX));
      const clampedY = worldH <= h ? (h - worldH) / 2 : Math.max(h - worldH, Math.min(0, rawY));
      setPan({ x: clampedX, y: clampedY });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth River Current Animation Loop with 35 FPS frame pacing (eliminates React CPU thrashing)
  useEffect(() => {
    let frameId: number;
    let lastRenderTime = performance.now();
    const TARGET_FPS = 35; // Majestic slow drift at 35 FPS saves over 60% CPU
    const frameInterval = 1000 / TARGET_FPS;

    const updateFlow = (now: number) => {
      frameId = requestAnimationFrame(updateFlow);
      if (!isFlowing) return;

      const elapsed = now - lastRenderTime;
      if (elapsed >= frameInterval) {
        lastRenderTime = now - (elapsed % frameInterval);
        const dt = elapsed / 1000;
        setRiverFlowTime((prev) => (prev + dt * 0.0035) % 1);
      }
    };

    frameId = requestAnimationFrame(updateFlow);
    return () => cancelAnimationFrame(frameId);
  }, [isFlowing]);

  // Smooth camera glide to target coordinates
  const glideTo = useCallback(
    (targetWorldX: number, targetWorldY: number, targetZoom?: number) => {
      if (!containerRef.current) return;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      const w = containerSize.w;
      const h = containerSize.h;
      const finalZoom = targetZoom ?? zoom;
      const rawPanX = w / 2 - targetWorldX * finalZoom;
      const rawPanY = h / 2 - targetWorldY * finalZoom;
      const { x: targetPanX, y: targetPanY } = clampPan(rawPanX, rawPanY, finalZoom);

      const startPanX = pan.x;
      const startPanY = pan.y;
      const startZoom = zoom;

      const startTime = performance.now();
      const duration = 650; // ms

      const step = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);

        setPan({
          x: startPanX + (targetPanX - startPanX) * ease,
          y: startPanY + (targetPanY - startPanY) * ease,
        });
        setZoom(startZoom + (finalZoom - startZoom) * ease);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        }
      };

      animFrameRef.current = requestAnimationFrame(step);
    },
    [pan, zoom, containerSize, clampPan]
  );

  // Fly to Pier
  const flyToPier = useCallback(
    (pier: PierLocation) => {
      setActivePier(pier);
      glideTo(pier.x, pier.y, 1.15);
    },
    [glideTo]
  );

  // Fly to Krathong
  const flyToKrathong = useCallback(
    (k: RiverKrathongItem, worldCoords: { x: number; y: number }) => {
      setFocusedKrathongId(k.id);
      glideTo(worldCoords.x, worldCoords.y, 1.45);
    },
    [glideTo]
  );

  // Performance: rAF throttling refs for pointer events
  const mouseRafRef = useRef<number | null>(null);
  const touchRafRef = useRef<number | null>(null);

  // Mouse Pan Handlers with rAF Throttling
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-el')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      if (mouseRafRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null;
        const clamped = clampPan(clientX - dragStart.x, clientY - dragStart.y, zoom);
        setPan(clamped);
      });
    },
    [isDragging, dragStart, zoom, clampPan]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Touch Pan & Pinch Zoom Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-el')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
      touchPinchRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      touchPinchRef.current = { dist, center };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      if (touchRafRef.current) return;
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      touchRafRef.current = requestAnimationFrame(() => {
        touchRafRef.current = null;
        const clamped = clampPan(
          clientX - dragStart.x,
          clientY - dragStart.y,
          zoom
        );
        setPan(clamped);
      });
    } else if (e.touches.length === 2 && touchPinchRef.current && containerRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const scaleDelta = dist / touchPinchRef.current.dist;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = touchPinchRef.current.center.x - rect.left;
      const mouseY = touchPinchRef.current.center.y - rect.top;

      setZoom((prevZoom) => {
        const nextZoom = Math.max(0.35, Math.min(2.2, prevZoom * scaleDelta));
        const ratio = nextZoom / prevZoom;
        setPan((prevPan) => {
          const rawX = mouseX - (mouseX - prevPan.x) * ratio;
          const rawY = mouseY - (mouseY - prevPan.y) * ratio;
          return clampPan(rawX, rawY, nextZoom);
        });
        return nextZoom;
      });

      touchPinchRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchPinchRef.current = null;
  };

  // Freeze krathong drift while hovered so it does not drift away from the cursor
  const frozenCoordsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Non-passive Wheel Zoom centered at cursor (eliminates browser console warnings)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      setZoom((prevZoom) => {
        const nextZoom = Math.max(0.35, Math.min(2.2, prevZoom * zoomFactor));
        const ratio = nextZoom / prevZoom;
        setPan((prevPan) => {
          const rawX = mouseX - (mouseX - prevPan.x) * ratio;
          const rawY = mouseY - (mouseY - prevPan.y) * ratio;
          return clampPan(rawX, rawY, nextZoom);
        });
        return nextZoom;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [clampPan]);

  // Button Zoom Helpers
  const handleZoomIn = () => {
    const w = containerSize.w;
    const h = containerSize.h;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(2.2, prevZoom * 1.25);
      const ratio = nextZoom / prevZoom;
      setPan((prevPan) => {
        const rawX = w / 2 - (w / 2 - prevPan.x) * ratio;
        const rawY = h / 2 - (h / 2 - prevPan.y) * ratio;
        return clampPan(rawX, rawY, nextZoom);
      });
      return nextZoom;
    });
  };

  const handleZoomOut = () => {
    const w = containerSize.w;
    const h = containerSize.h;
    setZoom((prevZoom) => {
      const nextZoom = Math.max(0.35, prevZoom / 1.25);
      const ratio = nextZoom / prevZoom;
      setPan((prevPan) => {
        const rawX = w / 2 - (w / 2 - prevPan.x) * ratio;
        const rawY = h / 2 - (h / 2 - prevPan.y) * ratio;
        return clampPan(rawX, rawY, nextZoom);
      });
      return nextZoom;
    });
  };

  // Cycle zoom presets when clicking percentage pill (100% -> 150% -> 65% -> 100%)
  const handleCycleZoomPreset = () => {
    const currentPercent = Math.round(zoom * 100);
    let nextPreset = 1.0;
    if (Math.abs(currentPercent - 100) < 10) nextPreset = 1.5;
    else if (Math.abs(currentPercent - 150) < 10) nextPreset = 0.65;
    else nextPreset = 1.0;

    const w = containerSize.w;
    const h = containerSize.h;
    const ratio = nextPreset / zoom;
    setZoom(nextPreset);
    setPan((prevPan) => {
      const rawX = w / 2 - (w / 2 - prevPan.x) * ratio;
      const rawY = h / 2 - (h / 2 - prevPan.y) * ratio;
      return clampPan(rawX, rawY, nextPreset);
    });
  };

  const handleReset = () => {
    const w = containerSize.w;
    const resetZoom = w < 640 ? 0.48 : 0.85;
    glideTo(1900, 1200, resetZoom);
  };

  // SVG Centerline Path
  const riverPathD = useMemo(() => getRiverCenterlinePath(), []);

  // Compute Krathongs dynamic coordinates along the single river
  const computedKrathongs = useMemo(() => {
    return krathongs.map((item, idx) => {
      const baseT = ((idx * 0.6180339887) % 1);
      const speedMult = 0.8 + ((idx * 7) % 5) * 0.1;
      const currentT = (baseT + riverFlowTime * speedMult) % 1;
      const lateral = (((idx * 43) % 220) - 110);
      const bob = Math.sin(riverFlowTime * 40 + idx * 2.2) * 4;

      // Freeze coordinate drift while hovered so it does not slip away from cursor
      let coords: { x: number; y: number };
      if (hoveredKrathongId === item.id) {
        if (!frozenCoordsRef.current.has(item.id)) {
          const fresh = getKrathongCoordinates(currentT, lateral, bob);
          frozenCoordsRef.current.set(item.id, fresh);
        }
        coords = frozenCoordsRef.current.get(item.id)!;
      } else {
        frozenCoordsRef.current.delete(item.id);
        coords = getKrathongCoordinates(currentT, lateral, bob);
      }

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        (item.partnerName && item.partnerName.toLowerCase().includes(query)) ||
        (item.familyName && item.familyName.toLowerCase().includes(query)) ||
        (Array.isArray(item.familyMembers) &&
          item.familyMembers.some((m: any) =>
            typeof m === 'string'
              ? m.toLowerCase().includes(query)
              : m?.name?.toLowerCase().includes(query)
          )) ||
        item.wish.toLowerCase().includes(query);

      const matchesFilter =
        filterMode === 'all' ||
        (filterMode === 'single' && item.mode === 'single') ||
        (filterMode === 'couple' && item.mode === 'couple') ||
        (filterMode === 'family' && item.mode === 'family');

      const isMyKrathong = Boolean(myKrathongId && item.id === myKrathongId);

      return {
        item,
        coords,
        matchesSearch,
        matchesFilter,
        isLatest: idx === 0,
        isMyKrathong,
      };
    });
  }, [krathongs, riverFlowTime, searchQuery, filterMode, myKrathongId, hoveredKrathongId]);

  // Fly to and focus user's own Krathong
  const handleFindMyKrathong = useCallback(() => {
    if (myKrathongId) {
      const found = computedKrathongs.find((k) => k.item.id === myKrathongId);
      if (found) {
        flyToKrathong(found.item, found.coords);
        setTimeout(() => {
          onSelectKrathong(found.item);
        }, 550);
        return;
      }
    }

    // If user hasn't created one yet or not found in list
    setIsNoMyKrathongModalOpen(true);
  }, [myKrathongId, computedKrathongs, flyToKrathong, onSelectKrathong]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      suppressHydrationWarning
      className={`relative w-full h-[calc(100vh-60px)] overflow-hidden bg-[#020512] select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* 1. THE BIG MAP WORLD (Canvas / SVG Layer) */}
      <div
        style={{
          width: MAP_WORLD_WIDTH,
          height: MAP_WORLD_HEIGHT,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
        className="absolute top-0 left-0"
      >
        {/* Full SVG Landscape & The Single Grand River (Memoized: 0 re-render overhead) */}
        <RiverSvgLandscape riverPathD={riverPathD} />

        {/* ========================================================= */}
        {/* 7. ALL KRATHONGS FLOATING TOGETHER IN THIS SINGLE RIVER   */}
        {/* ========================================================= */}
        <div className="absolute inset-0 pointer-events-auto">
          {computedKrathongs.map(({ item, coords, matchesSearch, matchesFilter, isLatest, isMyKrathong }) => {
            const isSelected = focusedKrathongId === item.id;
            const isHovered = hoveredKrathongId === item.id;
            const isFaded = !matchesSearch || !matchesFilter;
            const screenY = coords.y * zoom + pan.y;
            const isNearTop = screenY < 340;

            return (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredKrathongId(item.id)}
                onMouseLeave={() => setHoveredKrathongId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedKrathongId(item.id);
                  onSelectKrathong(item);
                }}
                style={{
                  left: `${coords.x}px`,
                  top: `${coords.y}px`,
                  opacity: isFaded ? 0.2 : 1,
                  transform: `translate(-50%, -50%) scale(${
                    zoom < 0.65 ? 0.7 : zoom < 1.25 ? 1 : 1.25
                  })`,
                }}
                className={`interactive-el absolute cursor-pointer group transition-transform duration-200 ${
                  isFaded ? 'pointer-events-none' : 'hover:scale-135 hover:z-50'
                } ${isHovered ? 'z-50 scale-135' : isMyKrathong ? 'z-40 scale-125' : isSelected ? 'z-40 scale-135' : 'z-20'}`}
              >
                {/* Large Profile Hover Card (เมื่อเอาเมาส์มาชี้) */}
                {isHovered && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setFocusedKrathongId(item.id);
                      onSelectKrathong(item);
                    }}
                    className={`absolute ${
                      isNearTop ? 'top-full mt-4' : 'bottom-full mb-4'
                    } left-1/2 -translate-x-1/2 w-72 bg-slate-950/95 border-2 border-amber-400 rounded-3xl p-4 shadow-[0_15px_45px_rgba(0,0,0,0.9),0_0_35px_rgba(251,191,36,0.4)] backdrop-blur-2xl z-50 pointer-events-auto cursor-pointer animate-in fade-in zoom-in-95 duration-150 text-center`}
                  >
                    {/* Mode Badge & Likes */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isMyKrathong
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : item.isMatchedWithMe
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-md animate-pulse'
                            : item.mode === 'couple'
                            ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                            : item.mode === 'family'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
                        }`}
                      >
                        {isMyKrathong
                          ? '👑 กระทงของคุณ'
                          : item.isMatchedWithMe
                          ? '💕 ใจตรงกัน (ปลดล็อกวาร์ป)'
                          : item.mode === 'couple'
                          ? '👩‍❤️‍👨 กระทงคู่รัก'
                          : item.mode === 'family'
                          ? '👨‍👩‍👧‍👦 กระทงครอบครัว'
                          : '💖 คนโสดหาคู่'}
                      </span>
                      <span className="text-xs font-extrabold text-pink-400 flex items-center gap-1">
                        ❤️ {item.likes}
                      </span>
                    </div>

                    {/* Big Profile Picture / Avatar */}
                    <div className="relative mx-auto mb-2.5 w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl group/img">
                      {item.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-amber-500/30 to-pink-500/30 flex items-center justify-center text-4xl">
                          {item.mode === 'couple' ? '👩‍❤️‍👨' : item.mode === 'family' ? '👨‍👩‍👧‍👦' : '🪷'}
                        </div>
                      )}
                      {isMyKrathong && (
                        <span className="absolute top-1 right-1 bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px] font-black shadow-md">
                          👑
                        </span>
                      )}
                    </div>

                    {/* Owner Name & Zodiac */}
                    <h4 className="text-base font-extrabold text-amber-200 leading-tight">
                      {item.name}
                      {item.partnerName && (
                        <span className="text-pink-300 font-bold"> ❤️ {item.partnerName}</span>
                      )}
                    </h4>

                    {item.zodiac && (
                      <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        {item.zodiac}
                      </div>
                    )}

                    {/* Wish Quotation */}
                    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 my-2.5 text-xs text-slate-200 italic leading-relaxed text-left">
                      &ldquo;{item.wish}&rdquo;
                    </div>

                    {/* Action Prompt */}
                    <div className="pt-1 flex items-center justify-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-extrabold shadow-md transition transform group-hover:scale-105">
                        <span>🔍</span>
                        <span>คลิกเพื่อดูการ์ดเต็ม & ส่งหัวใจ</span>
                      </div>
                    </div>

                    {/* Indicator Triangle */}
                    {isNearTop ? (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-[1px] border-solid border-b-amber-400 border-b-8 border-x-transparent border-x-8 border-t-0" />
                    ) : (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-amber-400 border-t-8 border-x-transparent border-x-8 border-b-0" />
                    )}
                  </div>
                )}

                {/* Water Shimmer Halo */}
                <div
                  className={`absolute inset-0 -m-6 rounded-full ${
                    isMyKrathong
                      ? 'bg-yellow-400/50'
                      : item.isMatchedWithMe
                      ? 'bg-pink-500/60 shadow-[0_0_25px_rgba(244,63,94,0.8)]'
                      : item.mode === 'couple'
                      ? 'bg-pink-400/30'
                      : 'bg-amber-400/30'
                  } blur-sm animate-pulse`}
                />

                {/* User's Own Krathong Golden Beacon */}
                {isMyKrathong && (
                  <>
                    <div className="absolute inset-0 -m-8 rounded-full border-2 border-yellow-300 ring-4 ring-amber-400/40 animate-ping opacity-90 pointer-events-none" />
                    <div className="absolute inset-0 -m-5 rounded-full border-2 border-yellow-200 ring-2 ring-yellow-400/60 animate-pulse pointer-events-none" />
                  </>
                )}

                {/* Latest Krathong Beacon */}
                {isLatest && !isMyKrathong && (
                  <div className="absolute inset-0 -m-8 rounded-full border-2 border-amber-300 animate-ping opacity-75 pointer-events-none" />
                )}

                {/* Selected Ring */}
                {isSelected && (
                  <div className="absolute inset-0 -m-6 rounded-full border-2 border-pink-400 animate-spin opacity-85" />
                )}

                {/* Level of Detail (LOD) Rendering */}
                {zoom < 0.6 ? (
                  /* FAR ZOOM: Radiant Starlight Candle Point */
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-7 h-7 rounded-full ${
                        isMyKrathong
                          ? 'bg-gradient-to-tr from-amber-300 via-yellow-200 to-white shadow-[0_0_24px_rgba(251,191,36,1)] ring-2 ring-yellow-300'
                          : item.isMatchedWithMe
                          ? 'bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-200 shadow-[0_0_24px_rgba(244,63,94,1)] ring-2 ring-pink-400'
                          : item.mode === 'couple'
                          ? 'bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-200 shadow-[0_0_20px_rgba(244,114,182,0.95)]'
                          : 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.95)]'
                      } flex items-center justify-center text-xs text-slate-950 font-bold border-2 border-white/80 animate-candle-flame`}
                    >
                      {isMyKrathong ? '👑' : item.isMatchedWithMe ? '💕' : item.mode === 'couple' ? '👩‍❤️‍👨' : '✨'}
                    </div>
                  </div>
                ) : (
                  /* MEDIUM & CLOSE ZOOM: High-Fidelity Krathong with Details */
                  <div className="relative flex flex-col items-center">
                    {/* Floating Name Badge */}
                    <div
                      className={`mb-1.5 px-3 py-0.5 rounded-full text-xs font-bold shadow-2xl border whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md transition transform ${
                        isMyKrathong
                          ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 border-yellow-100 ring-2 ring-yellow-400/80 shadow-[0_0_20px_rgba(251,191,36,0.95)] scale-110 font-extrabold z-40'
                          : isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 ring-2 ring-amber-300/50'
                          : item.mode === 'couple'
                          ? 'bg-pink-950/90 text-pink-100 border-pink-500/60 group-hover:scale-105'
                          : 'bg-slate-950/90 text-amber-200 border-amber-500/60 group-hover:scale-105'
                      }`}
                    >
                      {isMyKrathong ? (
                        <span className="text-[11px] font-black bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded-md">
                          👑 ของฉัน
                        </span>
                      ) : item.isMatchedWithMe ? (
                        <span className="text-[10px] font-extrabold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                          💕 ใจตรงกัน
                        </span>
                      ) : item.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-4 h-4 rounded-full object-cover border border-amber-400"
                        />
                      ) : null}
                      <span>
                        {item.name}
                        {item.partnerName && ` ❤️ ${item.partnerName}`}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold flex items-center ${
                          isMyKrathong ? 'text-rose-700' : 'text-pink-400'
                        }`}
                      >
                        ❤️{item.likes}
                      </span>
                    </div>

                    {/* Krathong 2D Body */}
                    <div className="transform scale-70 sm:scale-80">
                      <Krathong2D
                        design={item.design}
                        size={85}
                        isCouple={item.mode === 'couple'}
                        isFamily={item.mode === 'family'}
                        showRipple={zoom >= 1.05}
                      />
                    </div>

                    {/* Close-Up Wish Snippet Speech Bubble */}
                    {zoom >= 1.35 && (
                      <div className="absolute top-full mt-2 max-w-[180px] bg-slate-900/95 border border-slate-700 text-slate-100 text-[11px] px-3 py-1.5 rounded-2xl shadow-2xl italic truncate text-center backdrop-blur-md">
                        &ldquo;{item.wish}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 8. INTERACTIVE PIER STATIONS ALONG THE RIVERBANKS (Memoized) */}
        {/* ========================================================= */}
        <RiverPiersLayer activePierId={activePier?.id} onFlyToPier={flyToPier} />
      </div>

      {/* ========================================================= */}
      {/* 2. TOP FLOATING HUD & NAVIGATION BAR                      */}
      {/* ========================================================= */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pointer-events-none z-40">
        {/* Title & Quick Filter Bar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Main Title Badge */}
          <div className="bg-slate-950/85 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5">
            <span className="text-2xl">🌕</span>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-amber-200 leading-tight">
                สายธารมหานครา ๒๕๖๙
              </h2>
              <p className="text-[10px] text-slate-400 leading-tight">
                กระทงทั้งหมด <strong className="text-amber-300">{krathongs.length}</strong> ใบ
                ลอยร่วมสายน้ำเดียวกัน
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex bg-slate-950/85 border border-slate-800 p-1 rounded-2xl shadow-xl backdrop-blur-xl">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterMode('single')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'single'
                  ? 'bg-pink-500 text-white shadow'
                  : 'text-slate-400 hover:text-pink-300'
              }`}
            >
              <span>💖</span>
              <span className="hidden md:inline">คนโสด</span>
            </button>
            <button
              onClick={() => setFilterMode('couple')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'couple'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <span>👩‍❤️‍👨</span>
              <span className="hidden md:inline">คู่รัก</span>
            </button>
            <button
              onClick={() => setFilterMode('family')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                filterMode === 'family'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>👨‍👩‍👧‍👦</span>
              <span className="hidden md:inline">ครอบครัว</span>
            </button>
          </div>
        </div>

        {/* Search & Pier Navigator */}
        <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Find My Krathong Quick Action */}
          <button
            onClick={handleFindMyKrathong}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-xl flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95 whitespace-nowrap ${
              myKrathongId
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border border-yellow-200 shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-2 ring-yellow-400/50'
                : 'bg-slate-950/85 text-amber-300 border border-amber-500/50 hover:bg-slate-900'
            }`}
            title="คลิกเพื่อเลื่อนกล้องไปยังกระทงของคุณ"
          >
            <span>👑</span>
            <span>ดูกระทงของฉัน</span>
          </button>

          {/* Search Krathong by Name */}
          <div className="relative flex items-center">
            <div className="flex items-center bg-slate-950/85 border border-slate-800 focus-within:border-amber-400 rounded-2xl px-3 py-1.5 shadow-xl backdrop-blur-xl">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
              <input
                type="text"
                placeholder="ค้นหากระทง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none w-24 sm:w-32 focus:w-44 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-white p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Pier Quick Warp Buttons */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-950/85 border border-slate-800 p-1 rounded-2xl backdrop-blur-xl shadow-xl">
            <span className="text-[11px] text-slate-400 px-2 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-amber-400" /> วาร์ปไปท่าน้ำ:
            </span>
            {FESTIVAL_PIERS.map((p) => (
              <button
                key={p.id}
                onClick={() => flyToPier(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activePier?.id === p.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {p.icon} {p.shortName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FLOATING ZOOM & RIVER VIEW CONTROLS (Right Edge)       */}
      {/* ========================================================= */}
      <div className="absolute right-4 top-20 flex flex-col gap-2 z-40">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-300 shadow-2xl backdrop-blur-xl flex items-center justify-center transition active:scale-95"
          title="ซูมเข้า (+)"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Zoom Percent Readout (Cycles presets on click) */}
        <button
          onClick={handleCycleZoomPreset}
          className="h-8 px-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md flex items-center justify-center cursor-pointer hover:border-amber-400 transition"
          title="คลิกเพื่อสลับขนาดซูม (100% / 150% / 65%)"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-300 shadow-2xl backdrop-blur-xl flex items-center justify-center transition active:scale-95"
          title="ซูมออก (-)"
        >
          <Minus className="w-5 h-5" />
        </button>

        {/* Reset View */}
        <button
          onClick={handleReset}
          className="w-11 h-11 rounded-2xl bg-slate-900/95 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-amber-300 shadow-2xl backdrop-blur-xl flex items-center justify-center transition active:scale-95"
          title="รีเซ็ตมุมมองกึ่งกลางแม่น้ำ"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-full h-px bg-slate-800 my-0.5" />

        {/* Play / Pause River Current Flow */}
        <button
          onClick={() => setIsFlowing(!isFlowing)}
          className={`w-11 h-11 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-center transition active:scale-95 ${
            isFlowing
              ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-900/95 border-slate-700 text-slate-400'
          }`}
          title={isFlowing ? 'หยุดกระแสน้ำชั่วคราว' : 'เปิดให้สายน้ำไหล'}
        >
          {isFlowing ? <Waves className="w-5 h-5" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Jump to User's Krathong */}
        <button
          onClick={handleFindMyKrathong}
          className={`w-11 h-11 rounded-2xl shadow-2xl flex items-center justify-center transition active:scale-95 hover:scale-105 ${
            myKrathongId
              ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 ring-2 ring-yellow-300 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse'
              : 'bg-slate-900/95 border border-slate-700 text-amber-300 hover:border-amber-400'
          }`}
          title="วาร์ปไปดูกระทงของฉัน"
        >
          <span className="text-base">👑</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE RADAR MINI-MAP (Bottom Left)               */}
      {/* ========================================================= */}
      <div className="absolute bottom-8 left-4 z-40 hidden sm:block pointer-events-auto">
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            const targetX = (clickX / rect.width) * MAP_WORLD_WIDTH;
            const targetY = (clickY / rect.height) * MAP_WORLD_HEIGHT;
            glideTo(targetX, targetY);
          }}
          className="w-48 h-32 bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-2 shadow-2xl backdrop-blur-xl relative overflow-hidden cursor-crosshair group"
          title="คลิกที่เรดาร์เพื่อเลื่อนมุมกล้อง"
        >
          <svg className="w-full h-full" viewBox={`0 0 ${MAP_WORLD_WIDTH} ${MAP_WORLD_HEIGHT}`}>
            <rect width={MAP_WORLD_WIDTH} height={MAP_WORLD_HEIGHT} fill="#020617" />
            <path
              d={riverPathD}
              stroke="#0284C7"
              strokeWidth="300"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Piers in mini radar */}
            {FESTIVAL_PIERS.map((p) => (
              <circle
                key={p.id}
                cx={p.x}
                cy={p.y}
                r={activePier?.id === p.id ? 75 : 50}
                fill={activePier?.id === p.id ? '#FBBF24' : '#F43F5E'}
              />
            ))}
            {/* Camera Viewport Rectangle */}
            {isMounted && (
              <rect
                x={-pan.x / zoom}
                y={-pan.y / zoom}
                width={containerSize.w / zoom}
                height={containerSize.h / zoom}
                fill="rgba(251, 191, 36, 0.16)"
                stroke="#FBBF24"
                strokeWidth="10"
                rx="18"
              />
            )}
          </svg>

          <div className="absolute top-2 left-3 text-[10px] text-slate-300 font-bold flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            เรดาร์แม่น้ำ
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. PIER ACTION DRAWER (When a pier pin is selected)       */}
      {/* ========================================================= */}
      {activePier && (
        <div className="absolute bottom-6 inset-x-4 max-w-lg mx-auto z-50 animate-fade-in pointer-events-auto">
          <div className="bg-slate-900/95 border border-amber-500/50 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl text-left relative overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setActivePier(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Pier Info */}
            <div className="flex items-start gap-4 mb-4">
              <span className="text-4xl p-3.5 rounded-2xl bg-slate-800 border border-slate-700 shrink-0">
                {activePier.icon}
              </span>
              <div>
                <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-1.5">
                  {activePier.tag}
                </span>
                <h3 className="text-xl font-bold text-amber-200 leading-tight">
                  {activePier.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {activePier.desc}
                </p>
              </div>
            </div>

            {/* Float Buttons at this Pier */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800">
              <button
                onClick={() => onFloatSingleAtPier(activePier)}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-2.5 px-3 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>💖</span> ลอยคนโสด
              </button>

              <button
                onClick={() => onFloatCoupleAtPier(activePier)}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold py-2.5 px-3 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>👩‍❤️‍👨</span> ลอยคู่รัก
              </button>

              <button
                onClick={() => onFloatFamilyAtPier && onFloatFamilyAtPier(activePier)}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold py-2.5 px-3 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>👨‍👩‍👧‍👦</span> ลอยครอบครัว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. PROMPT MODAL: NO KRATHONG FOUND                       */}
      {/* ========================================================= */}
      {isNoMyKrathongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center">
            <button
              onClick={() => setIsNoMyKrathongModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
              🪷
            </div>

            <h3 className="text-xl font-bold text-amber-200 mb-2">
              ยังไม่พบกระทงของคุณในสายน้ำ
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              คุณยังไม่ได้ลอยกระทงในรอบนี้<br />
              มาร่วมเขียนคำอธิษฐานและส่งกระทงของคุณลงสู่แม่น้ำสายธารได้เลยทันที!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsNoMyKrathongModalOpen(false);
                  onFloatSingleAtPier(FESTIVAL_PIERS[0]);
                }}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-2.5 px-2 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>💖</span> ลอยคนโสด
              </button>

              <button
                onClick={() => {
                  setIsNoMyKrathongModalOpen(false);
                  onFloatCoupleAtPier(FESTIVAL_PIERS[0]);
                }}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold py-2.5 px-2 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>👩‍❤️‍👨</span> ลอยคู่รัก
              </button>

              <button
                onClick={() => {
                  setIsNoMyKrathongModalOpen(false);
                  onFloatFamilyAtPier && onFloatFamilyAtPier(FESTIVAL_PIERS[0]);
                }}
                className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold py-2.5 px-2 rounded-2xl text-xs shadow-xl transition transform hover:scale-102"
              >
                <span>👨‍👩‍👧‍👦</span> ลอยครอบครัว
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Instruction Hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none hidden md:block">
        <div className="bg-slate-950/75 border border-slate-800 px-4 py-1.5 rounded-full text-[11px] text-slate-400 backdrop-blur-md flex items-center gap-2 shadow-lg">
          <span>💡 เลื่อนล้อเมาส์เพื่อซูมเข้า-ออก</span>
          <span>•</span>
          <span>ลากเพื่อเลื่อนดูแม่น้ำ</span>
          <span>•</span>
          <span>คลิกกระทงหรือท่าน้ำเพื่อดูรายละเอียด</span>
        </div>
      </div>
    </div>
  );
};
