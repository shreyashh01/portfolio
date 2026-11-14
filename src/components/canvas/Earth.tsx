import { Component, Suspense, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import Ball from './Ball';
import SunModel from './Sun';
import { useTheme } from '../../theme/ThemeContext';

// Narrow FOV + a distant camera = weak perspective, so orbs spread evenly around the ring
// instead of looking huge up close and bunched together at the back.
const FOV = 28;
const BASE_CAMERA = new THREE.Vector3(-15, 10, 20).multiplyScalar(1.68);
// Camera elevation is locked to the design angle. (OrbitControls used to clamp it to the horizon,
// which changed how the ring is seen.) The camera never auto-rotates: the planet spins instead,
// so the ring keeps the same open view no matter how long the page stays open.
const POLAR = Math.acos(BASE_CAMERA.y / BASE_CAMERA.length());
const ORBIT_RADIUS = 8.6;
// Furthest any badge (incl. its halo) can reach from the centre, at ANY viewing angle,
// plus a margin. Sizing the view to this circle guarantees nothing is ever cut off,
// even if the visitor drags the planet around.
const SAFE_HALF_EXTENT = ORBIT_RADIUS + 1.4 + 0.5;
const PERSPECTIVE_MARGIN = 1.12; // badges nearer the camera look bigger than the flat radius suggests


const EarthModel = ({ visible }: { visible: boolean }) => {
  const earth = useGLTF('/planet/scene.gltf');
  const spinRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const scene = useMemo(() => {
    return earth.scene.clone();
  }, [earth.scene]);

  useFrame((_, delta) => {
    if (!visible || !spinRef.current) return;
    spinRef.current.rotation.y += delta * 0.12; // slow planetary spin
    invalidate();
  });

  return (
    <group ref={spinRef}>
      <primitive object={scene} scale={5} position-y={0} />
    </group>
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
  /** optional icon variant that reads on the cream day-theme badge */
  iconDay?: string;
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

const SkillsRing = ({ skills, visible, light }: { skills: Skill[], visible: boolean, light: boolean }) => {
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

  const radius = ORBIT_RADIUS;

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
                light={light}
                imgUrl={light && skill.iconDay ? skill.iconDay : skill.icon}
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

// Choose the camera distance so the whole orbit fits the canvas on both axes, whatever its shape.
// Re-runs on every resize and re-applies the lens too, since a hot-reloaded canvas keeps its old camera.
const FitCamera = () => {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const needed = 2 * SAFE_HALF_EXTENT * PERSPECTIVE_MARGIN; // world units that must be visible on each axis
    const visibleHeight = Math.max(needed, needed / aspect);
    const distance = visibleHeight / (2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2));
    Object.assign(camera, { fov: FOV });
    camera.position.copy(BASE_CAMERA).setLength(distance);
    (camera as THREE.PerspectiveCamera).clearViewOffset();
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
};

const EarthCanvas = ({ skills = [], visible = true }: { skills?: Skill[], visible?: boolean }) => {
  // Read the theme out here: hooks inside <Canvas> run in a separate React root
  const light = useTheme().theme === 'light';
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
          enableZoom={false}
          enablePan={false}
          minPolarAngle={POLAR}
          maxPolarAngle={POLAR}
          enableDamping={true}
          dampingFactor={0.1}
        />
        <FitCamera />
        {light ? <SunModel visible={visible} /> : <EarthModel visible={visible} />}
        {skills.length > 0 && <SkillsRing skills={skills} visible={visible} light={light} />}
        <Preload all />
      </Suspense>
    </Canvas>
  );
};

export default EarthCanvas;
