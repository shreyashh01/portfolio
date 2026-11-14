import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

/* Shared 3D props for the day theme: clouds, pollen and the hot-air balloon. */

const CLOUD_PUFFS: Array<[number, number, number, number]> = [
  // x, y, z, radius
  [-1.1, 0, 0, 0.62],
  [-0.45, 0.28, 0.1, 0.82],
  [0.35, 0.34, -0.05, 0.92],
  [1.05, 0.05, 0.05, 0.66],
  [0.1, -0.12, 0.25, 0.74],
];

/** One puffy low-poly cloud. */
export const Cloud = ({ opacity = 0.9 }: { opacity?: number }) => (
  <group>
    {CLOUD_PUFFS.map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]} scale={[1, 0.78, 0.9]}>
        <sphereGeometry args={[r, 20, 16]} />
        {/* self-lit so clouds read as white, with just a hint of shading from the scene light */}
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.72} roughness={1} transparent opacity={opacity} depthWrite={false} />
      </mesh>
    ))}
  </group>
);

interface CloudSpec { position: [number, number, number]; scale: number; speed: number }

/** A handful of clouds drifting sideways, wrapping around the edges. */
export const DriftingClouds = ({
  visible,
  specs,
  span = 14,
  opacity = 0.85,
}: {
  visible: boolean;
  specs: CloudSpec[];
  span?: number;
  opacity?: number;
}) => {
  const refs = useRef<Array<THREE.Group | null>>([]);
  const { invalidate } = useThree();

  useFrame((_, delta) => {
    if (!visible) return;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.x += specs[i].speed * delta;
      if (g.position.x > span) g.position.x = -span;
    });
    invalidate();
  });

  return (
    <>
      {specs.map((spec, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={spec.position}
          scale={spec.scale}
        >
          <Cloud opacity={opacity} />
        </group>
      ))}
    </>
  );
};

/** Golden motes floating upward - the day counterpart of the night "data stream". */
export const Pollen = ({ visible, count = 90 }: { visible: boolean; count?: number }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    // deterministic pseudo-random so renders stay pure
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 16;
      positions[i * 3 + 1] = (rand() - 0.5) * 16;
      positions[i * 3 + 2] = (rand() - 0.5) * 8;
      speeds[i] = 0.25 + rand() * 0.5;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state, delta) => {
    if (!visible || !pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const t = state.clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * delta;
      arr[i * 3] += Math.sin(t * 0.6 + i) * 0.002; // gentle sideways sway
      if (arr[i * 3 + 1] > 8) arr[i * 3 + 1] = -8;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    invalidate();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#f59e0b" transparent opacity={0.75} sizeAttenuation />
    </points>
  );
};

const GORES = 10;
const GORE_COLORS = ['#ff6500', '#fff3dc', '#ffb703'];

/**
 * Hot-air balloon - the day counterpart of the night rocket.
 * Envelope is built from vertical "gores" (sphere slices) in alternating colours.
 */
export const HotAirBalloon = () => (
  <Float speed={1.4} rotationIntensity={0.25} floatIntensity={1.4}>
    <group rotation={[0, 0, -0.06]}>
      {/* Envelope */}
      <group scale={[1, 1.18, 1]} position={[0, 0.9, 0]}>
        {Array.from({ length: GORES }, (_, i) => (
          <mesh key={i}>
            <sphereGeometry args={[1.5, 8, 24, (i / GORES) * Math.PI * 2, (Math.PI * 2) / GORES, 0, Math.PI * 0.82]} />
            <meshStandardMaterial color={GORE_COLORS[i % GORE_COLORS.length]} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      {/* Skirt: tapers from the envelope down to the burner */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[0.8, 0.34, 0.6, 24, 1, true]} />
        <meshStandardMaterial color="#ff6500" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Burner glow */}
      <mesh position={[0, -1.05, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={2} />
      </mesh>

      {/* Ropes */}
      {[
        [0.3, 0.3],
        [-0.3, 0.3],
        [0.3, -0.3],
        [-0.3, -0.3],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -1.45, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.9, 6]} />
          <meshStandardMaterial color="#5b4636" />
        </mesh>
      ))}

      {/* Basket */}
      <mesh position={[0, -2.1, 0]}>
        <boxGeometry args={[0.72, 0.5, 0.72]} />
        <meshStandardMaterial color="#9a6a3a" roughness={0.95} />
      </mesh>
      <mesh position={[0, -1.84, 0]}>
        <boxGeometry args={[0.8, 0.07, 0.8]} />
        <meshStandardMaterial color="#6f4a26" roughness={0.9} />
      </mesh>
    </group>
  </Float>
);
