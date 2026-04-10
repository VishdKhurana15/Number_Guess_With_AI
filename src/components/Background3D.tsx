import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

export type Mood = 'neutral' | 'lower' | 'higher' | 'close' | 'won' | 'lost';

interface BlobProps {
  mood: Mood;
}

const Blob: React.FC<BlobProps> = ({ mood }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const config = useMemo(() => {
    switch (mood) {
      case 'won':
        return { color: '#22c55e', speed: 5, distort: 0.6, scale: 1.5 }; // Green
      case 'lost':
      case 'close':
      case 'higher':
        return { color: '#ef4444', speed: 8, distort: 0.8, scale: 1.3 }; // Red
      case 'lower':
        return { color: '#3b82f6', speed: 3, distort: 0.4, scale: 1.1 }; // Blue
      default:
        return { color: '#a855f7', speed: 2, distort: 0.4, scale: 1 }; // Purple/Neutral
    }
  }, [mood]);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    meshRef.current.rotation.y = Math.cos(state.clock.getElapsedTime()) * 0.2;
  });

  return (
    <Float speed={config.speed} rotationIntensity={2} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={config.scale}>
        <MeshDistortMaterial
          color={config.color}
          speed={config.speed}
          distort={config.distort}
          radius={1}
        />
      </Sphere>
    </Float>
  );
};

export const Background3D: React.FC<{ mood: Mood }> = ({ mood }) => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} color="purple" />
        <Blob mood={mood} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial transparent opacity={0.1} color="#222" />
        </mesh>
      </Canvas>
    </div>
  );
};
