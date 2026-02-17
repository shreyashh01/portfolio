import { Decal, useTexture, Icosahedron, Billboard } from '@react-three/drei';
import { useRef } from 'react';
import { useSpring, animated } from '@react-spring/three';

interface BallProps {
  imgUrl: string;
  visible?: boolean;
  delay?: number;
}

const Ball = ({ imgUrl, visible = true, delay = 0 }: BallProps) => {
  const [decal] = useTexture([imgUrl]);
  const meshRef = useRef<any>(null);

  // Spring animation for entrance (smooth fade)
  // Spring animation for entrance (smooth pop)
  // Spring animation for entrance (smooth pop)
  const springs = useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    config: { 
      mass: 1,
      tension: 280, // Higher tension for more snap
      friction: 18, // Adjusted friction for a nice wobble without being too loose
    },
    delay: visible ? delay * 1000 : 0, // No delay when hiding for snappy exit 
  });

  return (
    <Billboard>
      <animated.mesh 
        ref={meshRef}
        scale={springs.scale}
      >
        <Icosahedron args={[1, 1]}>
          <animated.meshStandardMaterial
            color='#ffffff'
            flatShading
            transparent
            opacity={springs.opacity}
          />
          <Decal
            position={[0, 0, 1]}
            rotation={[2 * Math.PI, 0, 6.25]}
            scale={1}
            map={decal}
          />
        </Icosahedron>
      </animated.mesh>
    </Billboard>
  );
};

export default Ball;
