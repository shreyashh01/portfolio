import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
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

const AUTO_MS = 4500; // time each category stays on screen while auto-cycling
const totalSkills = skillGroups.reduce((n, g) => n + g.items.length, 0);

/**
 * Compact skills browser: a category rail + the active category's skills.
 * Auto-cycles with a progress line, pauses while hovered, and any click takes over.
 */
const SkillsPanel: React.FC<{ inView: boolean }> = ({ inView }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const cycling = inView && !paused && !reduceMotion;

  useEffect(() => {
    if (!cycling) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % skillGroups.length), AUTO_MS);
    return () => clearTimeout(id);
  }, [index, cycling]);

  const group = skillGroups[index];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-col md:flex-row">
        {/* Category rail */}
        <div
          role="tablist"
          aria-label="Skill categories"
          className="flex md:flex-col gap-1 p-2 overflow-x-auto md:overflow-visible md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/10 [scrollbar-width:none]"
        >
          {skillGroups.map((g, i) => {
            const selected = i === index;
            return (
              <button
                key={g.title}
                role="tab"
                aria-selected={selected}
                onClick={() => setIndex(i)}
                onFocus={() => setIndex(i)}
                className={`relative flex items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected ? 'text-white' : 'text-gray-500 hover:text-gray-200'
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="skill-rail-active"
                    className="absolute inset-0 rounded-lg bg-[#FF6500]/10 ring-1 ring-[#FF6500]/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{g.title}</span>
                <span className={`relative font-mono text-xs ${selected ? 'text-[#FF6500]' : 'text-gray-600'}`}>
                  {String(g.items.length).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active category */}
        <div role="tabpanel" className="flex-1 p-5 md:p-6 min-h-[230px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF6500]/80">
                {String(index + 1).padStart(2, '0')} / {String(skillGroups.length).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-white">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item, i) => (
                  <motion.span
                    key={item}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.04 * i, type: 'spring', stiffness: 380, damping: 24 }}
                    whileHover={{ y: -3 }}
                    className="cursor-default rounded-full border border-gray-700/80 bg-gray-900/60 px-3 py-1 text-sm text-gray-200 transition-colors hover:border-[#FF6500] hover:text-[#FF6500]"
                  >
                    {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Auto-cycle progress */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
        {cycling && (
          <motion.div
            key={index}
            className="h-full origin-left bg-[#FF6500]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTO_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>
    </div>
  );
};

const Skills: React.FC = () => {
  const sectionRef = useRef(null);
  const skillsRef = useRef(null);
  const canvasRef = useRef(null);
  
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });
  const skillsInView = useInView(skillsRef, { once: false, margin: "-50px" });
  const canvasInView = useInView(canvasRef, { once: false, margin: "-100px" });

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
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-6 items-center">
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
          <div ref={skillsRef}>
            <SkillsPanel inView={skillsInView} />
            <p className="mt-3 font-mono text-xs text-gray-600">
              {totalSkills} technologies across {skillGroups.length} areas
            </p>
          </div>
        </motion.div>

        {/* Right Side - Earth 3D Model with Skills Ring */}
        <motion.div 
          ref={canvasRef}
          className="h-[520px] md:h-[760px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
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

