import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

const Rocket = () => {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} rotation={[0, 0, Math.PI / 4]} scale={1.2}>
        {/* Main Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 3, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.5} />
        </mesh>

        {/* Nose Cone */}
        <mesh position={[0, 2, 0]}>
          <coneGeometry args={[0.4, 1, 32]} />
          <meshStandardMaterial color="#FF6500" roughness={0.3} />
        </mesh>

        {/* Engine/Thruster */}
        <mesh position={[0, -1.6, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 0.5, 32]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Thruster Glow */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.1, 0.4, 0.8, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} transparent opacity={0.6} />
        </mesh>

        {/* Fins */}
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rotation, i) => (
          <group key={i} rotation={[0, rotation, 0]}>
            <mesh position={[0.4, -1, 0]}>
              <boxGeometry args={[0.5, 1, 0.1]} />
              <meshStandardMaterial color="#FF6500" />
            </mesh>
          </group>
        ))}
        
        {/* Window */}
        <mesh position={[0, 1, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1} />
        </mesh>
      </group>
    </Float>
  );
};

const ContactCanvas = ({ visible = true }: { visible?: boolean }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    setIsMobile(mediaQuery.matches);
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };
    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        dpr={[1, 1.5]} 
        frameloop={visible ? "always" : "demand"}
      >
        <fog attach="fog" args={['#050505', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-10, -10, 10]} intensity={1.5} color="#FF6500" />
        
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />

        <group position={isMobile ? [0, -2, 0] : [1.5, 0, 0]} scale={isMobile ? 0.8 : 1}> {/* Responsive position/scale */}
          <Rocket />
        </group>
        
        {/* Distant Planet/Moon */}
         <mesh position={[-4, 3, -5]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#22d3ee" wireframe transparent opacity={0.2} />
        </mesh>
        
      </Canvas>
    </div>
  );
};

export default ContactCanvas;
