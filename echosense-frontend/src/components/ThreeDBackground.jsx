import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Extend Three.js with custom materials
extend({ PointMaterial });

// Animated particle field
function ParticleField({ count = 5000 }) {
  const mesh = useRef();
  const light = useRef();

  // Generate random particle positions
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create a galaxy-like distribution
      const radius = Math.random() * 20 + 5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 10;
      
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Color based on sentiment (purple to blue gradient)
      const intensity = Math.random();
      colors[i * 3] = 0.5 + intensity * 0.5; // R
      colors[i * 3 + 1] = 0.2 + intensity * 0.3; // G  
      colors[i * 3 + 2] = 0.8 + intensity * 0.2; // B
    }
    
    return [positions, colors];
  }, [count]);

  // Animate particles
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (mesh.current) {
      mesh.current.rotation.x = time * 0.05;
      mesh.current.rotation.y = time * 0.02;
      
      // Pulse effect
      const scale = 1 + Math.sin(time * 2) * 0.1;
      mesh.current.scale.setScalar(scale);
    }
    
    if (light.current) {
      light.current.position.x = Math.cos(time * 0.5) * 10;
      light.current.position.z = Math.sin(time * 0.5) * 10;
    }
  });

  return (
    <group>
      <Points ref={mesh} positions={positions} colors={colors}>
        <PointMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      <pointLight ref={light} position={[10, 10, 10]} intensity={1} color="#8A2BE2" />
      <ambientLight intensity={0.2} />
    </group>
  );
}

// Floating geometric shapes
function FloatingGeometry() {
  const group = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.x = time * 0.1;
      group.current.rotation.y = time * 0.15;
    }
  });

  return (
    <group ref={group}>
      {/* Floating icosahedrons */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 0.8) * 15,
            Math.sin(i * 0.6) * 8,
            Math.sin(i * 0.8) * 15
          ]}
        >
          <icosahedronGeometry args={[0.5, 0]} />
          <meshPhongMaterial
            color="#8A2BE2"
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      ))}
      
      {/* Floating rings */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`ring-${i}`}
          position={[
            Math.sin(i * 1.2) * 12,
            Math.cos(i * 0.8) * 6,
            Math.cos(i * 1.2) * 12
          ]}
          rotation={[i * 0.5, i * 0.3, 0]}
        >
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshPhongMaterial
            color="#4A90E2"
            transparent
            opacity={0.4}
            emissive="#1a1a2e"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Energy waves
function EnergyWaves() {
  const waves = useRef();
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (waves.current) {
      waves.current.children.forEach((wave, i) => {
        const offset = i * 0.5;
        wave.scale.setScalar(1 + Math.sin(time * 2 + offset) * 0.3);
        wave.material.opacity = 0.1 + Math.sin(time * 3 + offset) * 0.05;
      });
    }
  });

  return (
    <group ref={waves}>
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <sphereGeometry args={[8 + i * 2, 32, 32]} />
          <meshBasicMaterial
            color="#8A2BE2"
            transparent
            opacity={0.05}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}

// Main 3D Background Component
const ThreeDBackground = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <fog attach="fog" args={['#0a0a0a', 20, 100]} />
        
        {/* Particle field */}
        <ParticleField count={3000} />
        
        {/* Floating geometry */}
        <FloatingGeometry />
        
        {/* Energy waves */}
        <EnergyWaves />
        
        {/* Dynamic lighting */}
        <spotLight
          position={[20, 20, 20]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#8A2BE2"
          castShadow
        />
        <spotLight
          position={[-20, -20, -20]}
          angle={0.3}
          penumbra={1}
          intensity={0.3}
          color="#4A90E2"
        />
      </Canvas>
    </div>
  );
};

export default ThreeDBackground;
