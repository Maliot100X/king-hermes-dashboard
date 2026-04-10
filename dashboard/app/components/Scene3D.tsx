'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

// Particle Galaxy
function ParticleGalaxy() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#FFD700"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// King Hermes Center Sphere
function KingHermesCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      gsap.to(groupRef.current.position, {
        y: 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
    if (ringRef.current) {
      gsap.to(ringRef.current.rotation, {
        x: Math.PI * 2,
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: 'none',
      });
    }
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.3}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      
      {/* Rotating Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.5, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FFD700"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Inner Glow Ring */}
      <mesh>
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

// Orbiting Agent Sphere
interface AgentOrbiterProps {
  color: string;
  radius: number;
  speed: number;
  offset: number;
  size?: number;
}

function AgentOrbiter({ color, radius, speed, offset, size = 0.6 }: AgentOrbiterProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (groupRef.current) {
      const angle = timeRef.current * speed + offset;
      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.z = Math.sin(angle) * radius;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 2;
      meshRef.current.rotation.x += delta;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Glow halo */}
      <mesh>
        <sphereGeometry args={[size * 1.5, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

// Connection Lines Between Agents
function ConnectionLines() {
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const positions = useMemo(() => {
    const pos = [];
    // Create connections between orbital positions
    for (let i = 0; i < 6; i++) {
      for (let j = i + 1; j < 6; j++) {
        // Simplified - just connecting to center for visual effect
        pos.push(0, 0, 0);
        pos.push(
          Math.cos(i * Math.PI / 3) * 5,
          0,
          Math.sin(i * Math.PI / 3) * 5
        );
      }
    }
    return new Float32Array(pos);
  }, []);

  useFrame((state) => {
    if (lineRef.current && lineRef.current.material) {
      const material = lineRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#00d992"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// Main Scene
export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-abyss">
      <Canvas
        camera={{ position: [0, 8, 20], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#050507']} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.3} />
        
        {/* Central point light (King Hermes) */}
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />
        
        {/* Additional lights for depth */}
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#00d992" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4ECDC4" />
        
        {/* Starfield background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        {/* Particle galaxy */}
        <ParticleGalaxy />
        
        {/* King Hermes center */}
        <KingHermesCore />
        
        {/* Orbiting agent spheres */}
        {/* King Hermes Orbiter - Gold */}
        <AgentOrbiter color="#FFD700" radius={5} speed={0.5} offset={0} size={0.8} />
        
        {/* OpenCode - White on dark */}
        <AgentOrbiter color="#fdfcfc" radius={7} speed={0.3} offset={Math.PI / 3} />
        
        {/* Gemini - Blue */}
        <AgentOrbiter color="#4285F4" radius={9} speed={0.2} offset={Math.PI * 2 / 3} />
        
        {/* Claude - Terracotta */}
        <AgentOrbiter color="#c96442" radius={6} speed={0.4} offset={Math.PI} />
        
        {/* Roo - Purple */}
        <AgentOrbiter color="#9B59B6" radius={8} speed={0.35} offset={Math.PI * 4 / 3} />
        
        {/* OpenClaw - Orange */}
        <AgentOrbiter color="#FF6B35" radius={10} speed={0.25} offset={Math.PI * 5 / 3} />
        
        {/* Connection lines */}
        <ConnectionLines />
      </Canvas>
    </div>
  );
}
