import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import EarthCanvas from '../canvas/Earth';

// Skills grouped as on the resume
const skillGroups = [
  { title: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'SQL'] },
  {
    title: 'Backend',
    items: ['Node.js', 'NestJS', 'Express', 'FastAPI', 'Django & DRF', 'Flask', 'Sanic', 'REST APIs', 'Microservices', 'Async Programming'],
  },
  { title: 'Frontend & Desktop', items: ['React', 'Next.js', 'Angular', 'Svelte', 'Tailwind CSS', 'Electron', 'Tauri'] },
  {
    title: 'Android (Native)',
    items: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Room', 'Coroutines & Flow', 'MVVM / Clean Architecture', 'BiometricPrompt'],
  },
  { title: 'Flutter', items: ['Dart', 'BLoC / Cubit', 'get_it', 'Firebase Auth', 'Cloud Firestore'] },
  {
    title: 'Data & Storage',
    items: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Supabase', 'Firebase', 'Appwrite', 'AWS S3 / MinIO'],
  },
  {
    title: 'AI, LLM & OCR',
    items: ['Gemini API', 'OpenAI API', 'xAI Grok', 'Whisper', 'Hugging Face', 'Ollama', 'Tesseract OCR', 'OpenCV', 'Prompt Engineering'],
  },
  {
    title: 'Automation & Testing',
    items: ['Chrome Extensions (MV3)', 'Playwright', 'Lighthouse', 'ETL Pipelines', 'MongoDB Change Streams', 'Workflow Automation'],
  },
  {
    title: 'DevOps & Tools',
    items: ['Docker', 'GitHub Actions (CI/CD)', 'Git', 'Linux', 'Postman', 'Swagger', 'Cursor', 'Claude Code'],
  },
];

// Technologies shown as badges orbiting the 3D planet
const ringSkills = [
  { name: 'TypeScript', icon: '/icons/ring/typescript.png' },
  { name: 'React', icon: '/icons/ring/react.png' },
  { name: 'Next.js', icon: '/icons/ring/nextjs.png' },
  { name: 'Node.js', icon: '/icons/ring/nodejs.png' },
  { name: 'Python', icon: '/icons/ring/python.png' },
  { name: 'Kotlin', icon: '/icons/ring/kotlin.png' },
  { name: 'Flutter', icon: '/icons/ring/flutter.png' },
  { name: 'Svelte', icon: '/icons/ring/svelte.png' },
  { name: 'MongoDB', icon: '/icons/ring/mongodb.png' },
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
        staggerChildren: 0.08,
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
            From full-stack web apps and AI-powered data pipelines to native Android and Flutter apps,
            here is the toolkit I build with:
          </motion.p>
          <motion.div
            ref={skillsRef}
            className="flex flex-col gap-5 mt-2"
            variants={containerVariants}
            initial="hidden"
            animate={skillsInView ? "visible" : "hidden"}
          >
            {skillGroups.map((group) => (
              <motion.div key={group.title} variants={skillVariants} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#FF6500]/80">
                  {group.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <motion.span
                      key={item}
                      whileHover={{ scale: 1.05, y: -3, transition: { duration: 0.2, type: "spring", stiffness: 300 } }}
                      className="px-3 py-1 text-sm rounded-full border border-gray-800 bg-gray-900/50 text-gray-300 hover:border-[#FF6500] hover:text-[#FF6500] transition-colors cursor-default will-change-transform"
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
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

