import { Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const SocialSidebar: React.FC = () => {
    const { scrollYProgress } = useScroll();
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });
    const height = useTransform(smoothProgress, [0, 1], [0, 400]);

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="hidden lg:flex flex-col items-center gap-6 fixed left-10 bottom-0 text-white z-50"
        >
            <a href="https://github.com/shreyashh01" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                <Github size={24} />
            </a>
            <a href="https://www.linkedin.com/in/shreyash-naik-3b838228a/" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                <Linkedin size={24} />
            </a>
            <a href="https://x.com/shreyash845745" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                <Twitter size={24} />
            </a>
            <a href="https://www.instagram.com/Shreyash.NyK" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                <Instagram size={24} />
            </a>

            {/* Circuit Board Trail with Water Flow */}
            {/* Circuit Board Trail with Water Flow */}
            <div className="mt-6 w-[20px] h-[400px] relative">
                {/* Layer 1: Background Path (Empty Straw) - Always visible */}
                <svg width="20" height="400" viewBox="0 0 20 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full z-0">
                    <path 
                        d="M 10 0 V 100 L 4 110 V 180 L 16 200 V 260 L 10 270 V 400" 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        strokeWidth="2" 
                    />
                </svg>

                {/* Layer 2: Filled Content (Masked by height) */}
                <motion.div 
                    className="absolute top-0 left-0 w-full overflow-hidden z-10"
                    style={{ height }}
                >
                    <svg width="20" height="400" viewBox="0 0 20 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[400px]">
                        <defs>
                            <linearGradient id="social-juice-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FF8533" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#FF6500" stopOpacity="1" />
                                <stop offset="100%" stopColor="#CC5200" stopOpacity="0.9" />
                            </linearGradient>
                        </defs>

                        {/* 1. Base Orange Juice Color with Gradient */}
                        <path 
                            d="M 10 0 V 100 L 4 110 V 180 L 16 200 V 260 L 10 270 V 400" 
                            stroke="url(#social-juice-gradient)" 
                            strokeWidth="2"
                        />
                        
                        {/* 2. Flowing Highlights (Liquid Shimmer) */}
                        <motion.path 
                            d="M 10 0 V 100 L 4 110 V 180 L 16 200 V 260 L 10 270 V 400" 
                            stroke="rgba(255, 255, 255, 0.6)" 
                            strokeWidth="1.5"
                            strokeDasharray="8 25"
                            animate={{ strokeDashoffset: [0, -33] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        />
                        
                        {/* 3. Animated Bubbles/Particles flowing upward */}
                        {[...Array(6)].map((_, i) => (
                            <motion.circle
                                key={i}
                                r="1.5"
                                fill="rgba(255, 255, 255, 0.7)"
                                initial={{ cy: 400, cx: 10 }}
                                animate={{ 
                                    cy: [400, 0],
                                    cx: i % 2 === 0 ? [10, 12, 10] : [10, 8, 10],
                                    opacity: [0, 1, 1, 0]
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 3 + i * 0.3,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </svg>
                </motion.div>
            </div>
        </motion.div>
    );
};
