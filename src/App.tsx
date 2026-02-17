
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Contact from "./components/sections/Contact";

import Preloader from "./components/ui/Preloader";
import Cursor from "./components/ui/Cursor";
import { SocialSidebar } from "./components/ui/SocialSidebar";
import { Emailbar } from "./components/ui/Emailbar";
import { FloatingDock } from "./components/ui/FloatingDock";
import { useEffect, useState } from "react";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Force scroll to top on refresh
    window.scrollTo(0, 0);
    
    // Optional: Prevent browser from restoring scroll position automatically
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-x-hidden bg-[#050505]">
      <Cursor />
      <Preloader onComplete={() => setIsLoading(false)} />
      
      {/* Global UI Elements */}
      <SocialSidebar />
      <Emailbar />
      <FloatingDock show={!isLoading} />
      
      {/* Sections */}
      <Hero showUI={!isLoading} />
      <About />
      <Skills />
      <Experience />
      <Contact />
    </div>
  );
}

export default App;
