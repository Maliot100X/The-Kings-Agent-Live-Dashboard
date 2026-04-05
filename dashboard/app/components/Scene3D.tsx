'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// 3000 Gold Particles
function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000 * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 50;
      positions[i + 1] = (Math.random() - 0.5) * 50;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FFD700"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Orbiting Agent Orb
function AgentOrb({ position, color, name, onClick }: { position: [number, number, number], color: string, name: string, onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime;
      ref.current.position.y = position[1] + Math.sin(time * 0.5) * 0.5;
    }
  });

  return (
    <group>
      {/* Orb */}
      <mesh ref={ref} position={position} onClick={onClick}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Glow ring */}
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.75, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Connection line to center */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, ...position]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.2} />
      </line>
      
      {/* Label */}
      <Html position={[position[0], position[1] + 1, position[2]]} center>
        <div style={{ 
          color, 
          fontSize: '12px', 
          fontWeight: 'bold',
          textShadow: '0 0 10px ' + color,
          pointerEvents: 'none'
        }}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// King Hermes Center Sphere
function KingSphere({ onClick }: { onClick?: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={ref} onClick={onClick}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.8}
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.4, 64]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      <Html position={[0, 2, 0]} center>
        <div style={{ 
          color: '#FFD700', 
          fontSize: '20px', 
          fontWeight: 'bold',
          textShadow: '0 0 20px #FFD700',
          pointerEvents: 'none'
        }}>
          👑 King Hermes
        </div>
      </Html>
    </group>
  );
}

// Main Scene
function SceneContent({ onAgentClick, onKingClick }: { onAgentClick?: (name: string) => void, onKingClick?: () => void }) {
  return (
    <>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD700" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7B1FA2" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <ParticleField />
      
      <AgentOrb position={[-8, 0, 0]} color="#00FF88" name="OpenCode" onClick={() => onAgentClick?.('OpenCode')} />
      <AgentOrb position={[8, 0, 0]} color="#4ECDC4" name="Gemini" onClick={() => onAgentClick?.('Gemini')} />
      <AgentOrb position={[0, 8, 0]} color="#FF6B6B" name="OpenClaude" onClick={() => onAgentClick?.('OpenClaude')} />
      <AgentOrb position={[0, -8, 0]} color="#9B59B6" name="Roo Code" onClick={() => onAgentClick?.('Roo Code')} />
      
      <KingSphere onClick={onKingClick} />
    </>
  );
}

export default function Scene3D({ onAgentClick, onKingClick }: { onAgentClick?: (name: string) => void, onKingClick?: () => void }) {
  return (
    <div className="fixed inset-0 z-0" style={{ background: '#050505' }}>
      <Canvas
        camera={{ position: [0, 0, 25], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <SceneContent onAgentClick={onAgentClick} onKingClick={onKingClick} />
      </Canvas>
    </div>
  );
}
