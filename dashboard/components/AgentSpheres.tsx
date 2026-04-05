'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Agent } from '@/types';

interface AgentSpheresProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
}

export function AgentSpheres({ agents, onAgentClick }: AgentSpheresProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  // Generate orbits for agents
  const agentOrbits = useMemo(() => {
    return agents.map((agent, index) => {
      const radius = 12 + (index % 3) * 4;
      const speed = 0.3 + Math.random() * 0.2;
      const angleOffset = (index / agents.length) * Math.PI * 2;
      const inclination = (Math.random() - 0.5) * 0.5;

      return {
        agent,
        radius,
        speed,
        angleOffset,
        inclination,
        baseY: (Math.random() - 0.5) * 6,
      };
    });
  }, [agents]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate entire group slowly
    groupRef.current.rotation.y = time * 0.05;

    // Update each agent's position
    agentOrbits.forEach((orbit) => {
      const mesh = sphereRefs.current.get(orbit.agent.id);
      if (mesh) {
        const angle = time * orbit.speed + orbit.angleOffset;
        const x = Math.cos(angle) * orbit.radius;
        const z = Math.sin(angle) * orbit.radius;
        const y = orbit.baseY + Math.sin(time * 0.5 + orbit.angleOffset) * 2;

        mesh.position.set(x, y, z);
        mesh.rotation.x = time * 0.5;
        mesh.rotation.y = time * 0.3;

        // Pulse scale based on agent status
        const baseScale = 0.8;
        const pulse = orbit.agent.status === 'busy' ? Math.sin(time * 3) * 0.2 : 0;
        mesh.scale.setScalar(baseScale + pulse);
      }
    });
  });

  // Calculate lines between agents
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        // Connect all agents to create a network effect
        positions.push(0, 0, 0, 0, 0, 0); // Will be updated in useFrame
      }
    }

    return new Float32Array(positions);
  }, [agents.length]);

  const linesRef = useRef<THREE.LineSegments>(null);

  useFrame(() => {
    if (!linesRef.current) return;

    const positions = linesRef.current.geometry.attributes.position.array as Float32Array;
    let idx = 0;

    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        const mesh1 = sphereRefs.current.get(agents[i].id);
        const mesh2 = sphereRefs.current.get(agents[j].id);

        if (mesh1 && mesh2) {
          positions[idx++] = mesh1.position.x;
          positions[idx++] = mesh1.position.y;
          positions[idx++] = mesh1.position.z;
          positions[idx++] = mesh2.position.x;
          positions[idx++] = mesh2.position.y;
          positions[idx++] = mesh2.position.z;
        }
      }
    }

    linesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={lineGeometry.length / 3}
            array={lineGeometry}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Agent spheres */}
      {agentOrbits.map(({ agent }) => (
        <mesh
          key={agent.id}
          ref={(el) => {
            if (el) sphereRefs.current.set(agent.id, el);
          }}
          onClick={() => onAgentClick?.(agent)}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={agent.color}
            emissive={agent.color}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}

      {/* Glow effect for each agent */}
      {agentOrbits.map(({ agent }) => (
        <mesh
          key={`glow-${agent.id}`}
          ref={(el) => {
            if (el && !sphereRefs.current.has(`glow-${agent.id}`)) {
              sphereRefs.current.set(`glow-${agent.id}`, el);
            }
          }}
        >
          <sphereGeometry args={[1.3, 16, 16]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
