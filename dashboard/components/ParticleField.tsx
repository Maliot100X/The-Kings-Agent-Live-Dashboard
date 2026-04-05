'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  color?: string;
}

export function ParticleField({ count = 2500, color = '#FFD700' }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, velocities, connections } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorObj = new THREE.Color(color);
    const goldColor = new THREE.Color('#FFD700');
    const purpleColor = new THREE.Color('#7B1FA2');
    const blueColor = new THREE.Color('#1976D2');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random position in a sphere
      const radius = 30 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Random velocities
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

      // Varied colors
      const mixFactor = Math.random();
      const particleColor = new THREE.Color();
      if (mixFactor < 0.33) {
        particleColor.lerpColors(goldColor, purpleColor, Math.random());
      } else if (mixFactor < 0.66) {
        particleColor.lerpColors(goldColor, blueColor, Math.random());
      } else {
        particleColor.copy(goldColor);
      }

      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }

    // Create connections between nearby particles
    const maxConnections = 3;
    const connectionDistance = 8;
    const linePositions: number[] = [];
    const lineColors: number[] = [];

    for (let i = 0; i < count; i++) {
      let connections = 0;
      for (let j = i + 1; j < count; j++) {
        if (connections >= maxConnections) break;

        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          linePositions.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
          const alpha = 1 - dist / connectionDistance;
          lineColors.push(colorObj.r * alpha, colorObj.g * alpha, colorObj.b * alpha);
          lineColors.push(colorObj.r * alpha, colorObj.g * alpha, colorObj.b * alpha);
          connections++;
        }
      }
    }

    return {
      positions,
      velocities,
      connections: { positions: new Float32Array(linePositions), colors: new Float32Array(lineColors) },
      colors,
    };
  }, [count, color]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update positions with velocity
      positionAttribute.array[i3] += velocities[i3];
      positionAttribute.array[i3 + 1] += velocities[i3 + 1];
      positionAttribute.array[i3 + 2] += velocities[i3 + 2];

      // Add subtle wave motion
      positionAttribute.array[i3 + 1] += Math.sin(time * 0.5 + i * 0.1) * 0.01;

      // Keep particles within bounds
      const dist = Math.sqrt(
        positionAttribute.array[i3] ** 2 +
        positionAttribute.array[i3 + 1] ** 2 +
        positionAttribute.array[i3 + 2] ** 2
      );

      if (dist > 80) {
        // Pull back toward center
        positionAttribute.array[i3] *= 0.98;
        positionAttribute.array[i3 + 1] *= 0.98;
        positionAttribute.array[i3 + 2] *= 0.98;
      }
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color={color}
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={connections.positions.length / 3}
            array={connections.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
