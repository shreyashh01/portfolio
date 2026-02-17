import { motion, useInView } from "framer-motion";
import ExperienceCanvas from "../canvas/ExperienceCanvas";
import { useRef } from "react";

const experiences = [
  {
    id: "current",
    title: "Jr Full Stack Developer",
    company: "Perception and Quants",
    period: "Present",
    location: "Remote",
    description: [
      "Building scalable web applications using modern tech stack.",
      "Optimizing frontend performance and backend efficiency.",
      "Collaborating with cross-functional teams for product delivery."
    ]
  },
  {
    id: "proxie",
    title: "Software Developer",
    company: "Proxie Studio pvt ltd",
    period: "02/2024 – 05/2025",
    location: "Remote",
    description: [
      "Developed responsive web and desktop applications with a focus on performance and cross-platform compatibility.",
      "Collaborated with designers and stakeholders to translate requirements into user-centric features.",
      "Integrated REST APIs and optimized application performance, resulting in 25% faster load times and improved reliability."
    ]
  },
  {
    id: "bufferleaf",
    title: "Software Developer",
    company: "BufferLeaf.co",
    period: "Project Collaboration",
    location: "Remote",
    description: [
      "Engineered a Website Builder Prototype (Bufferleaf.co) for a Swedish MNC.",
      "Implemented drag-and-drop functionality using Next.js and Redux.",
      "Reduced page-creation time by 40% through intuitive UI/UX design.",
      "Collaborated with Proxie Studio on this strategic project."
    ]
  }
];

const projects = [
  {
    id: "volvo",
    title: "Volvo Anomalies Detection Dashboard",
    tech: ["Svelte", "ShadCN", "Supabase", "PostgreSQL", "WebSockets"],
    description: [
      "Built a real-time dashboard for camera-based anomaly detection.",
      "Enabled secure authentication and cloud storage using Supabase.",
      "Integrated WebSocket connections for live camera data.",
      "Enhanced UX using Framer Motion animations."
    ]
  },
  {
    id: "whisper",
    title: "Whisper AI Real-Time Transcription",
    tech: ["React", "Electron", "Supabase", "Hugging Face"],
    description: [
      "Designed a desktop application for real-time speech-to-text transcription with 4–5 second latency.",
      "Integrated Whisper AI to transcribe meetings within seconds.",
      "Programmed Google OAuth 2.0 authentication.",
      "Packaged the application using Electron for cross-platform use."
    ]
  },
  {
    id: "coverletter",
    title: "Make My Cover Letter",
    tech: ["Next.js", "Supabase", "Stripe", "Gemini API"],
    description: [
      "Built an AI-powered platform to generate personalized cover letters in under 10 seconds.",
      "Integrated Gemini API for resume analysis and content generation.",
      "Implemented Stripe payments and subscription management."
    ]
  },
  {
    id: "norrinventory",
    title: "NorrInventory – AI Inventory Management",
    tech: ["Next.js", "Python", "Sanic", "OpenCV"],
    description: [
      "Introduced an AI-powered system to scan invoices and manage inventory, reducing manual entry by 60%.",
      "Extracted structured data from images using the Moondream model and OpenCV.",
      "Stored and managed real-time data using Supabase."
    ]
  }
];

