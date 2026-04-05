'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { StarsBackground } from './StarsBackground';
import { ParticleField } from './ParticleField';
import { AgentSpheres } from './AgentSpheres';
import { KingHermesSphere } from './KingHermesSphere';
import { Effects } from './Effects';
import { Agent } from '@/types';

interface SceneProps {
  agents: Agent[];
  onAgentClick?: (agent: Agent) => void;
  onKingClick?: () => void;
}

function CameraController() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame((state) => {
    if (cameraRef.current) {
      // Gentle camera movement
      const time = state.clock.elapsedTime;
      cameraRef.current.position.x = Math.sin(time * 0.1) * 2;
      cameraRef.current.position.y = Math.cos(time * 0.08) * 1;
      cameraRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <perspectiveCamera
      ref={cameraRef}
      position={[0, 0, 40]}
      fov={60}
      near={0.1}
      far={1000}
    />
  );
}

function SceneContent({ agents, onAgentClick, onKingClick }: SceneProps) {
  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 30, 150]} />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7B1FA2" />
      <pointLight position={[0, 20, 0]} intensity={0.8} color="#1976D2" />

      <StarsBackground count={3000} />
      <ParticleField count={2500} color="#FFD700" />
      <AgentSpheres agents={agents} onAgentClick={onAgentClick} />
      <KingHermesSphere onClick={onKingClick} />

      <Effects />
    </>
  );
}

export function Scene({ agents, onAgentClick, onKingClick }: SceneProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 40], fov: 60, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <Suspense fallback={null}>
          <SceneContent
            agents={agents}
            onAgentClick={onAgentClick}
            onKingClick={onKingClick}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
