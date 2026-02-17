import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If the component has finished loading before, check localStorage or similar logic if needed.
    // For now, always play.
    
    const duration = 2000; // 2 seconds total for the counter
    const steps = 100;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
        setCount((prev) => {
            if (prev >= 100) {
                clearInterval(timer);
                setTimeout(() => {
                  setShow(false);
                  if (onComplete) onComplete();
                }, 600); // Reduced from 800ms for faster transition
                return 100;
            }
            return prev + 1;
        });
    }, intervalTime);

    // Initial random jump to make it feel organic
    setTimeout(() => setCount(23), 400);
    setTimeout(() => setCount(67), 1100);

    return () => clearInterval(timer);
  }, [onComplete]);

  const [text, setText] = useState("");

  useEffect(() => {
      // Funny text based on progress
      if (count === 0) setText("Feeding the server hamsters...");
      else if (count > 0 && count < 20) setText("Googling how to center a div...");
      else if (count >= 20 && count < 40) setText("Copying code from StackOverflow...");
      else if (count >= 40 && count < 60) setText("Deleting node_modules (again)...");
      else if (count >= 60 && count < 80) setText("Wait, that was a load-bearing bug...");
      else if (count >= 80 && count < 90) setText("It works on my machine!");
      else if (count >= 90) setText("Deploying to production (fingers crossed)...");
  }, [count]);

  // Variant for the split curtain
  const slideUp = {
    initial: { top: 0 },
    exit: { top: "-50%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 } }
  };
  const slideDown = {
    initial: { bottom: 0 },
    exit: { bottom: "-50%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const, delay: 0.2 } }
  };

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-transparent pointer-events-none">
          
          {/* TOP CURTAIN */}
          <motion.div 
            variants={slideUp} 
            initial="initial" 
            exit="exit" 
            style={{ willChange: 'transform' }} // Hint for GPU acceleration
            className="absolute top-0 left-0 w-full h-[50vh] bg-[#050505] z-10"
          />
          
          {/* BOTTOM CURTAIN */}
          <motion.div 
            variants={slideDown} 
            initial="initial" 
            exit="exit" 
            style={{ willChange: 'transform' }} // Hint for GPU acceleration
            className="absolute bottom-0 left-0 w-full h-[50vh] bg-[#050505] z-10"
          />

          {/* CONTENT (Centered) */}
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="z-20 flex flex-col items-center justify-center gap-4"
          >
             {/* 
                Innovative Text Reveal: 
                Maybe "Hello" in different languages or just the percentage.
                Let's stick to the minimal percentage which is very clean.
              */}
                  <div className="relative inline-flex items-start justify-center">
                      <span className="text-8xl md:text-9xl font-bold text-white font-heading tracking-tighter">
                        {count}
                      </span>
                      <span className="absolute left-full top-2 md:top-4 text-4xl md:text-6xl text-[#FF6500] font-bold ml-2">
                        %
                      </span>
                  </div>
              
              <div className="w-[200px] h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-[#FF6500]"
                    style={{ width: `${count}%` }} 
                  />
              </div>

              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.5 }} 
                className="font-mono text-sm text-[#FF6500]/80 tracking-widest uppercase mt-2 text-center px-4"
              >
                  {text}
              </motion.p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
