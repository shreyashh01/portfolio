import { Component, Suspense, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import Ball from './Ball';

const EarthModel = () => {
  const earth = useGLTF('/planet/scene.gltf');
  
  const scene = useMemo(() => {
    return earth.scene.clone();
  }, [earth.scene]);

  return (
    <primitive
      object={scene}
      scale={5}
      position-y={0}
    />
  );
};

// A single icon failing to load must not take down the whole canvas.
class IconBoundary extends Component<{ children: ReactNode; name: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn(`Skill icon "${this.props.name}" failed to load`, error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface Skill {
  name: string;
  icon: string;
}

const SkillsRing = ({ skills, visible }: { skills: Skill[], visible: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [ballsVisible, setBallsVisible] = useState(false);
  const { invalidate } = useThree();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setBallsVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setBallsVisible(false);
    }
  }, [visible]);

  useFrame(() => {
    if (!visible) return; // Optimization: Stop rendering when not visible
    
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001; 
      invalidate(); // Request next frame in demand mode
    }
  });

  const radius = 8.6;

  return (
    <group ref={groupRef} rotation={[0.85, 0.5, -0.25]}>
      {/* orbit track: thin orange ring in the same plane the badges travel on */}
      <mesh rotation={[Math.PI / 2, 0, 0]} visible={ballsVisible}>
        <torusGeometry args={[radius, 0.018, 8, 200]} />
        <meshBasicMaterial color="#FF6500" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} visible={ballsVisible}>
        <torusGeometry args={[radius, 0.09, 8, 200]} />
        <meshBasicMaterial color="#FF6500" transparent opacity={0.06} depthWrite={false} />
      </mesh>
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={skill.name} position={[x, 0, z]}>
            <IconBoundary name={skill.name}>
              <Ball
                imgUrl={skill.icon}
                visible={ballsVisible}
                delay={index * 0.25}
              />
            </IconBoundary>
          </group>
        );
      })}
    </group>
  );
};

// Pull the camera back on narrow canvases so the whole orbit always stays in frame.
const BASE_CAMERA = new THREE.Vector3(-15, 10, 20);
const FitCamera = () => {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const zoomOut = Math.max(1, 0.85 / aspect);
    camera.position.copy(BASE_CAMERA).multiplyScalar(zoomOut);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
};

const EarthCanvas = ({ skills = [], visible = true }: { skills?: Skill[], visible?: boolean }) => {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      gl={{ 
        preserveDrawingBuffer: true,
        antialias: false,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true
      }}
      performance={{ min: 0.3 }}
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [-15, 10, 20],
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1} />
        <directionalLight position={[0, 0, 0.05]} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.2}
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
          enableDamping={true}
          dampingFactor={0.1}
        />
        <FitCamera />
        <EarthModel />
        {skills.length > 0 && <SkillsRing skills={skills} visible={visible} />}
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
