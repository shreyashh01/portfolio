import { useEffect, useRef } from "react";

const SpaceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    /* ======================================================
       MICRO STARS (Shiny + Twinkling)
    ====================================================== */
    interface MicroStar {
      x: number;
      y: number;
      r: number;
      baseAlpha: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }

    const microStars: MicroStar[] = [];
    const MICRO_STAR_COUNT = 50;

    const initMicroStars = () => {
      microStars.length = 0;
      for (let i = 0; i < MICRO_STAR_COUNT; i++) {
        microStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 0.8 + 0.4,
          baseAlpha: 0.2 + Math.random() * 0.3,
          twinkleSpeed: 0.003 + Math.random() * 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    };
    initMicroStars();

    /* ======================================================
       MAIN STARS (Subtle Forward Motion)
    ====================================================== */
    interface Star {
      x: number;
      y: number;
      z: number;
      r: number;
      color: string;
      alpha: number;
    }

    const stars: Star[] = [];
    const STAR_COUNT = 80;

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * canvas.width - centerX,
          y: Math.random() * canvas.height - centerY,
          z: Math.random() * canvas.width,
          r: Math.random() * 1.5 + 0.5,
          color: Math.random() > 0.8 ? "#FFD6A0" : Math.random() > 0.5 ? "#A0C4FF" : "#FFFFFF",
          alpha: 0.7 + Math.random() * 0.3,
        });
      }
    };
    initStars();

    /* ======================================================
       METEORS (Shooting Stars)
    ====================================================== */
    interface Meteor {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      alpha: number;
    }

    const meteors: Meteor[] = [];

    const createMeteor = () => {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * (canvas.height * 0.3);
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
        const speed = 15 + Math.random() * 15;

        meteors.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 60,
            alpha: 1,
        });
    };

    /* ======================================================
       THROTTLE — render at ~30fps instead of 60fps
    ====================================================== */
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // 30fps cap

    const draw = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(draw);

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = timestamp;

      /* Draw Micro Stars */
      ctx.fillStyle = "#ffffff";
      for (const m of microStars) {
        const cycle = Math.sin(now * m.twinkleSpeed * 0.001 + m.twinklePhase);
        const shine = Math.pow(Math.abs(cycle), 10); 
        const alpha = m.baseAlpha + shine * 0.7;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));
        const size = shine > 0.5 ? m.r * (1 + shine * 0.5) : m.r;
        ctx.beginPath();
        ctx.arc(m.x, m.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Draw Moving Stars */
      const speed = 0.5;
      for (const s of stars) {
        const fov = canvas.height; 
        const projection = fov / s.z;
        const x = centerX + s.x * projection;
        const y = centerY + s.y * projection;
        
        if (x > -100 && x < canvas.width + 100 && y > -100 && y < canvas.height + 100) {
            const size = Math.max(0.2, s.r * projection);
            const depthFade = Math.min(1, s.z / 1000); 
            ctx.globalAlpha = s.alpha * depthFade;
            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        s.z -= speed;
        if (s.z <= 1) {
          s.z = canvas.width;
          s.x = Math.random() * canvas.width - centerX;
          s.y = Math.random() * canvas.height - centerY;
        }
      }
      
      ctx.globalAlpha = 1.0;

      /* Draw Meteors */
      if (Math.random() < 0.003) {
          createMeteor();
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];

          ctx.strokeStyle = `rgba(255, 255, 255, ${m.alpha * 0.6})`;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 3, m.y - m.vy * 3);
          ctx.stroke();

          ctx.globalAlpha = m.alpha;
          ctx.fillStyle = "white";
          ctx.beginPath();
          ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          m.x += m.vx;
          m.y += m.vy;
          m.life++;

          if (m.life > m.maxLife - 20) {
              m.alpha -= 0.05;
          }

          if (m.life > m.maxLife || m.alpha <= 0) {
              meteors.splice(i, 1);
          }
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    const handleResize = () => {
      resizeCanvas();
      centerX = canvas.width / 2;
      centerY = canvas.height / 2;
      initStars();
      initMicroStars();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
};

export default SpaceCanvas;
