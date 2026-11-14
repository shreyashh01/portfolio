import { useTexture, Billboard } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { SRGBColorSpace, type Texture } from 'three';

interface BallProps {
  imgUrl: string;
  visible?: boolean;
  delay?: number;
  /** day theme: cream disc instead of dark glass */
  light?: boolean;
}

const ORANGE = '#FF6500'; // portfolio accent
const RADIUS = 1.05;

/**
 * Orbit badge: a dark glass disc with an orange rim and the tech icon on top.
 * Always faces the camera (Billboard) and pops in with a spring.
 */
const Ball = ({ imgUrl, visible = true, delay = 0, light = false }: BallProps) => {
  const [icon] = useTexture([imgUrl], (tex) => {
    (Array.isArray(tex) ? tex : [tex]).forEach((t: Texture) => {
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 8;
    });
  });

  const { scale, fade } = useSpring({
    scale: visible ? 1 : 0,
    fade: visible ? 1 : 0,
    config: { mass: 1, tension: 260, friction: 18 },
    delay: visible ? delay * 1000 : 0,
  });

  return (
    <Billboard>
      <animated.group scale={scale}>
        {/* soft halo */}
        <mesh renderOrder={1}>
          <circleGeometry args={[RADIUS * 1.28, 64]} />
          <animated.meshBasicMaterial color={ORANGE} transparent depthWrite={false} opacity={fade.to((o) => o * (light ? 0.16 : 0.1))} />
        </mesh>
        {/* glass body */}
        <mesh position={[0, 0, 0.01]} renderOrder={2}>
          <circleGeometry args={[RADIUS, 64]} />
          <animated.meshBasicMaterial color={light ? "#fff9ee" : "#0d0e17"} transparent depthWrite={false} toneMapped={false} opacity={fade.to((o) => o * (light ? 0.97 : 0.93))} />
        </mesh>
        {/* orange rim */}
        <mesh position={[0, 0, 0.02]} renderOrder={3}>
          <ringGeometry args={[RADIUS * 0.94, RADIUS, 64]} />
          <animated.meshBasicMaterial color={ORANGE} transparent depthWrite={false} opacity={fade.to((o) => o * 0.9)} />
        </mesh>
        {/* icon */}
        <mesh position={[0, 0, 0.03]} renderOrder={4}>
          <planeGeometry args={[RADIUS * 1.2, RADIUS * 1.2]} />
          <meshBasicMaterial map={icon} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </animated.group>
    </Billboard>
  );
};

// Warm the cache so switching theme never suspends the whole scene on a missing texture
useTexture.preload('/icons/ring/amazonwebservices-day.png');

export default Ball;
