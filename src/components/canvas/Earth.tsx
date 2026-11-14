import { Component, Suspense, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import Ball from './Ball';

// Narrow FOV + a distant camera = weak perspective, so orbs spread evenly around the ring
// instead of looking huge up close and bunched together at the back.
const FOV = 28;
const BASE_CAMERA = new THREE.Vector3(-15, 10, 20).multiplyScalar(1.68);
const SHIFT_RIGHT = 0.09; // push the scene right (fraction of canvas width), away from the skills panel


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

// Ring plane: tilted away from the camera by OPEN_ANGLE (0 = face-on circle, 90 = edge-on line).
// A rounder projected ellipse keeps the orbs evenly spread; TILT_DIRECTION picks which way it leans.
const OPEN_ANGLE = THREE.MathUtils.degToRad(40);
const TILT_DIRECTION = THREE.MathUtils.degToRad(45);
const RING_TILT = (() => {
  const toCamera = BASE_CAMERA.clone().normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toCamera).normalize();
  const up = new THREE.Vector3().crossVectors(toCamera, right).normalize();
  const lean = right.multiplyScalar(Math.cos(TILT_DIRECTION)).add(up.multiplyScalar(Math.sin(TILT_DIRECTION)));
  const normal = toCamera.multiplyScalar(Math.cos(OPEN_ANGLE)).add(lean.multiplyScalar(Math.sin(OPEN_ANGLE)));
  return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.normalize());
})();

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
    <group quaternion={RING_TILT}>
    <group ref={groupRef}>
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
    </group>
  );
};

// Pull the camera back on narrow canvases so the whole orbit always stays in frame.
// Pull the camera back on narrow canvases so the whole orbit always stays in frame.
const FitCamera = () => {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const zoomOut = Math.max(1, 0.85 / aspect);
    camera.position.copy(BASE_CAMERA).multiplyScalar(zoomOut);
    // Negative x offset slides the rendered image to the right without moving the orbit pivot
    (camera as THREE.PerspectiveCamera).setViewOffset(
      size.width, size.height, -size.width * SHIFT_RIGHT, 0, size.width, size.height,
    );
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
        fov: FOV,
        near: 0.1,
        far: 400,
        position: BASE_CAMERA.toArray(),
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
