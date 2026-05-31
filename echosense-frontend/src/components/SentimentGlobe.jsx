import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Mock geographic data for sentiment mentions
const mockSentimentData = [
  { lat: 40.7128, lng: -74.0060, sentiment: 'positive', intensity: 0.8, city: 'New York' },
  { lat: 34.0522, lng: -118.2437, sentiment: 'negative', intensity: 0.6, city: 'Los Angeles' },
  { lat: 51.5074, lng: -0.1278, sentiment: 'positive', intensity: 0.9, city: 'London' },
  { lat: 35.6762, lng: 139.6503, sentiment: 'neutral', intensity: 0.5, city: 'Tokyo' },
  { lat: -33.8688, lng: 151.2093, sentiment: 'positive', intensity: 0.7, city: 'Sydney' },
  { lat: 55.7558, lng: 37.6176, sentiment: 'negative', intensity: 0.4, city: 'Moscow' },
  { lat: 48.8566, lng: 2.3522, sentiment: 'positive', intensity: 0.8, city: 'Paris' },
  { lat: 52.5200, lng: 13.4050, sentiment: 'neutral', intensity: 0.6, city: 'Berlin' },
  { lat: 37.7749, lng: -122.4194, sentiment: 'positive', intensity: 0.9, city: 'San Francisco' },
  { lat: 1.3521, lng: 103.8198, sentiment: 'positive', intensity: 0.7, city: 'Singapore' },
];

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat, lng, radius = 5) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
};

const SentimentPin = ({ position, sentiment, intensity, city, onClick }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
      meshRef.current.scale.setScalar(hovered ? 1.5 : 1);
    }
  });

  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.1 * intensity, 8, 8]} />
        <meshBasicMaterial color={getSentimentColor()} />
      </mesh>
      
      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            <div className="font-semibold">{city}</div>
            <div className="capitalize">{sentiment} ({Math.round(intensity * 100)}%)</div>
          </div>
        </Html>
      )}
    </group>
  );
};

const Globe = ({ sentimentData, onPinClick }) => {
  const globeRef = useRef();

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Earth sphere */}
      <Sphere args={[5, 64, 64]}>
        <meshPhongMaterial
          color="#1e40af"
          transparent
          opacity={0.8}
          wireframe={false}
        />
      </Sphere>
      
      {/* Wireframe overlay */}
      <Sphere args={[5.01, 32, 32]}>
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Sentiment pins */}
      {sentimentData.map((data, index) => {
        const position = latLngToVector3(data.lat, data.lng);
        return (
          <SentimentPin
            key={index}
            position={position}
            sentiment={data.sentiment}
            intensity={data.intensity}
            city={data.city}
            onClick={() => onPinClick(data)}
          />
        );
      })}
    </group>
  );
};

const SentimentGlobe = () => {
  const [selectedPin, setSelectedPin] = useState(null);
  const [sentimentData, setSentimentData] = useState(mockSentimentData);

  const handlePinClick = (data) => {
    setSelectedPin(data);
  };

  const getSentimentStats = () => {
    const total = sentimentData.length;
    const positive = sentimentData.filter(d => d.sentiment === 'positive').length;
    const negative = sentimentData.filter(d => d.sentiment === 'negative').length;
    const neutral = sentimentData.filter(d => d.sentiment === 'neutral').length;

    return {
      total,
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100)
    };
  };

  const stats = getSentimentStats();

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Global Sentiment Map</h2>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Positive ({stats.positive}%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Negative ({stats.negative}%)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Neutral ({stats.neutral}%)</span>
          </div>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden bg-gray-900/50">
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Globe sentimentData={sentimentData} onPinClick={handlePinClick} />
          
          <OrbitControls
            enableZoom={true}
            enablePan={false}
            enableRotate={true}
            zoomSpeed={0.6}
            rotateSpeed={0.5}
            minDistance={8}
            maxDistance={25}
          />
        </Canvas>
      </div>

      {/* Selected Pin Details */}
      {selectedPin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-900/50 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedPin.city}</h3>
              <p className="text-sm text-gray-400">
                Lat: {selectedPin.lat.toFixed(4)}, Lng: {selectedPin.lng.toFixed(4)}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold capitalize ${
                selectedPin.sentiment === 'positive' ? 'text-green-400' :
                selectedPin.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {selectedPin.sentiment}
              </div>
              <div className="text-sm text-gray-400">
                Intensity: {Math.round(selectedPin.intensity * 100)}%
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Click and drag to rotate • Scroll to zoom • Click pins for details
      </div>
    </motion.div>
  );
};

export default SentimentGlobe;
