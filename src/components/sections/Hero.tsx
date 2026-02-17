import SpaceCanvas from "../canvas/spaceCanvas";
import { Player } from "@lottiefiles/react-lottie-player";
import devLottie from "../../assets/Marketing management.json";
import resumeFile from "../../assets/resume/shreyash.resume.pdf";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { MobileSocials } from "../ui/MobileSocials";

interface HeroProps {
  showUI: boolean;
}

const Hero: React.FC<HeroProps> = ({ showUI }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5, // Start after preloader curtain logic
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1], // easeOut for better performance
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1], // easeOut for better performance
        delay: 0.8,
      },
    },
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Space background */}
      <div className="fixed inset-0 z-0">
        <SpaceCanvas />
      </div>

      {/* Dark overlay for better text contrast */}
      <div className="fixed inset-0 z-[1] bg-black/40" />

      {/* Hero layout */}
      <div id="hero" className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between pt-20 pb-32 md:py-0">
        {/* LEFT: Text */}
        <motion.div 
          className="flex-1 flex flex-col justify-center text-center md:text-left max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          whileInView={showUI ? "visible" : "hidden"}
          viewport={{ once: false }}
        >
          
          <motion.h1 variants={itemVariants} className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            <span className="text-[#FF6500]">Hello</span>, I&apos;m
            <br />
            <span className="block text-white mt-2">Shreyash Naik</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 text-gray-400 text-xl md:text-2xl font-mono tracking-wide">
            Software Developer<span className="text-[#FF6500] animate-pulse">_</span>
          </motion.p>

          {/* BUTTON */}
          <motion.div variants={itemVariants} className="mt-8 md:mt-32 flex justify-center md:justify-start"> 
            <a
              href={resumeFile}
              download="Shreyash_Naik_Resume.pdf"
              className="
                group
                flex items-center
                bg-[#FF6500]
                text-black font-bold
                rounded-full
                pl-8 pr-2 py-3
                shadow-[0_0_20px_rgba(255,101,0,0.5)]
                hover:shadow-[0_0_30px_rgba(255,101,0,0.8)]
                active:scale-[0.98]
                transition-all duration-300
              "
            >
              {/* Text */}
              <span className="text-base md:text-lg mr-6 tracking-wide">
                View My Resume
              </span>

              {/* Icon Container */}
              <div className="bg-black text-[#FF6500] p-3 rounded-full group-hover:bg-white group-hover:text-black transition-colors duration-300">
                <ChevronRight size={24} />
              </div>
            </a>
          </motion.div>

          {/* Mobile Socials (Only visible on small screens) */}
          <MobileSocials />

        </motion.div>

        {/* RIGHT: Lottie (Visible on all screens now) */}
        <motion.div 
          className="flex-1 flex items-center justify-center md:justify-end mt-12 md:mt-0 w-full md:w-auto"
          variants={imageVariants}
          initial="hidden"
          whileInView={showUI ? "visible" : "hidden"}
          viewport={{ once: false }}
        >
            {/* Added a subtle glow/backdrop behind the lottie for separation */}
            <div className="relative w-[280px] xs:w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] max-w-full">
                <div className="absolute inset-0 bg-[#FF6500]/10 blur-[50px] md:blur-[60px] rounded-full" />
                <Player
                    src={devLottie}
                    autoplay
                    loop
                    speed={0.7}
                    className="relative z-10 w-full h-full"
                />
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
