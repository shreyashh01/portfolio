/* CSS Paint worklet: an ink splash that spreads from a point.
 *
 * Used as `mask-image: paint(ink-reveal)` on the incoming page during a theme switch, so the
 * new theme shows through wherever the "ink" has reached. The mask is redrawn every frame from
 * three custom properties:
 *   --ink-p   progress 0..1 (animated by ThemeProvider)
 *   --ink-x/y where the ink starts, in CSS px
 *
 * Shape = a noisy blob (several sine harmonics whose phases drift with progress, so the edge
 * crawls like wet ink) + finger-like tendrils + flying droplets ahead of the front.
 */

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260711); // fixed seed: same splash every time

// Edge wobble: [frequency, amplitude, phase, drift speed]
const HARMONICS = [
  [2, 0.13, rand() * 6.28, 1.1],
  [3, 0.11, rand() * 6.28, -1.4],
  [5, 0.09, rand() * 6.28, 1.9],
  [8, 0.07, rand() * 6.28, -2.3],
  [13, 0.05, rand() * 6.28, 2.8],
  [21, 0.035, rand() * 6.28, -3.4],
  [34, 0.022, rand() * 6.28, 4.1],
];

// Tendrils: long fingers of ink shooting out of the main body
const FINGERS = Array.from({ length: 11 }, () => ({
  angle: rand() * Math.PI * 2,
  reach: 0.28 + rand() * 0.75, // extra length, as a fraction of the front radius
  width: 0.05 + rand() * 0.13, // angular half-width in radians
  delay: rand() * 0.25,
}));

// Droplets thrown ahead of the front
const DROPS = Array.from({ length: 110 }, () => ({
  angle: rand() * Math.PI * 2,
  ahead: 1.03 + Math.pow(rand(), 1.4) * 0.62, // multiple of front radius
  size: 2 + Math.pow(rand(), 2.2) * 15,
  delay: rand() * 0.3,
}));

const TAU = Math.PI * 2;
const STEPS = 420;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
// Near-linear: the animation easing (set in ThemeProvider) already shapes the pacing
const easeOut = (t) => Math.pow(t, 0.9);

const num = (v) => {
  if (v == null) return 0;
  if (typeof v.value === 'number') return v.value;
  const n = parseFloat(v.toString());
  return Number.isFinite(n) ? n : 0;
};

registerPaint(
  'ink-reveal',
  class {
    static get inputProperties() {
      return ['--ink-p', '--ink-x', '--ink-y'];
    }

    paint(ctx, size, props) {
      const p = Math.min(1, Math.max(0, num(props.get('--ink-p'))));
      if (p <= 0) return;

      const ox = num(props.get('--ink-x'));
      const oy = num(props.get('--ink-y'));
      const { width: w, height: h } = size;

      // Farthest corner decides how far the ink must travel
      const far = Math.hypot(Math.max(ox, w - ox), Math.max(oy, h - oy));
      const R = far * 1.08 * easeOut(p);

      ctx.fillStyle = '#000';
      ctx.beginPath();
      for (let i = 0; i <= STEPS; i++) {
        const a = (i / STEPS) * TAU;

        let wobble = 1;
        for (const [f, amp, ph, sp] of HARMONICS) wobble += amp * Math.sin(f * a + ph + p * sp);

        let finger = 0;
        for (const fg of FINGERS) {
          let d = Math.abs(a - fg.angle);
          d = Math.min(d, TAU - d);
          const grow = smooth(fg.delay, fg.delay + 0.55, p);
          finger += fg.reach * grow * Math.exp(-((d / fg.width) ** 2));
        }

        const r = R * Math.max(0.05, wobble + finger);
        const x = ox + Math.cos(a) * r;
        const y = oy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Droplets
      for (const d of DROPS) {
        const t = smooth(d.delay, d.delay + 0.2, p);
        if (t <= 0) continue;
        const dist = R * d.ahead;
        const rad = d.size * t * (1 - 0.5 * smooth(0.6, 1, p));
        ctx.beginPath();
        ctx.arc(ox + Math.cos(d.angle) * dist, oy + Math.sin(d.angle) * dist, rad, 0, TAU);
        ctx.fill();
      }

      // Final flood so no sliver is ever left uncovered
      const flood = smooth(0.8, 1, p);
      if (flood > 0) {
        ctx.globalAlpha = flood;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    }
  },
);
