import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import { motion } from "framer-motion";

export const MobileSocials: React.FC = () => {
    return (
        <div className="lg:hidden flex flex-col items-center justify-center w-full mt-12 md:mt-16">
            {/* Icons Row */}
            <div className="flex gap-6 md:gap-8 items-center justify-center z-20">
                <a href="https://github.com/shreyashh01" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                    <Github size={24} />
                </a>
                <a href="https://www.linkedin.com/in/shreyash-naik-3b838228a/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                    <Linkedin size={24} />
                </a>
                <a href="https://x.com/shreyash845745" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                    <Twitter size={24} />
                </a>
                <a href="https://www.instagram.com/Shreyash.NyK" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                    <Instagram size={24} />
                </a>
                <a href="mailto:shreyashnyk1@gmail.com" className="text-gray-400 hover:text-[#FF6500] hover:-translate-y-1 transition-all duration-300">
                    <Mail size={24} />
                </a>
            </div>

            {/* Horizontal Circuit Board Trail with Water Flow */}
            <div className="w-full max-w-xs md:max-w-md h-[40px] relative mt-2">
                {/* Layer 1: Background Path (Empty Straw) - Always visible */}
                <svg width="100%" height="40" viewBox="0 0 300 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full z-0 opacity-30">
                     <path 
                        d="M 0 20 H 120 L 130 28 H 170 L 180 20 H 300" 
                        stroke="rgba(255, 255, 255, 0.2)" 
                        strokeWidth="2" 
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>

                {/* Layer 2: Animated Flow */}
                 <svg width="100%" height="40" viewBox="0 0 300 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 w-full h-full z-10">
                    <defs>
                        <linearGradient id="mobile-social-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF8533" stopOpacity="0" />
                            <stop offset="50%" stopColor="#FF6500" stopOpacity="1" />
                            <stop offset="100%" stopColor="#CC5200" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Flowing Highlights (Liquid Shimmer) */}
                    <motion.path 
                        d="M 0 20 H 120 L 130 28 H 170 L 180 20 H 300" 
                        stroke="url(#mobile-social-gradient)" 
                        strokeWidth="2"
                        strokeDasharray="50 150"
                        animate={{ strokeDashoffset: [200, -200] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        vectorEffect="non-scaling-stroke"
                    />
                    
                    {/* Animated Bubbles/Particles flowing horizontally */}
                    {[...Array(3)].map((_, i) => (
                        <motion.circle
                            key={i}
                            r="2"
                            fill="#FF6500"
                            initial={{ cx: 0, cy: 20 }}
                            animate={{ 
                                cx: [0, 300],
                                cy: i % 2 === 0 ? [20, 22, 20] : [20, 18, 20],
                                opacity: [0, 1, 0]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 4 + i * 0.5,
                                delay: i * 1,
                                ease: "linear"
                            }}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
};
