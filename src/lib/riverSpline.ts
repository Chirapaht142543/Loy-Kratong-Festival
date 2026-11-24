// Mathematical definition and evaluation for the Grand Loy Krathong River

export interface Point2D {
  x: number;
  y: number;
}

export interface BezierSegment {
  p0: Point2D;
  cp1: Point2D;
  cp2: Point2D;
  p1: Point2D;
}

export interface RiverPoint {
  x: number;
  y: number;
  tangentX: number;
  tangentY: number;
  normalX: number;
  normalY: number;
  angle: number; // in degrees
}

export const MAP_WORLD_WIDTH = 3800;
export const MAP_WORLD_HEIGHT = 2400;
export const RIVER_WIDTH = 370;

// 5 C1-smooth cubic Bezier segments spanning across the map world with graceful serpentine meanders
export const RIVER_SEGMENTS: BezierSegment[] = [
  {
    // Segment 0: North entrance to Rama 8
    p0: { x: 300, y: 140 },
    cp1: { x: 570, y: 210 },
    cp2: { x: 780, y: 350 },
    p1: { x: 960, y: 520 },
  },
  {
    // Segment 1: Rama 8 through Wat Arun bend
    p0: { x: 960, y: 520 },
    cp1: { x: 1140, y: 690 },
    cp2: { x: 1280, y: 880 },
    p1: { x: 1480, y: 1040 },
  },
  {
    // Segment 2: Wat Arun to Iconsiam
    p0: { x: 1480, y: 1040 },
    cp1: { x: 1680, y: 1200 },
    cp2: { x: 1960, y: 1260 },
    p1: { x: 2220, y: 1180 },
  },
  {
    // Segment 3: Iconsiam curving through Asiatique
    p0: { x: 2220, y: 1180 },
    cp1: { x: 2480, y: 1100 },
    cp2: { x: 2700, y: 1280 },
    p1: { x: 2840, y: 1500 },
  },
  {
    // Segment 4: Asiatique to Ancient Canal & oceanward delta exit
    p0: { x: 2840, y: 1500 },
    cp1: { x: 2980, y: 1720 },
    cp2: { x: 3320, y: 1980 },
    p1: { x: 3780, y: 2280 },
  },
];

// Generate SVG path 'd' string for the centerline
export const getRiverCenterlinePath = (): string => {
  const first = RIVER_SEGMENTS[0];
  let d = `M ${first.p0.x} ${first.p0.y}`;
  for (const seg of RIVER_SEGMENTS) {
    d += ` C ${seg.cp1.x} ${seg.cp1.y}, ${seg.cp2.x} ${seg.cp2.y}, ${seg.p1.x} ${seg.p1.y}`;
  }
  return d;
};

// Evaluate point and derivative on a single cubic Bezier
const evaluateCubicBezier = (
  seg: BezierSegment,
  u: number
): { x: number; y: number; dx: number; dy: number } => {
  const u2 = u * u;
  const u3 = u2 * u;
  const mt = 1 - u;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  // Position
  const x =
    mt3 * seg.p0.x +
    3 * mt2 * u * seg.cp1.x +
    3 * mt * u2 * seg.cp2.x +
    u3 * seg.p1.x;
  const y =
    mt3 * seg.p0.y +
    3 * mt2 * u * seg.cp1.y +
    3 * mt * u2 * seg.cp2.y +
    u3 * seg.p1.y;

  // Derivative
  const dx =
    3 * mt2 * (seg.cp1.x - seg.p0.x) +
    6 * mt * u * (seg.cp2.x - seg.cp1.x) +
    3 * u2 * (seg.p1.x - seg.cp2.x);
  const dy =
    3 * mt2 * (seg.cp1.y - seg.p0.y) +
    6 * mt * u * (seg.cp2.y - seg.cp1.y) +
    3 * u2 * (seg.p1.y - seg.cp2.y);

  return { x, y, dx, dy };
};

// Pre-sample points along the entire spline to create an Arc-Length Parameterization Table (LUT)
const SAMPLE_COUNT = 400;

interface SamplePoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
  cumDist: number;
}

const buildArcLengthLUT = (): { samples: SamplePoint[]; totalLength: number } => {
  const samples: SamplePoint[] = [];
  const numSegs = RIVER_SEGMENTS.length;
  let cumDist = 0;
  let prevPoint: Point2D | null = null;

  for (let i = 0; i <= SAMPLE_COUNT; i++) {
    const globalT = i / SAMPLE_COUNT; // 0..1
    const segIdx = Math.min(Math.floor(globalT * numSegs), numSegs - 1);
    const localU = globalT * numSegs - segIdx;

    const pt = evaluateCubicBezier(RIVER_SEGMENTS[segIdx], localU);

    if (prevPoint) {
      const dist = Math.hypot(pt.x - prevPoint.x, pt.y - prevPoint.y);
      cumDist += dist;
    }
    prevPoint = { x: pt.x, y: pt.y };

    samples.push({
      x: pt.x,
      y: pt.y,
      dx: pt.dx,
      dy: pt.dy,
      cumDist,
    });
  }

  return { samples, totalLength: cumDist };
};

const { samples: ARC_SAMPLES, totalLength: TOTAL_RIVER_LENGTH } = buildArcLengthLUT();

export const RIVER_TOTAL_LENGTH = TOTAL_RIVER_LENGTH;

/**
 * Returns point, tangent, and normal on the river centerline by normalized distance t in [0, 1].
 * Uses arc-length parameterization for smooth constant speed.
 */
export const getRiverPoint = (t: number): RiverPoint => {
  const normalizedT = ((t % 1) + 1) % 1;
  const targetDist = normalizedT * TOTAL_RIVER_LENGTH;

  let low = 0;
  let high = ARC_SAMPLES.length - 1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    if (ARC_SAMPLES[mid].cumDist < targetDist) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const idx0 = Math.max(0, Math.min(low - 1, ARC_SAMPLES.length - 2));
  const idx1 = idx0 + 1;

  const s0 = ARC_SAMPLES[idx0];
  const s1 = ARC_SAMPLES[idx1];

  const segDist = s1.cumDist - s0.cumDist;
  const alpha = segDist > 0.0001 ? (targetDist - s0.cumDist) / segDist : 0;

  const x = s0.x + (s1.x - s0.x) * alpha;
  const y = s0.y + (s1.y - s0.y) * alpha;
  const dx = s0.dx + (s1.dx - s0.dx) * alpha;
  const dy = s0.dy + (s1.dy - s0.dy) * alpha;

  const len = Math.hypot(dx, dy) || 1;
  const tangentX = dx / len;
  const tangentY = dy / len;

  const normalX = -tangentY;
  const normalY = tangentX;
  const angle = (Math.atan2(tangentY, tangentX) * 180) / Math.PI;

  return { x, y, tangentX, tangentY, normalX, normalY, angle };
};

/**
 * Given normalized distance t (0..1) and lateral offset in pixels (-RIVER_WIDTH/2 to +RIVER_WIDTH/2),
 * computes exact (x, y) on the water surface.
 */
export const getKrathongCoordinates = (
  t: number,
  lateralOffset: number,
  bobY: number = 0
): { x: number; y: number; angle: number } => {
  const pt = getRiverPoint(t);
  return {
    x: pt.x + pt.normalX * lateralOffset,
    y: pt.y + pt.normalY * lateralOffset + bobY,
    angle: pt.angle,
  };
};
