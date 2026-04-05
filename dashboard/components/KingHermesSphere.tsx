'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface KingHermesSphereProps {
  onClick?: () => void;
}

export function KingHermesSphere({ onClick }: KingHermesSphereProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  // Particle ring around the sphere
  const particleRing = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 6 + Math.random() * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    return positions;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (groupRef.current) {
      // Slow rotation of entire group
      groupRef.current.rotation.y = time * 0.1;
    }

    if (sphereRef.current) {
      // Gentle floating
      sphereRef.current.position.y = Math.sin(time * 0.5) * 0.3;

      // Pulse scale
      const pulse = 1 + Math.sin(time * 2) * 0.02;
      sphereRef.current.scale.setScalar(pulse);
    }

    if (glowRef.current) {
      glowRef.current.scale.setScalar(1.2 + Math.sin(time * 1.5) * 0.1);
      glowRef.current.rotation.y = -time * 0.2;
    }

    if (ringRef.current) {
      ringRef.current.rotation.x = time * 0.3;
      ringRef.current.rotation.y = time * 0.2;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = -time * 0.5;
      innerRingRef.current.rotation.z = time * 0.3;
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = time * 0.15;
      outerRingRef.current.rotation.z = Math.sin(time * 0.2) * 0.2;
    }
  });

  return (
    <group ref={groupRef} onClick={onClick}>
      {/* Main King Hermes Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={1.0}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer glow layers */}
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[5.0, 32, 32]} />
        <meshBasicMaterial
          color="#FF6B00"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rotating rings */}
      <mesh ref={ringRef}>
        <torusGeometry args={[5, 0.05, 16, 100]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={innerRingRef}>
        <torusGeometry args={[4, 0.03, 16, 80]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={outerRingRef}>
        <torusGeometry args={[6.5, 0.08, 16, 120]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Particle ring */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleRing.length / 3}
            array={particleRing}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#FFD700"
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Crown effect - small spheres around top */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        const radius = 3.8;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              2.5 + Math.sin(angle * 2) * 0.5,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
