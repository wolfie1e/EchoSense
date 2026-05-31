import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { MessageCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';

// 3D Node component
function ConversationNode({ position, sentiment, size, text, onClick, isSelected }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = (hovered || isSelected) ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  const getColor = () => {
    switch (sentiment) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshPhongMaterial
          color={getColor()}
          transparent
          opacity={0.8}
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </Sphere>
      
      {(hovered || isSelected) && (
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {text.substring(0, 50)}...
        </Text>
      )}
    </group>
  );
}

// Connection line between nodes
function ConnectionLine({ start, end, sentiment }) {
  const getColor = () => {
    switch (sentiment) {
      case 'positive': return '#22c55e';
      case 'negative': return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return (
    <Line
      points={[start, end]}
      color={getColor()}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

// 3D Conversation Tree
function ConversationTree3D({ conversations, onNodeClick, selectedNode }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  // Generate tree layout
  const generateLayout = () => {
    const nodes = [];
    const connections = [];
    
    conversations.forEach((conv, index) => {
      const angle = (index / conversations.length) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      const height = (Math.random() - 0.5) * 4;
      
      const position = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
      
      nodes.push({
        id: conv.id,
        position,
        sentiment: conv.sentiment,
        size: 0.2 + (conv.engagement || 0) * 0.1,
        text: conv.text
      });
      
      // Add connections to parent
      if (conv.parentId) {
        const parent = nodes.find(n => n.id === conv.parentId);
        if (parent) {
          connections.push({
            start: parent.position,
            end: position,
            sentiment: conv.sentiment
          });
        }
      }
    });
    
    return { nodes, connections };
  };

  const { nodes, connections } = generateLayout();

  return (
    <group ref={groupRef}>
      {/* Render connections */}
      {connections.map((conn, index) => (
        <ConnectionLine
          key={`conn-${index}`}
          start={conn.start}
          end={conn.end}
          sentiment={conn.sentiment}
        />
      ))}
      
      {/* Render nodes */}
      {nodes.map((node) => (
        <ConversationNode
          key={node.id}
          position={node.position}
          sentiment={node.sentiment}
          size={node.size}
          text={node.text}
          onClick={() => onNodeClick(node)}
          isSelected={selectedNode?.id === node.id}
        />
      ))}
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}

const ConversationTreeVisualizer = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or '2d'

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      // Mock conversation data for demo
      const mockConversations = [
        {
          id: '1',
          text: 'Tesla just announced their new battery technology. This could be a game changer!',
          sentiment: 'positive',
          engagement: 0.8,
          parentId: null,
          timestamp: new Date(Date.now() - 3600000),
          author: 'TechEnthusiast'
        },
        {
          id: '2',
          text: 'I agree! The energy density improvements are impressive.',
          sentiment: 'positive',
          engagement: 0.6,
          parentId: '1',
          timestamp: new Date(Date.now() - 3500000),
          author: 'EVFan2024'
        },
        {
          id: '3',
          text: 'But what about the cost? These innovations usually come with a premium.',
          sentiment: 'neutral',
          engagement: 0.4,
          parentId: '1',
          timestamp: new Date(Date.now() - 3400000),
          author: 'PragmaticBuyer'
        },
        {
          id: '4',
          text: 'The cost will come down with scale. Tesla has proven this before.',
          sentiment: 'positive',
          engagement: 0.7,
          parentId: '3',
          timestamp: new Date(Date.now() - 3300000),
          author: 'InvestorMike'
        },
        {
          id: '5',
          text: 'I\'m skeptical. They\'ve made promises before that didn\'t pan out.',
          sentiment: 'negative',
          engagement: 0.5,
          parentId: '1',
          timestamp: new Date(Date.now() - 3200000),
          author: 'SkepticalSam'
        }
      ];
      
      setConversations(mockConversations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const getSentimentStats = () => {
    const total = conversations.length;
    const positive = conversations.filter(c => c.sentiment === 'positive').length;
    const negative = conversations.filter(c => c.sentiment === 'negative').length;
    const neutral = conversations.filter(c => c.sentiment === 'neutral').length;
    
    return {
      total,
      positive: Math.round((positive / total) * 100),
      negative: Math.round((negative / total) * 100),
      neutral: Math.round((neutral / total) * 100)
    };
  };

  const stats = getSentimentStats();

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-primary" />
          <span>Conversation Tree</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">{conversations.length} posts</span>
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
      <div className="h-80 rounded-lg overflow-hidden bg-gray-900/50 mb-4">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ConversationTree3D
            conversations={conversations}
            onNodeClick={handleNodeClick}
            selectedNode={selectedNode}
          />
        </Canvas>
      </div>

      {/* Stats and Selected Node Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sentiment Stats */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Conversation Sentiment</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Positive</span>
              </div>
              <span className="text-green-400 font-semibold">{stats.positive}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-gray-300">Negative</span>
              </div>
              <span className="text-red-400 font-semibold">{stats.negative}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                <span className="text-sm text-gray-300">Neutral</span>
              </div>
              <span className="text-yellow-400 font-semibold">{stats.neutral}%</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            {selectedNode ? 'Selected Post' : 'Click a node to view details'}
          </h3>
          
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="text-sm text-gray-300">
                  <strong>Author:</strong> {selectedNode.author}
                </div>
                <div className="text-sm text-gray-300">
                  <strong>Sentiment:</strong> 
                  <span className={`ml-1 capitalize ${
                    selectedNode.sentiment === 'positive' ? 'text-green-400' :
                    selectedNode.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {selectedNode.sentiment}
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  <strong>Engagement:</strong> {Math.round(selectedNode.engagement * 100)}%
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {selectedNode.text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationTreeVisualizer;
