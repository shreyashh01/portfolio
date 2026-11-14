import { useEffect, useRef } from "react";

const ORANGE = "#FF6500"; // portfolio accent
const BASE = 32; // resting diameter (px)
const HOVER_SCALE = 2.5; // 32px -> 80px, the zoom on hover
const BORDER = 1.5; // SVG stroke stays constant at every hover size

/**
 * Wiggly transparent cursor with an orange ring.
 *
 * The dot trails the pointer with a frame-rate independent lerp. The *lag distance*
 * (pointer minus dot) drives a volume-preserving stretch, and the dot rotates
 * toward its direction of travel - so fast moves smear into an ellipse that
 * snaps back to a circle when it catches up. Hover grows it, press shrinks it,
 * click sends out a ripple ring.
 */
const INTERACTIVE = "a, button, summary, input, textarea, select, label, [role='button'], [data-cursor-hover]";
const TEXT_OR_MEDIA =
  "h1, h2, h3, h4, h5, h6, p, span, li, blockquote, code, pre, strong, em, b, i, small, td, th, dt, dd, figcaption, " +
  "img, svg, path, picture, video, canvas, .lottie-animation-container";

// True over anything clickable, any text (including bare text inside a div) and any image/media.
const isHoverTarget = (el: HTMLElement | null) => {
  if (!el) return false;
  if (el.closest(INTERACTIVE) || el.closest(TEXT_OR_MEDIA)) return true;
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
  }
  return false;
};

