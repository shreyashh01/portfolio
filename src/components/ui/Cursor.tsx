import { useEffect, useRef } from "react";

const ORANGE = "#FF6500"; // portfolio accent
const BASE = 32; // resting diameter (px)
const HOVER_SCALE = 2.5; // 32px -> 80px, the zoom on hover
const BORDER = 1.5; // px, kept constant while the ring zooms

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
  const fillRef = useRef<HTMLSpanElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);
  const rippleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const ball = ballRef.current;
    const ripple = rippleRef.current;
    const invertRoot = invertRootRef.current;
    const fill = fillRef.current;
    // Touchscreen laptops report maxTouchPoints > 0, so key off pointer type instead.
    if (!root || !ball || !ripple || !invertRoot || !fill || !window.matchMedia("(any-pointer: fine)").matches) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let targetX = 0, targetY = 0; // real pointer
    let x = 0, y = 0; // dot position
    let angle = 0;
    let stretch = 1; // eased stretch factor
    let size = 1; // eased hover/press scale
    let sizeTarget = 1;
    let seen = false, hovering = false, pressed = false, hidden = false;
    let last = performance.now();
    let raf = 0;

    const setVisible = (on: boolean) => {
      const v = on ? "1" : "0";
      root.style.opacity = v;
      invertRoot.style.opacity = v;
    };

    const updateSizeTarget = () => {
      sizeTarget = pressed ? 0.6 : hovering ? HOVER_SCALE : 1;
      // inverted-colour disc fades in while zoomed over text/media
      fill.style.opacity = hovering && !pressed ? "1" : hovering ? "0.85" : "0";
    };

    const tick = (now: number) => {
      const n = Math.min(now - last, 50) / 16.667; // frames elapsed at 60fps
      last = now;

      const dx = targetX - x;
      const dy = targetY - y;
      const follow = 1 - Math.pow(0.8, n);
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
      ball.style.borderWidth = `${BORDER / size}px`; // counter-scale so the ring doesn't thicken on zoom
      const transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}rad) scale(${sx}, ${sy})`;
      ball.style.transform = transform;
      fill.style.transform = transform;

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
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
      const nextHidden = !!el?.closest('[data-hide-cursor="true"]');
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        setVisible(!hidden && seen);
      }
    };

    const onDown = (e: PointerEvent) => {
      pressed = true;
      updateSizeTarget();
      ripple.getAnimations().forEach((a) => a.cancel());
      ripple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(0.6)`;
      ripple.animate(
        [
          { transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(0.6)`, opacity: 0.9 },
          { transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(3.2)`, opacity: 0 },
        ],
        { duration: 700, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
    };
    const onUp = () => {
      pressed = false;
      updateSizeTarget();
    };
    const leave = () => {
      seen = false;
      hovering = false;
      pressed = false;
      updateSizeTarget();
      setVisible(false);
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) leave();
    };
    const onVisibility = () => {
      if (document.hidden) leave();
    };

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
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("blur", leave);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const shape = {
    position: "absolute",
    top: 0,
    left: 0,
    width: BASE,
    height: BASE,
    margin: `${-BASE / 2}px 0 0 ${-BASE / 2}px`,
    borderRadius: "50%",
    display: "block",
    willChange: "transform",
  } as const;

  return (
    <>
      {/* Inversion layer: a white disc under mix-blend-mode: difference flips the colours beneath it.
          Must be its own fixed layer so the blend sees the page, and so the orange ring stays orange. */}
      <div
        ref={invertRootRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99998]"
        style={{ opacity: 0, mixBlendMode: "difference", transition: "opacity 0.25s" }}
      >
        <span ref={fillRef} style={{ ...shape, opacity: 0, background: "#fff", transition: "opacity 0.3s" }} />
      </div>
      <div
        ref={rootRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999]"
        style={{ opacity: 0, transition: "opacity 0.25s" }}
      >
        <span ref={rippleRef} style={{ ...shape, opacity: 0, border: `${BORDER}px solid ${ORANGE}` }} />
        <span ref={ballRef} style={{ ...shape, background: "transparent", border: `${BORDER}px solid ${ORANGE}` }} />
      </div>
    </>
  );
};

export default Cursor;