const Experience = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: "100px" }); // Margin to start/stop slightly outside

    return (
        <section id="experience" ref={containerRef} className="w-full min-h-screen py-20 relative overflow-hidden bg-[#050505]">
            {/* 3D Background */}
            <ExperienceCanvas visible={isInView} />
            
            {/* Ambient Glows */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="container mx-auto px-4 z-10 relative">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">EXPERIENCE</span>
                        <span className="text-[#FF6500]">.LOG</span>
                    </h2>
                    <div className="flex justify-center gap-2 text-xs font-mono text-gray-500">
                        <span>// SYSTEM_ACTIVE</span>
                        <span>// LOADING_HISTORY</span>
                    </div>
                </motion.div>

                <div className="max-w-5xl mx-auto relative">
                    {/* Central Timeline Line */}
                    <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gray-700 to-transparent md:-translate-x-1/2" />
                    
                    {/* EXPERIENCE ITEMS */}
                    {experiences.map((exp, index) => (
                        <div key={index} className={`relative flex flex-col md:flex-row gap-8 md:gap-0 mb-16 md:mb-24 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            
                            {/* Connector Dot */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: false, margin: "-100px" }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="absolute left-[20px] md:left-1/2 top-0 w-3 h-3 md:w-4 md:h-4 bg-[#050505] border-2 border-[#FF6500] rounded-full z-20 md:-translate-x-1/2 translate-y-2 shadow-[0_0_10px_#FF6500] will-change-transform"
                            />

                            {/* Date/Period (Opposite Side) */}
                            <div className="md:w-1/2 md:px-12 flex md:items-start md:justify-end">
                                <motion.div 
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className={`pl-12 md:pl-0 font-mono text-sm text-[#FF6500] tracking-widest uppercase ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'} w-full will-change-transform`}
                                >
                                    [{exp.period}]
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div className="md:w-1/2 md:px-12 pl-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                                    className="relative group will-change-transform"
                                >
                                    {/* Decorative HUD corners */}
                                    <div className="absolute -left-2 -top-2 w-4 h-4 border-l border-t border-gray-700 group-hover:border-[#FF6500] transition-colors duration-300" />
                                    <div className="absolute -right-2 -bottom-2 w-4 h-4 border-r border-b border-gray-700 group-hover:border-[#FF6500] transition-colors duration-300" />

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 group-hover:text-[#FF6500] transition-colors duration-300">
                                        {exp.title}
                                    </h3>
                                    <h4 className="text-lg text-gray-400 font-mono mb-4 flex items-center gap-2">
                                        @{exp.company}
                                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300">{exp.location}</span>
                                    </h4>

                                    <ul className="space-y-2 text-gray-300/80 leading-relaxed font-light">
                                        {exp.description.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="text-[#FF6500] mt-1.5 opacity-50 text-xs">►</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        </div>
                    ))}

                    {/* PROJECT SECTION DIVIDER */}
                    <div className="relative flex items-center justify-center my-24">
                         <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                         <div className="relative z-10 bg-[#050505] px-4 text-gray-500 font-mono text-sm tracking-widest">
                            // DEPLOYED_PROJECTS
                         </div>
                    </div>

                    {/* PROJECTS ITEMS */}
                    {projects.map((proj, index) => (
                        <div key={`proj-${index}`} className={`relative flex flex-col md:flex-row gap-8 md:gap-0 mb-16 md:mb-24 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                            
                            {/* Connector Dot */}
                            <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: false, margin: "-100px" }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="absolute left-[20px] md:left-1/2 top-0 w-3 h-3 md:w-4 md:h-4 bg-[#050505] border-2 border-cyan-500 rounded-full z-20 md:-translate-x-1/2 translate-y-2 shadow-[0_0_10px_#06b6d4] will-change-transform"
                            />

                            {/* Tech Stack (Opposite Side) */}
                            <div className="md:w-1/2 md:px-12 flex md:items-start md:justify-end">
                                <motion.div 
                                    initial={{ opacity: 0, x: index % 2 !== 0 ? 20 : -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                    className={`pl-12 md:pl-0 flex flex-wrap gap-2 ${index % 2 !== 0 ? 'md:justify-start' : 'md:justify-end'} w-full content-start will-change-transform`}
                                >
                                    {proj.tech.map((t, i) => (
                                        <span key={i} className="text-xs font-mono text-cyan-400 bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/30">
                                            {t}
                                        </span>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Content */}
                            <div className="md:w-1/2 md:px-12 pl-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                                    className="relative group will-change-transform"
                                >
                                    {/* Decorative HUD corners - Cyan for projects */}
                                    <div className="absolute -left-2 -top-2 w-4 h-4 border-l border-t border-gray-700 group-hover:border-cyan-500 transition-colors duration-300" />
                                    <div className="absolute -right-2 -bottom-2 w-4 h-4 border-r border-b border-gray-700 group-hover:border-cyan-500 transition-colors duration-300" />

                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                                        {proj.title}
                                    </h3>

                                    <ul className="space-y-2 text-gray-300/80 leading-relaxed font-light">
                                        {proj.description.map((item, i) => (
                                            <li key={i} className="flex gap-3">
                                                <span className="text-cyan-500 mt-1.5 opacity-50 text-xs">►</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </section>
    );
};

export default Experience;
