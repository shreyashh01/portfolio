import { useEffect, useRef, useCallback } from "react";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const posX = useRef(-100);
  const posY = useRef(-100);
  const currentX = useRef(-100);
  const currentY = useRef(-100);
  const isHovering = useRef(false);
  const isHidden = useRef(false);
  const rafId = useRef<number>(0);

  // Spring physics state (no React state, pure DOM manipulation)
  const velX = useRef(0);
  const velY = useRef(0);
  const angle = useRef(0);
  const stretch = useRef(0);

  // Jelly animation loop: a spring chases the mouse (so it overshoots and wobbles),
  // and the blob squashes/stretches along its direction of travel.
  const animate = useCallback(() => {
    const STIFFNESS = 0.14; // higher = snappier
    const DAMPING = 0.76; // lower = more jiggle

    velX.current = (velX.current + (posX.current - currentX.current) * STIFFNESS) * DAMPING;
    velY.current = (velY.current + (posY.current - currentY.current) * STIFFNESS) * DAMPING;
    currentX.current += velX.current;
    currentY.current += velY.current;

    const speed = Math.hypot(velX.current, velY.current);
    if (speed > 0.3) {
      // Shortest-path angle smoothing so direction changes wobble instead of snapping
      const target = Math.atan2(velY.current, velX.current);
      let diff = target - angle.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      angle.current += diff * 0.25;
    }
    const targetStretch = Math.min(speed * 0.035, 0.55);
    stretch.current += (targetStretch - stretch.current) * 0.3;

    const sx = 1 + stretch.current;
    const sy = 1 - stretch.current * 0.55;

    if (cursorRef.current) {
      cursorRef.current.style.transform =
        `translate3d(${currentX.current}px, ${currentY.current}px, 0) translate(-50%, -50%) ` +
        `rotate(${angle.current}rad) scale(${sx}, ${sy})`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);

    const moveCursor = (e: MouseEvent) => {
      posX.current = e.clientX;
      posY.current = e.clientY;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if target is clickable or is a text/media element
      const isInteractive =
        target.matches("a, button, input, textarea, select") ||
        target.closest("a, button") ||
        target.getAttribute("role") === "button";

      const isTextOrMedia =
        target.matches("h1, h2, h3, h4, h5, h6, p, span, img, svg, path, canvas") ||
        target.closest(".lottie-animation-container");

      // Check for hide cursor attribute
      const shouldHide = !!target.closest('[data-hide-cursor="true"]');
      const newHidden = shouldHide;
      const newHovering = !!(isInteractive || isTextOrMedia);

      if (cursorRef.current) {
        if (newHidden !== isHidden.current) {
          isHidden.current = newHidden;
          cursorRef.current.style.opacity = newHidden ? "0" : "1";
        }
        if (newHovering !== isHovering.current) {
          isHovering.current = newHovering;
          if (newHovering) {
            cursorRef.current.classList.add("cursor-hovering");
          } else {
            cursorRef.current.classList.remove("cursor-hovering");
          }
        }
      }
    };

    const handleMouseOut = () => {
      if (cursorRef.current) {
        if (isHovering.current) {
          isHovering.current = false;
          cursorRef.current.classList.remove("cursor-hovering");
        }
        if (isHidden.current) {
          isHidden.current = false;
          cursorRef.current.style.opacity = "1";
        }
      }
    };



    window.addEventListener("mousemove", moveCursor, { passive: true });
    window.addEventListener("mouseover", handleMouseOver, { passive: true });
    window.addEventListener("mouseout", handleMouseOut, { passive: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
      window.removeEventListener("mouseout", handleMouseOut);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [animate]);

  // Only skip the custom cursor when the *primary* input is coarse (phones/tablets).
  // navigator.maxTouchPoints is unreliable: touchscreen laptops report > 0 even with a mouse.
  if (typeof window !== 'undefined' && !window.matchMedia('(any-pointer: fine)').matches) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="cursor-blob fixed top-0 left-0 w-8 h-8 rounded-full border border-white pointer-events-none z-[99999]"
      style={{
        mixBlendMode: "difference",
        willChange: "transform",
        transition: "width 0.3s, height 0.3s, background-color 0.3s, border-color 0.3s",
      }}
    />
  );
};

export default Cursor;
