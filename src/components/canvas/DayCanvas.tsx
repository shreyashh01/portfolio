import { useEffect, useRef } from "react";

/**
 * Day-theme hero background: a warm morning sky.
 * Counterpart of SpaceCanvas (night): where night has stars and meteors,
 * day has a glowing sun with slow rays, drifting clouds, a few birds,
 * floating pollen and soft hills on the horizon.
 */
const DayCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId = 0;
    let W = 0;
    let H = 0;

    /* ---------- Clouds: clusters of soft puffs drifting right ---------- */
    interface Puff { dx: number; dy: number; r: number }
    interface Cloud { x: number; y: number; scale: number; speed: number; alpha: number; puffs: Puff[] }
    const clouds: Cloud[] = [];

    const makeCloud = (x: number): Cloud => {
      const puffs: Puff[] = [];
      const count = 5 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const t = i / (count - 1); // 0..1 across the cloud
        puffs.push({
          dx: (t - 0.5) * 190 + (Math.random() - 0.5) * 22,
          dy: -Math.sin(t * Math.PI) * 26 + (Math.random() - 0.5) * 10,
          r: 34 + Math.sin(t * Math.PI) * 26 + Math.random() * 10,
        });
      }
      return {
        x,
        y: H * (0.08 + Math.random() * 0.5),
        scale: 0.55 + Math.random() * 0.75,
        speed: 0.12 + Math.random() * 0.22,
        alpha: 0.55 + Math.random() * 0.35,
        puffs,
      };
    };

    /* ---------- Birds: tiny flapping silhouettes flying left ---------- */
    interface Bird { x: number; y: number; size: number; speed: number; phase: number; bob: number }
    const birds: Bird[] = [];
    const makeBird = (x: number): Bird => ({
      x,
      y: H * (0.12 + Math.random() * 0.35),
      size: 7 + Math.random() * 7,
      speed: 0.7 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      bob: Math.random() * Math.PI * 2,
    });

    /* ---------- Pollen: warm motes floating up ---------- */
    interface Mote { x: number; y: number; r: number; vy: number; sway: number; phase: number; alpha: number }
    const motes: Mote[] = [];
    const makeMote = (y: number): Mote => ({
      x: Math.random() * W,
      y,
      r: 0.8 + Math.random() * 1.8,
      vy: 0.15 + Math.random() * 0.35,
      sway: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.25 + Math.random() * 0.45,
    });

    const init = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      clouds.length = 0;
      const cloudCount = W < 768 ? 4 : 7;
      for (let i = 0; i < cloudCount; i++) clouds.push(makeCloud(Math.random() * W));
      birds.length = 0;
      const birdCount = W < 768 ? 3 : 5;
      for (let i = 0; i < birdCount; i++) birds.push(makeBird(Math.random() * W));
      motes.length = 0;
      for (let i = 0; i < 36; i++) motes.push(makeMote(Math.random() * H));
    };
    init();

    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#fddfb0"); // warm peach at the top
      g.addColorStop(0.45, "#fbead0");
      g.addColorStop(1, "#f6eedf"); // melts into the page beige
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawSun = (time: number) => {
      const sx = W * (W < 768 ? 0.8 : 0.84);
      const sy = H * 0.17;
      const core = Math.min(W, H) * 0.06 + 22;

      // wide atmospheric glow
      const glow = ctx.createRadialGradient(sx, sy, core * 0.4, sx, sy, core * 9);
      glow.addColorStop(0, "rgba(255, 190, 70, 0.55)");
      glow.addColorStop(0.3, "rgba(255, 170, 60, 0.22)");
      glow.addColorStop(1, "rgba(255, 170, 60, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // slowly turning rays
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(reduceMotion ? 0 : time * 0.00005);
      const RAYS = 14;
      for (let i = 0; i < RAYS; i++) {
        const long = i % 2 === 0;
        const len = core * (long ? 5.6 : 3.8);
        const half = core * (long ? 0.34 : 0.24);
        const ray = ctx.createLinearGradient(0, core * 1.2, 0, len);
        ray.addColorStop(0, "rgba(255, 196, 80, 0.34)");
        ray.addColorStop(1, "rgba(255, 196, 80, 0)");
        ctx.fillStyle = ray;
        ctx.beginPath();
        ctx.moveTo(-half * 0.35, core * 1.2);
        ctx.lineTo(half * 0.35, core * 1.2);
        ctx.lineTo(half, len);
        ctx.lineTo(-half, len);
        ctx.closePath();
        ctx.fill();
        ctx.rotate((Math.PI * 2) / RAYS);
      }
      ctx.restore();

      // sun disc
      const disc = ctx.createRadialGradient(sx - core * 0.25, sy - core * 0.25, core * 0.1, sx, sy, core);
      disc.addColorStop(0, "#fff3c4");
      disc.addColorStop(0.6, "#ffc94d");
      disc.addColorStop(1, "#ff9d1e");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, sy, core, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawHills = () => {
      const layer = (baseY: number, amp: number, freq: number, phase: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 24) {
          const y = baseY + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        ctx.fill();
      };
      layer(H * 0.86, 26, 0.0032, 0.6, "rgba(226, 205, 168, 0.55)");
      layer(H * 0.91, 20, 0.0046, 2.1, "rgba(215, 190, 148, 0.6)");
    };

    const drawCloud = (c: Cloud) => {
      for (const p of c.puffs) {
        const px = c.x + p.dx * c.scale;
        const py = c.y + p.dy * c.scale;
        const r = p.r * c.scale;
        const g = ctx.createRadialGradient(px, py - r * 0.25, r * 0.1, px, py, r);
        g.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
        g.addColorStop(0.7, `rgba(255, 250, 240, ${c.alpha * 0.75})`);
        g.addColorStop(1, "rgba(255, 246, 230, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBird = (b: Bird, time: number) => {
      const flap = Math.sin(time * 0.012 * b.speed + b.phase); // -1..1
      const wingY = -b.size * 0.55 * flap;
      const y = b.y + Math.sin(time * 0.0012 + b.bob) * 6;
      ctx.strokeStyle = "rgba(70, 48, 30, 0.55)";
      ctx.lineWidth = Math.max(1.2, b.size * 0.16);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x - b.size, y + wingY);
      ctx.quadraticCurveTo(b.x - b.size * 0.45, y - b.size * 0.25 + wingY * 0.3, b.x, y);
      ctx.quadraticCurveTo(b.x + b.size * 0.45, y - b.size * 0.25 + wingY * 0.3, b.x + b.size, y + wingY);
      ctx.stroke();
    };

    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // same 30fps cap as the night sky

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);
      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      drawSky();
      drawSun(timestamp);
      drawHills();

      for (const c of clouds) {
        drawCloud(c);
        if (!reduceMotion) c.x += c.speed;
        if (c.x - 180 * c.scale > W) Object.assign(c, makeCloud(-180));
      }

      for (const b of birds) {
        drawBird(b, timestamp);
        if (!reduceMotion) b.x -= b.speed;
        if (b.x < -30) Object.assign(b, makeBird(W + 30 + Math.random() * 200));
      }

      for (const m of motes) {
        ctx.globalAlpha = m.alpha;
        ctx.fillStyle = "#f5a524";
        ctx.beginPath();
        ctx.arc(m.x + Math.sin(timestamp * 0.0008 + m.phase) * m.sway, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        if (!reduceMotion) m.y -= m.vy;
        if (m.y < -10) Object.assign(m, makeMote(H + 10));
      }
      ctx.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(draw);
    window.addEventListener("resize", init);

    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, pointerEvents: "none" }}
    />
  );
};

export default DayCanvas;
