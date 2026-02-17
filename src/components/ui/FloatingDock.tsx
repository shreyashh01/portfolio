import { Home, User, Briefcase, Mail, Code } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FloatingDockProps {
  show: boolean;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ show }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const navItems = [
        { icon: <Home size={20} />, label: "Home", href: "#hero" },
        { icon: <User size={20} />, label: "About", href: "#about" },
        { icon: <Code size={20} />, label: "Skills", href: "#skills" },
        { icon: <Briefcase size={20} />, label: "Experience & Projects", href: "#experience" },
        { icon: <Mail size={20} />, label: "Contact", href: "#contact" },
    ];

    return (
        <motion.div 
          initial={{ y: 200, opacity: 0, scale: 0.5 }}
          animate={show ? { y: 0, opacity: 1, scale: 1 } : { y: 200, opacity: 0, scale: 0.5 }}
          transition={{ 
            delay: 2.2,
            type: "spring", 
            stiffness: 150,
            damping: 18,
            mass: 0.6
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-4 px-4 py-3 rounded-full bg-[#111111]/90 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05),0_0_40px_rgba(255,101,0,0.15)] backdrop-blur-md w-[90%] max-w-md md:w-auto overflow-visible"
        >
            {navItems.map((item, index) => (
                <div 
                    key={index}
                    className="relative flex items-center justify-center"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    {/* Cosmic Orbit Animation */}
                    <AnimatePresence>
                        {hoveredIndex === index && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                transition={{ 
                                    opacity: { duration: 0.2 },
                                    scale: { duration: 0.2 },
                                    rotate: { duration: 3, repeat: Infinity, ease: "linear" } 
                                }}
                                className="absolute inset-[-6px] rounded-full border border-white/5 pointer-events-none"
                            >
                                {/* Orbiting Planet */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FF6500] rounded-full shadow-[0_0_8px_#FF6500]"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <a 
                        href={item.href}
                        className="
                            relative z-10
                            p-3 rounded-full block
                            text-white/70 
                            hover:text-white hover:bg-white/10 
                            transition-all duration-300 
                            hover:scale-110
                        "
                    >
                        {item.icon}
                    </a>
                    
                    {/* Tooltip */}
                    <AnimatePresence>
                        {hoveredIndex === index && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-[140%] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#FF6500] text-white text-sm font-medium rounded-lg whitespace-nowrap shadow-[0_0_15px_rgba(255,101,0,0.4)] z-20 border border-white/20"
                            >
                                {item.label}
                                {/* Arrow */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#FF6500]"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </motion.div>
    );
};
