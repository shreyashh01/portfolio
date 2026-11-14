import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../theme/ThemeContext";

/** Sun / moon switch. The circular reveal starts from the centre of this button. */
export const ThemeToggle = () => {
  const { theme, toggle } = useTheme();
  const isDay = theme === "light";

  return (
    <button
      type="button"
      aria-label={isDay ? "Switch to night theme" : "Switch to day theme"}
      aria-pressed={isDay}
      data-cursor-hover
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className="relative z-10 p-3 rounded-full block text-[#FF6500] hover:bg-white/10 transition-all duration-300 hover:scale-110 overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="block"
          initial={{ y: 14, opacity: 0, rotate: -60 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 60 }}
          transition={{ duration: 0.25 }}
        >
          {isDay ? <Moon size={20} /> : <Sun size={20} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
