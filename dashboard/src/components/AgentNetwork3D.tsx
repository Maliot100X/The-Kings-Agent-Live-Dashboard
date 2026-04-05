'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Trail } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'busy' | 'idle';
  x: number;
  y: number;
  z: number;
  color: string;
}

interface AgentNetwork3DProps {
  agents?: Agent[];
  isConnected?: boolean;
}

const defaultAgents: Agent[] = [
  { id: '1', name: 'Orchestrator', type: 'orchestrator', status: 'online', x: 0, y: 0, z: 0, color: '#ff006e' },
  { id: '2', name: 'Code Agent', type: 'coder', status: 'busy', x: 3, y: 2, z: 1, color: '#00f3ff' },
  { id: '3', name: 'Analyst', type: 'analyst', status: 'online', x: -3, y: 1, z: -2, color: '#39ff14' },
  { id: '4', name: 'Researcher', type: 'researcher', status: 'idle', x: 2, y: -2, z: 2, color: '#bc13fe' },
  { id: '5', name: 'Creative', type: 'creative', status: 'online', x: -2, y: -1, z: -1, color: '#ffea00' },
];

function AgentNode({ agent, onClick }: { agent: Agent; onClick?: (agent: Agent) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[agent.x, agent.y, agent.z]}>
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.2} />
      </mesh>

      {/* Main sphere */}
      <mesh
        ref={meshRef}
        onClick={() => onClick?.(agent)}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.02, 16, 100]} />
        <meshBasicMaterial
          color={agent.status === 'online' ? '#39ff14' : agent.status === 'busy' ? '#ffea00' : '#666'}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {agent.name}
      </Text>
    </group>
  );
}

function ConnectionLine({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const points = useMemo(() => [start, end], [start, end]);
  const lineRef = useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start.toArray(), ...end.toArray()])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </line>
  );
}

function DataPacket({ start, end, color }: { start: THREE.Vector3; end: THREE.Vector3; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame((state, delta) => {
    if (ref.current) {
      progress.current += delta * 0.5;
      if (progress.current > 1) progress.current = 0;
      
      const position = new THREE.Vector3().lerpVectors(start, end, progress.current);
      ref.current.position.copy(position);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function Scene({ agents }: { agents: Agent[] }) {
  const connections = useMemo(() => {
    const lines: { start: THREE.Vector3; end: THREE.Vector3; color: string }[] = [];
    const centerAgent = agents[0];
    const centerVec = new THREE.Vector3(centerAgent.x, centerAgent.y, centerAgent.z);

    for (let i = 1; i < agents.length; i++) {
      lines.push({
        start: centerVec,
        end: new THREE.Vector3(agents[i].x, agents[i].y, agents[i].z),
        color: '#00f3ff',
      });
    }

    return lines;
  }, [agents]);

  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f3ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bc13fe" />

      {connections.map((conn, i) => (
        <ConnectionLine key={`conn-${i}`} {...conn} />
      ))}

      {connections.map((conn, i) => (
        <DataPacket key={`packet-${i}`} {...conn} />
      ))}

      {agents.map((agent) => (
        <AgentNode key={agent.id} agent={agent} />
      ))}

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.5}
        minDistance={5}
        maxDistance={20}
      />
    </>
  );
}

export function AgentNetwork3D({ agents = defaultAgents, isConnected = true }: AgentNetwork3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-[500px] rounded-xl overflow-hidden bg-dark-900 border border-dark-600"
    >
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
          Agent Network
        </h3>
        <p className="text-sm text-gray-400">{agents.length} agents connected</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-500'}`}>
          {isConnected ? '● Live' : '○ Offline'}
        </span>
      </div>

      <Canvas camera={{ position: [8, 5, 8], fov: 50 }}>
        <Scene agents={agents} />
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-4">
        {['Online', 'Busy', 'Idle', 'Offline'].map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={
              status === 'Online' ? 'w-2 h-2 rounded-full bg-neon-green' :
              status === 'Busy' ? 'w-2 h-2 rounded-full bg-neon-yellow' :
              status === 'Idle' ? 'w-2 h-2 rounded-full bg-gray-500' :
              'w-2 h-2 rounded-full bg-red-500'
            } />
            <span className="text-xs text-gray-400">{status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
