import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { ThemeContext, type Theme } from "./ThemeContext";

const STORAGE_KEY = "portfolio-theme";
const REVEAL_MS = 950;

const readStoredTheme = (): Theme => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

/**
 * Night (dark) / day (light) theme.
 *
 * Switching uses the View Transitions API: the browser snapshots the old page, we swap the theme,
 * and the new page is revealed through a circle that grows from the toggle button - so day
 * "breaks" over night (and night closes over day) from wherever you clicked.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  // Keep <html data-theme> in sync; all light-mode CSS hangs off this attribute.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* private mode: theme just won't persist */
    }
  }, [theme]);

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const apply = () => {
        flushSync(() => setTheme(next));
        document.documentElement.dataset.theme = next;
      };

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof document.startViewTransition !== "function" || reduceMotion) {
        apply();
        return;
      }

      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;
      // Radius that reaches the farthest corner of the viewport
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

      const root = document.documentElement;
      root.dataset.themeSwitching = "true";
      // The callback must stay synchronous: the browser pauses rendering (and therefore
      // requestAnimationFrame) until it returns, so awaiting a frame here would deadlock the
      // transition. The "new" view is live anyway, so canvases simply paint on the next frame.
      const transition = document.startViewTransition(() => {
        apply();
      });

      transition.ready
        .then(() => {
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: REVEAL_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
          );
        })
        .catch(() => {
          /* transition skipped (e.g. tab hidden): theme is already applied */
        });
      transition.finished.finally(() => {
        delete root.dataset.themeSwitching;
      });
    },
    [theme],
  );

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
