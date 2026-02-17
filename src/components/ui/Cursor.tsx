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

  // Smooth lerp animation loop — no React state, pure DOM manipulation
  const animate = useCallback(() => {
    // Lerp for smooth following
    currentX.current += (posX.current - currentX.current) * 0.15;
    currentY.current += (posY.current - currentY.current) * 0.15;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${currentX.current}px, ${currentY.current}px, 0)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    rafId.current = requestAnimationFrame(animate);

    const moveCursor = (e: MouseEvent) => {
      posX.current = e.clientX - 16;
      posY.current = e.clientY - 16;
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

  // Don't render custom cursor on touch devices
  if (typeof navigator !== 'undefined' && (navigator.maxTouchPoints > 0)) {
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