const Cursor = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const invertRootRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGEllipseElement>(null);
  const ballRef = useRef<SVGEllipseElement>(null);
  const rippleRef = useRef<SVGCircleElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ball = ballRef.current;
    const ripple = rippleRef.current;
    const invertRoot = invertRootRef.current;
    const fill = fillRef.current;
    const reticle = reticleRef.current;
    const labelEl = labelRef.current;
    // Touchscreen laptops report maxTouchPoints > 0, so key off pointer type instead.
    if (!root || !ball || !ripple || !invertRoot || !fill || !reticle || !labelEl || !window.matchMedia("(any-pointer: fine)").matches) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;

    let targetX = 0, targetY = 0; // real pointer
    let x = 0, y = 0; // dot position
    let angle = 0;
    let stretch = 1; // eased stretch factor
    let size = 1; // eased hover/press scale
    let sizeTarget = 1;
    let seen = false, hovering = false, pressed = false, hidden = false;
    let scan = false; // over a [data-cursor="scan"] area: the ring becomes a targeting reticle
    let label = ""; // name of the [data-cursor-label] item under the pointer
    let lock = 0; // eased 0..1, how tightly the reticle has locked onto an item
    let last = performance.now();
    let raf = 0;
    let rippleStarted: number | null = null;

    const setVisible = (on: boolean) => {
      const v = on ? "1" : "0";
      root.style.opacity = v;
      invertRoot.style.opacity = v;
    };

    const updateSizeTarget = () => {
      sizeTarget = pressed ? 0.6 : hovering && !scan ? HOVER_SCALE : 1;
      // inverted-colour disc fades in while zoomed over text/media (not in scan areas)
      fill.style.opacity = scan ? "0" : hovering && !pressed ? "1" : hovering ? "0.85" : "0";
    };

    const applyScan = () => {
      ball.style.opacity = scan ? "0" : "1";
      reticle.style.opacity = scan ? "1" : "0";
      labelEl.style.opacity = scan && label ? "1" : "0";
      updateSizeTarget();
    };

    const tick = (now: number) => {
      const n = Math.min(now - last, 50) / 16.667; // frames elapsed at 60fps
      last = now;

      const dx = targetX - x;
      const dy = targetY - y;
      const follow = reduceMotion ? 1 : 1 - Math.pow(0.8, n);
      x += dx * follow;
      y += dy * follow;

      const lag = Math.hypot(dx, dy);
      if (lag > 0.5) {
        let diff = Math.atan2(dy, dx) - angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest path
        angle += diff * Math.min(1, 0.35 * n);
      }

      const stretchTarget = reduceMotion ? 1 : 1 + Math.min(lag / 90, 0.9) * (hovering ? 0.25 : 1);
      stretch += (stretchTarget - stretch) * (1 - Math.pow(0.75, n));
      size += (sizeTarget - size) * (1 - Math.pow(1 - 0.18, n));

      // sx * sy = size^2 -> area stays constant while the shape stretches
      const sx = stretch * size;
      const sy = (1 / Math.sqrt(stretch)) * size;
      // Change vector geometry, never scale a cached 32px cursor texture.
      // The SVG viewport uses CSS pixels, including after browser zoom changes.
      const rotation = `rotate(${angle * 180 / Math.PI} ${x} ${y})`;
      for (const ellipse of [ball, fill]) {
        ellipse.setAttribute("cx", String(x));
        ellipse.setAttribute("cy", String(y));
        ellipse.setAttribute("rx", String(BASE / 2 * sx));
        ellipse.setAttribute("ry", String(BASE / 2 * sy));
        ellipse.setAttribute("transform", rotation);
      }
      if (rippleStarted !== null) {
        const progress = Math.min(1, (now - rippleStarted) / 700);
        const eased = 1 - Math.pow(1 - progress, 3);
        ripple.setAttribute("r", String(BASE / 2 * (0.6 + 2.6 * eased)));
        ripple.style.opacity = String(0.9 * (1 - progress));
        if (progress === 1) rippleStarted = null;
      }

      // Scanner reticle: follows the same eased position, tightens when locked onto an item
      lock += ((scan && label ? 1 : 0) - lock) * (1 - Math.pow(0.82, n));
      const reticleScale = (1 - 0.28 * lock) * (pressed ? 0.85 : 1);
      const reticleSize = 56 * reticleScale;
      reticle.style.width = `${reticleSize}px`;
      reticle.style.height = `${reticleSize}px`;
      reticle.style.left = `${x - reticleSize / 2}px`;
      reticle.style.top = `${y - reticleSize / 2}px`;
      labelEl.style.left = `${Math.round(x + 30)}px`;
      labelEl.style.top = `${Math.round(y + 20)}px`;

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") { leave(); return; }
      targetX = e.clientX;
      targetY = e.clientY;
      if (!seen) {
        seen = true;
        x = targetX;
        y = targetY;
        setVisible(!hidden);
      }
      const el = e.target as HTMLElement | null;
      const nextHover = isHoverTarget(el);
      if (nextHover !== hovering) {
        hovering = nextHover;
        updateSizeTarget();
      }
      const nextScan = !!el?.closest('[data-cursor="scan"]');
      const nextLabel = el?.closest("[data-cursor-label]")?.getAttribute("data-cursor-label") ?? "";
      if (nextScan !== scan || nextLabel !== label) {
        scan = nextScan;
        if (nextLabel !== label) {
          label = nextLabel;
          labelEl.textContent = label;
        }
        applyScan();
      }
      const nextHidden = !!el?.closest('[data-hide-cursor="true"]');
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        setVisible(!hidden && seen);
      }
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pressed = true;
      updateSizeTarget();
      if (!reduceMotion) {
        ripple.setAttribute("cx", String(e.clientX));
        ripple.setAttribute("cy", String(e.clientY));
        ripple.setAttribute("r", String(BASE / 2 * 0.6));
        ripple.style.opacity = "0.9";
        rippleStarted = performance.now();
      }
    };
    const onUp = () => {
      pressed = false;
      updateSizeTarget();
    };
    const leave = () => {
      seen = false;
      hovering = false;
      pressed = false;
      scan = false;
      label = "";
      applyScan();
      setVisible(false);
      rippleStarted = null;
      ripple.style.opacity = "0";
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) leave();
    };
    const onVisibility = () => {
      if (document.hidden) leave();
    };

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches;
      if (reduceMotion) {
        rippleStarted = null;
        ripple.style.opacity = "0";
      }
    };
    motionQuery.addEventListener("change", onMotionChange);
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("blur", leave);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      motionQuery.removeEventListener("change", onMotionChange);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", leave);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <>
      {/* Inversion layer: a white disc under mix-blend-mode: difference flips the colours beneath it.
          Must be its own fixed layer so the blend sees the page, and so the orange ring stays orange. */}
      <div
        ref={invertRootRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998]"
        style={{ opacity: 0, mixBlendMode: "difference", transition: "opacity 0.25s" }}
      >
        <svg width="100%" height="100%" className="absolute inset-0" fill="none">
          <ellipse ref={fillRef} rx={BASE / 2} ry={BASE / 2} fill="#fff" style={{ opacity: 0, transition: "opacity 0.3s" }} />
        </svg>
      </div>
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99999]"
        style={{ opacity: 0, transition: "opacity 0.25s" }}
      >
        <svg data-custom-cursor width="100%" height="100%" className="absolute inset-0" fill="none" stroke={ORANGE} strokeWidth={BORDER}>
          <circle ref={rippleRef} r={BASE / 2} vectorEffect="non-scaling-stroke" style={{ opacity: 0 }} />
          <ellipse ref={ballRef} data-cursor-ring rx={BASE / 2} ry={BASE / 2} vectorEffect="non-scaling-stroke" style={{ transition: "opacity 0.2s" }} />
        </svg>
        {/* Scanner mode: spinning dashed ring + crosshair ticks, with the hovered item's name beside it */}
        <div
          ref={reticleRef}
          style={{
            position: "absolute", top: 0, left: 0, width: 56, height: 56,
            opacity: 0, transition: "opacity 0.2s",
          }}
        >
          <svg viewBox="0 0 56 56" width="100%" height="100%" fill="none" stroke={ORANGE} strokeLinecap="round">
            <g className="cursor-reticle-spin" style={{ transformOrigin: "28px 28px" }}>
              <circle cx="28" cy="28" r="21" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="4 6" />
            </g>
            <path d="M28 3v9M28 44v9M3 28h9M44 28h9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx="28" cy="28" r="2" fill={ORANGE} stroke="none" />
          </svg>
        </div>
        <span
          ref={labelRef}
          style={{
            position: "absolute", top: 0, left: 0, opacity: 0, transition: "opacity 0.15s", whiteSpace: "nowrap",
            font: '500 12px/1 ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace',
            color: ORANGE, background: "rgba(5,5,5,0.88)", border: `1px solid ${ORANGE}66`,
            padding: "4px 8px", borderRadius: 6,
          }}
        />
      </div>
    </>
  );
};

export default Cursor;
