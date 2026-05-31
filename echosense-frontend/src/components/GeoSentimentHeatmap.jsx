import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { Globe, MapPin, TrendingUp, TrendingDown, Users } from 'lucide-react';

// 3D Geographic Data Point
function GeoDataPoint({ position, sentiment, volume, region, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.1;
      
      const scale = (hovered || isSelected) ? 1.5 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const getColor = () => {
    if (sentiment > 0.2) return '#22c55e';
    if (sentiment < -0.2) return '#ef4444';
    return '#f59e0b';
  };

  const getSize = () => {
    return Math.max(0.1, Math.min(0.5, volume / 1000));
  };

  return (
    <group>
      <Sphere
        ref={meshRef}
        position={position}
        args={[getSize(), 16, 16]}
        onClick={() => onClick({ position, sentiment, volume, region })}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhongMaterial
          color={getColor()}
          transparent
          opacity={0.8}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.4 : 0.2}
        />
      </Sphere>
      
      {/* Pulsing ring effect */}
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[getSize() * 1.2, getSize() * 1.5, 16]} />
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <Text
          position={[position[0], position[1] + 0.8, position[2]]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {region}
        </Text>
      )}
    </group>
  );
}

// 3D World Map Base
function WorldMapBase() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Simplified world continents as boxes */}
      {/* North America */}
      <Box position={[-2, 0, 1]} args={[1.5, 0.1, 1]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      
      {/* Europe */}
      <Box position={[0.5, 0, 1.5]} args={[0.8, 0.1, 0.6]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      
      {/* Asia */}
      <Box position={[2, 0, 0.5]} args={[2, 0.1, 1.5]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      
      {/* South America */}
      <Box position={[-1.5, 0, -1]} args={[0.8, 0.1, 1.2]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      
      {/* Africa */}
      <Box position={[0.2, 0, -0.5]} args={[1, 0.1, 1.5]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
      
      {/* Australia */}
      <Box position={[2.5, 0, -1.5]} args={[0.6, 0.1, 0.4]} >
        <meshPhongMaterial color="#1a1a2e" transparent opacity={0.3} />
      </Box>
    </group>
  );
}

const GeoSentimentHeatmap = () => {
  const [geoData, setGeoData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3d');
  const containerRef = useRef(null);

  useEffect(() => {
    fetchGeoData();
    const interval = setInterval(fetchGeoData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, [loading]);

  const fetchGeoData = async () => {
    try {
      // Mock geographic sentiment data
      const mockGeoData = [
        {
          region: 'North America',
          position: [-2, 0.2, 1],
          sentiment: 0.35,
          volume: 1250,
          countries: ['USA', 'Canada', 'Mexico'],
          trend: 'up',
          details: {
            positive: 65,
            negative: 20,
            neutral: 15
          }
        },
        {
          region: 'Europe',
          position: [0.5, 0.2, 1.5],
          sentiment: 0.28,
          volume: 890,
          countries: ['Germany', 'France', 'UK', 'Italy'],
          trend: 'stable',
          details: {
            positive: 58,
            negative: 25,
            neutral: 17
          }
        },
        {
          region: 'Asia Pacific',
          position: [2, 0.2, 0.5],
          sentiment: 0.15,
          volume: 1100,
          countries: ['Japan', 'China', 'South Korea', 'Australia'],
          trend: 'up',
          details: {
            positive: 52,
            negative: 30,
            neutral: 18
          }
        },
        {
          region: 'South America',
          position: [-1.5, 0.2, -1],
          sentiment: -0.05,
          volume: 420,
          countries: ['Brazil', 'Argentina', 'Chile'],
          trend: 'down',
          details: {
            positive: 42,
            negative: 38,
            neutral: 20
          }
        },
        {
          region: 'Africa & Middle East',
          position: [0.2, 0.2, -0.5],
          sentiment: 0.22,
          volume: 380,
          countries: ['South Africa', 'UAE', 'Saudi Arabia'],
          trend: 'up',
          details: {
            positive: 55,
            negative: 28,
            neutral: 17
          }
        }
      ];

      setGeoData(mockGeoData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching geo data:', error);
      setLoading(false);
    }
  };

  const handleRegionClick = (regionData) => {
    setSelectedRegion(regionData);
  };

  const getTotalVolume = () => {
    return geoData.reduce((sum, region) => sum + region.volume, 0);
  };

  const getGlobalSentiment = () => {
    const totalVolume = getTotalVolume();
    const weightedSentiment = geoData.reduce((sum, region) => {
      return sum + (region.sentiment * region.volume);
    }, 0);
    return totalVolume > 0 ? weightedSentiment / totalVolume : 0;
  };

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-80 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Globe className="w-6 h-6 text-primary" />
          <span>Global Sentiment Heatmap</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-400">
            Global Score: <span className="text-white font-semibold">
              {(getGlobalSentiment() * 100).toFixed(1)}%
            </span>
          </div>
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
          >
            {viewMode === '3d' ? '2D View' : '3D View'}
          </button>
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="h-80 rounded-lg overflow-hidden bg-gray-900/50 mb-6">
        <Canvas camera={{ position: [0, 5, 8], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <WorldMapBase />
          
          {geoData.map((region, index) => (
            <GeoDataPoint
              key={index}
              position={region.position}
              sentiment={region.sentiment}
              volume={region.volume}
              region={region.region}
              onClick={handleRegionClick}
              isSelected={selectedRegion?.region === region.region}
            />
          ))}
        </Canvas>
      </div>

      {/* Regional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {geoData.map((region, index) => {
          const TrendIcon = region.trend === 'up' ? TrendingUp : 
                          region.trend === 'down' ? TrendingDown : Users;
          const trendColor = region.trend === 'up' ? 'text-green-400' :
                           region.trend === 'down' ? 'text-red-400' : 'text-gray-400';
          
          return (
            <motion.div
              key={region.region}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedRegion?.region === region.region
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => handleRegionClick(region)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              </div>
              
              <h3 className="font-semibold text-white text-sm mb-1">{region.region}</h3>
              
              <div className="text-2xl font-bold mb-1" style={{ 
                color: region.sentiment > 0.1 ? '#22c55e' : 
                       region.sentiment < -0.1 ? '#ef4444' : '#f59e0b' 
              }}>
                {region.sentiment > 0 ? '+' : ''}{(region.sentiment * 100).toFixed(0)}%
              </div>
              
              <div className="text-xs text-gray-400">
                {region.volume.toLocaleString()} mentions
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Region Details */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              {selectedRegion.region} - Detailed Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Countries</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedRegion.countries.map((country, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Sentiment Breakdown</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Positive</span>
                    <span className="text-white">{selectedRegion.details.positive}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">Negative</span>
                    <span className="text-white">{selectedRegion.details.negative}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400">Neutral</span>
                    <span className="text-white">{selectedRegion.details.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GeoSentimentHeatmap;
