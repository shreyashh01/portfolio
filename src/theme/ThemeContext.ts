import { createContext, useContext } from "react";

export type Theme = "dark" | "light";

export interface ThemeContextValue {
  theme: Theme;
  /** Switch theme. `origin` (viewport px) is where the circular reveal starts from. */
  toggle: (origin?: { x: number; y: number }) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({ theme: "dark", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);
