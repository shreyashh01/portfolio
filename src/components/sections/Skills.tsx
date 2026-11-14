import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import EarthCanvas from '../canvas/Earth';

// All skills to display as tags
const skills = [
  { name: 'React', icon: '/icons/react-original.svg' },
  { name: 'Next.js', icon: '/icons/nextjs-original.svg' },
  { name: 'Svelte', icon: '/icons/svelte-original.svg' },
  { name: 'Node.js', icon: '/icons/nodejs-original.svg' },
  { name: 'Express', icon: '/icons/express-original.svg' },
  { name: 'Python', icon: '/icons/python-original.svg' },
  { name: 'FastAPI', icon: '/icons/fastapi-original.svg' },
  { name: 'PostgreSQL', icon: '/icons/postgresql-original.svg' },
  { name: 'MongoDB', icon: '/icons/mongodb-original.svg' },
  { name: 'Supabase', icon: '/icons/supabase-original.svg' },
  { name: 'WebSockets', icon: '/icons/socketio-original.svg' },
  { name: 'REST APIs', icon: '/icons/nodejs-original.svg' },
  { name: 'Electron.js', icon: '/icons/electron-original.svg' },
  { name: 'Docker', icon: '/icons/docker-original.svg' },
  { name: 'Git', icon: '/icons/git-original.svg' },
  { name: 'OpenCV', icon: '/icons/opencv-original.svg' },
  { name: 'Whisper AI', icon: '/icons/python-original.svg' },
  { name: 'Gemini API', icon: '/icons/google-original.svg' },
  { name: 'Linux', icon: '/icons/linux-original.svg' },
  { name: 'AWS', icon: '/icons/amazonwebservices-original-wordmark.svg' },
  { name: 'AI/ML', icon: '/icons/tensorflow-original.svg' },
];

// Skills to display on the 3D ring balls (9 specific technologies)
const ringSkills = [
  { name: 'React', icon: '/icons/ring/react.png' },
  { name: 'Svelte', icon: '/icons/ring/svelte.png' },
  { name: 'Next.js', icon: '/icons/ring/nextjs.png' },
  { name: 'Node.js', icon: '/icons/ring/nodejs.png' },
  { name: 'MongoDB', icon: '/icons/ring/mongodb.png' },
  { name: 'Python', icon: '/icons/ring/python.png' },
  { name: 'Docker', icon: '/icons/ring/docker.png' },
  { name: 'Git', icon: '/icons/ring/git.png' },
  { name: 'AWS', icon: '/icons/ring/amazonwebservices.png' },
];

const Skills: React.FC = () => {
  const sectionRef = useRef(null);
  const skillsRef = useRef(null);
  const canvasRef = useRef(null);
  
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });
  const skillsInView = useInView(skillsRef, { once: false, margin: "-50px" });
  const canvasInView = useInView(canvasRef, { once: false, margin: "-100px" });

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Individual skill tag animation
  const skillVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.5,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // 3D Canvas animation (removed rotation to fix load glitch)
  const canvasVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1] as const, // easeOut
      },
    },
  };

  return (
    <section 
      ref={sectionRef}
      id="skills" 
      className="relative z-10 min-h-screen w-full bg-[#050505] text-white flex items-center justify-center py-20 px-4"
    >
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left Side - Skills Content */}
        <motion.div 
          className="flex flex-col gap-6"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-4xl md:text-6xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-[#FF6500]">Skills</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            I work with a variety of technologies to build robust and scalable applications.
            Here are some of the tools in my arsenal:
          </motion.p>
          <motion.div 
            ref={skillsRef}
            className="flex flex-wrap gap-4 mt-4"
            variants={containerVariants}
            initial="hidden"
            animate={skillsInView ? "visible" : "hidden"}
          >
            {skills.map((skill) => (
              <motion.div 
                key={skill.name}
                variants={skillVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  transition: { duration: 0.2, type: "spring", stiffness: 300 }
                }}
                className="px-4 py-2 rounded-full border border-gray-800 bg-gray-900/50 hover:border-[#FF6500] hover:text-[#FF6500] transition-colors cursor-default will-change-transform"
              >
                {skill.name}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Side - Earth 3D Model with Skills Ring */}
        <motion.div 
          ref={canvasRef}
          className="h-[500px] md:h-[700px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          variants={canvasVariants}
          initial="hidden"
          animate={canvasInView ? "visible" : "hidden"}

        >
          <EarthCanvas skills={ringSkills} visible={canvasInView} />
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;

