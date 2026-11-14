import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Day-theme counterpart of the Earth model: a living sun.
 * - surface: sphere with an animated noise shader (slow boiling plasma)
 * - corona: soft radial glow that always faces the camera
 * - rays: alternating long / short spikes that slowly turn
 */

const vertexShader = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vView;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vPos) * 2.2;
    float n = fbm(p + vec3(0.0, uTime * 0.08, uTime * 0.05));
    float n2 = fbm(p * 2.5 - vec3(uTime * 0.1, 0.0, 0.0) + n);
    float t = smoothstep(0.25, 0.85, n * 0.6 + n2 * 0.5);

    vec3 deep = vec3(1.0, 0.38, 0.02);
    vec3 mid = vec3(1.0, 0.64, 0.08);
    vec3 hot = vec3(1.0, 0.92, 0.58);
    vec3 col = mix(deep, mid, smoothstep(0.0, 0.5, t));
    col = mix(col, hot, smoothstep(0.5, 1.0, t));

    // brighter limb, like a real corona edge
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.0);
    col = mix(col, vec3(1.0, 0.82, 0.36), fresnel * 0.65);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SUN_RADIUS = 3.7;
const RAY_COUNT = 16;

// Soft radial glow drawn once to a canvas and used as a texture
const makeGlowTexture = () => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 190, 60, 0.9)');
  g.addColorStop(0.45, 'rgba(255, 170, 50, 0.45)');
  g.addColorStop(0.75, 'rgba(255, 160, 40, 0.14)');
  g.addColorStop(1, 'rgba(255, 160, 40, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
};

// A tapered spike pointing along +Y, base at y=0
const makeRayGeometry = () => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, 0);
  shape.lineTo(0.5, 0);
  shape.lineTo(0, 1);
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
};

const SunModel = ({ visible }: { visible: boolean }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const rayGeometry = useMemo(() => makeRayGeometry(), []);

  useFrame((_, delta) => {
    if (!visible) return;
    if (materialRef.current) materialRef.current.uniforms.uTime.value += delta;
    if (sphereRef.current) sphereRef.current.rotation.y += delta * 0.05;
    if (raysRef.current) raysRef.current.rotation.z += delta * 0.06;
    invalidate();
  });

  return (
    <group>
      {/* corona + rays always face the camera */}
      <Billboard>
        <mesh renderOrder={0}>
          <planeGeometry args={[SUN_RADIUS * 4.6, SUN_RADIUS * 4.6]} />
          <meshBasicMaterial map={glowTexture} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={raysRef}>
          {Array.from({ length: RAY_COUNT }, (_, i) => {
            const long = i % 2 === 0;
            const angle = (i / RAY_COUNT) * Math.PI * 2;
            return (
              <group key={i} rotation={[0, 0, angle]}>
                <mesh
                  geometry={rayGeometry}
                  position={[0, SUN_RADIUS * 1.12, 0]}
                  scale={[long ? 0.55 : 0.4, long ? SUN_RADIUS * 0.62 : SUN_RADIUS * 0.36, 1]}
                  renderOrder={0}
                >
                  <meshBasicMaterial color="#ffb21f" transparent opacity={long ? 0.75 : 0.55} depthWrite={false} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
        </group>
      </Billboard>

      {/* the star itself */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
        <shaderMaterial ref={materialRef} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default SunModel;
