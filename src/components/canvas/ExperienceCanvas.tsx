import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const HolographicRings = ({ visible }: { visible: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  useFrame((state) => {
    if (!visible || !ref.current) return;
    
    // Gyroscopic rotation
    ref.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    invalidate();
  });

  return (
    <group ref={ref}>
      {/* Outer Ring - Cyan */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.5, 0.02, 16, 100]} />
        <meshStandardMaterial 
          color="#22d3ee" // Cyan
          emissive="#22d3ee"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Middle Ring - Orange (Opposite rotation via group nesting or just static relative offset) */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.8, 0.03, 16, 100]} />
        <meshStandardMaterial 
          color="#FF6500" // Orange
          emissive="#FF6500"
          emissiveIntensity={2}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner Ring - White/Glitch */}
      <mesh rotation={[-Math.PI / 4, 0, Math.PI / 6]}>
        <torusGeometry args={[2.2, 0.01, 16, 100]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={1.5}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

const DataStream = ({ visible }: { visible: boolean }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();

  // Create random particles
  const particles = useMemo(() => {
    const count = 100; // Number of data bits. Reduced from 200 for cleanup/performance if needed
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
        // Random spread
      positions[i * 3] = (Math.random() - 0.5) * 15; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
      speeds[i] = 0.02 + Math.random() * 0.05; // Random upward speed
    }
    
    return { positions, speeds };
  }, []);

  useFrame(() => {
    if (!visible || !pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Move particles up
    for (let i = 0; i < particles.speeds.length; i++) {
      positions[i * 3 + 1] += particles.speeds[i];
      
      // Reset if too high
      if (positions[i * 3 + 1] > 8) {
        positions[i * 3 + 1] = -8;
        positions[i * 3] = (Math.random() - 0.5) * 15; // New X
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // New Z
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    invalidate();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={particles.positions.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#FF6500" // Data color
        transparent
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

const ExperienceCanvas = ({ visible = true }: { visible?: boolean }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none -z-10">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }} 
        dpr={[1, 1.5]} 
        frameloop="demand" // Only render when invalidated
        performance={{ min: 0.3 }}
      >
        <fog attach="fog" args={['#050505', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#22d3ee" /> {/* Cyan tint */}
        <pointLight position={[-10, -10, 10]} intensity={1.5} color="#FF6500" /> {/* Orange tint */}
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <HolographicRings visible={visible} />
        <DataStream visible={visible} />
      </Canvas>
    </div>
  );
};

export default ExperienceCanvas;
