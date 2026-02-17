import { Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useState, useRef } from "react";
import ContactCanvas from "../canvas/ContactCanvas";

const Contact = () => {
    const [isHovered, setIsHovered] = useState(false);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, margin: "-100px" });

    return (
        <section id="contact" ref={ref} className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#050505] text-white pt-20 pb-40 relative overflow-hidden">
            
            <ContactCanvas visible={isInView} />
            
            {/* Background Noise/Grid (Optional subtle texture) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center">
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="mb-12"
                >
                    <div className="inline-block px-3 py-1 bg-red-900/20 border border-red-500/30 rounded-full text-red-500 font-mono text-xs mb-6 tracking-widest">
                        ● SYSTEM_MESSAGE
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        Ready to create something?
                    </h2>
                    
                    <p className="text-gray-400 text-lg max-w-xl mx-auto font-mono">
                        I read every email. Unless it's spam. <br className="hidden md:block"/>
                        Then I define a filter rule to delete it.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
                    className="relative group"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className={`absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-20' : ''}`} />
                    
                    <a 
                        href="mailto:shreyashnyk1@gmail.com"
                        className="relative inline-block text-3xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 hover:to-white transition-all duration-300 tracking-tight px-2 pb-2"
                    >
                        shreyashnyk1@gmail.com
                    </a>
                    
                    {/* Sarcastic tooltip/subtitle */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full text-sm text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        (Yes, this is a distinct mailto link)
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
                    className="mt-24 flex flex-col items-center gap-8"
                >
                    <p className="text-gray-600 text-sm font-mono">
                        Available for cool projects. <span className="text-orange-500/80">Boring ones cost double.</span>
                    </p>

                    {/* Social Links for Mobile (Hidden on LG screens where sidebar exists) */}
                    <div className="flex gap-6 lg:hidden">
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
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default Contact;
