import React from 'react';
import profile from '../../assets/profile.jpeg';
import ghibliImage from '../../assets/ghibli_image.jpeg';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const [cursorPos, setCursorPos] = React.useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = React.useState(false);
  const rafPending = React.useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const clientX = e.clientX;
    const clientY = e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        setCursorPos({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
        rafPending.current = false;
      });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rafPending.current) {
        rafPending.current = true;
        requestAnimationFrame(() => {
          setCursorPos({
            x: clientX - rect.left,
            y: clientY - rect.top,
          });
          rafPending.current = false;
        });
      }
    };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <section id="about" className="relative z-10 min-h-screen w-full bg-[#050505] text-white flex items-center justify-center py-20 px-4 overflow-hidden">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Content */}
        <motion.div 
          className="space-y-6 md:order-1 order-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          variants={fadeInUp}
        >
          <h2 className="text-4xl md:text-6xl font-bold leading-tight relative">
            About <span className="text-[#FF6500]">Me</span>
            <span className="absolute -bottom-2 left-0 w-20 h-1 bg-[#FF6500] rounded-full"></span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg text-justify">
            I’m Shreyash — A <span className="text-[#FF6500]">passionate full-stack developer</span> who builds fast, scalable apps and occasionally <span className="text-[#FF6500]">argues with AI</span> for a living. I’ve reduced load times, automated boring work, and made <span className="text-[#FF6500]">real-time systems</span> that actually feel real-time <span className="text-[#FF6500]">(crazy concept, I know)</span>. If it runs on the web, I’ll build it — and probably <span className="text-[#FF6500]">optimize it</span> before anyone notices it was slow. 
          </p>
        </motion.div>

        {/* Right Content - Image Composition */}
        <motion.div 
          className="relative flex justify-center md:justify-end md:order-2 order-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          variants={scaleIn}
        >
          <div className="relative w-72 h-80 md:w-80 md:h-96 group">
            {/* Geometric Accent Top-Left */}
            <div className="absolute -top-6 -left-6 w-24 h-24 border-t-2 border-l-2 border-[#FF6500]/30 rounded-tl-3xl z-0 transition-all duration-500 group-hover:-top-8 group-hover:-left-8 group-hover:border-[#FF6500]"></div>

            {/* Main Image Container */}
            <motion.div 
              className="absolute inset-0 z-20 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_-12px_rgba(255,101,0,0.3)] cursor-zoom-in touch-none"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onTouchMove={handleTouchMove}
              onTouchStart={(e) => {
                  setIsHovering(true);
                  handleTouchMove(e);
              }}
              onTouchEnd={() => setIsHovering(false)}
              animate={isHovering ? { 
                x: [0, -2, 2, -2, 2, 0],
                y: [0, -2, 2, -2, 2, 0],
              } : {}}
              transition={{
                duration: 0.4,
                repeat: isHovering ? Infinity : 0,
                repeatType: "mirror"
              }}
              data-hide-cursor="true"
            >
               <div className="absolute inset-0 bg-neutral-900/20 z-10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none"></div> {/* Subtle overlay */}
               
               {/* Original Profile Image */}
               <img 
                 src={profile} 
                 alt="Profile" 
                 className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
               />

               {/* Ghibli Reveal Image */}
               <img
                 src={ghibliImage}
                 alt="Ghibli Version"
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out scale-100 group-hover:scale-105 pointer-events-none"
                 style={{
                   opacity: isHovering ? 1 : 0,
                   maskImage: `radial-gradient(circle 80px at ${cursorPos.x}px ${cursorPos.y}px, black 100%, transparent 100%)`, // Increased radius for better mobile feel
                   WebkitMaskImage: `radial-gradient(circle 80px at ${cursorPos.x}px ${cursorPos.y}px, black 100%, transparent 100%)`,
                 }}
               />

               {/* Hover/Touch Hint - Visible when NOT hovering */}
               <div 
                  className={`absolute top-4 right-4 z-30 transition-opacity duration-300 pointer-events-none ${isHovering ? 'opacity-0' : 'opacity-100'}`}
               >
                  <motion.div 
                    className="relative"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                      {/* Curly Arrow SVG */}
                     <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute -left-12 top-2 rotate-12 text-white/80 drop-shadow-lg">
                        <path 
                           d="M 80 20 Q 20 20 20 80" 
                           stroke="currentColor" 
                           strokeWidth="3" 
                           fill="none" 
                           strokeDasharray="6 4"
                        />
                         <path d="M 20 80 L 10 70 M 20 80 L 30 70" stroke="currentColor" strokeWidth="3" fill="none" />
                     </svg>
                     <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm border border-white/20 whitespace-nowrap">
                        Hover me!
                     </span>
                  </motion.div>
               </div>
            </motion.div>

            {/* Dots Pattern Background - replacing solid offset */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[#333] rounded-2xl -z-10 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div> 

            {/* Accent Line Bottom-Right */}
            <div className="absolute -bottom-10 -right-12 space-y-2 z-0">
               <div className="w-24 h-1 bg-[#FF6500] rounded-full opacity-60 group-hover:w-32 transition-all duration-500 origin-left"></div>
               <div className="w-16 h-1 bg-white/20 rounded-full opacity-40 group-hover:w-24 transition-all duration-700 delay-100 origin-left"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
