import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const SentimentSpeedometer = () => {
  const canvasRef = useRef(null);
  const needleRef = useRef(null);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSentimentData = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      // Calculate sentiment score (-100 to +100)
      const newScore = data.positive - data.negative;
      const newVelocity = newScore - sentimentScore;
      
      setSentimentScore(newScore);
      setVelocity(newVelocity);
      setIsLoading(false);
      
      // Animate needle
      if (needleRef.current) {
        gsap.to(needleRef.current, {
          rotation: (newScore / 100) * 90, // -90 to +90 degrees
          duration: 2,
          ease: "elastic.out(1, 0.3)"
        });
      }
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
      // Simulate data for demo
      const newScore = Math.sin(Date.now() / 10000) * 60;
      setSentimentScore(newScore);
      setVelocity(Math.random() * 10 - 5);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    const drawSpeedometer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw outer ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Draw sentiment zones
      const zones = [
        { start: -Math.PI, end: -Math.PI/3, color: '#ef4444', label: 'Negative' },
        { start: -Math.PI/3, end: Math.PI/3, color: '#f59e0b', label: 'Neutral' },
        { start: Math.PI/3, end: Math.PI, color: '#22c55e', label: 'Positive' }
      ];

      zones.forEach(zone => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 15, zone.start, zone.end);
        ctx.strokeStyle = zone.color;
        ctx.lineWidth = 12;
        ctx.stroke();
      });

      // Draw tick marks
      for (let i = -100; i <= 100; i += 20) {
        const angle = (i / 100) * Math.PI;
        const x1 = centerX + Math.cos(angle) * (radius - 25);
        const y1 = centerY + Math.sin(angle) * (radius - 25);
        const x2 = centerX + Math.cos(angle) * (radius - 35);
        const y2 = centerY + Math.sin(angle) * (radius - 35);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw labels
        const labelX = centerX + Math.cos(angle) * (radius - 50);
        const labelY = centerY + Math.sin(angle) * (radius - 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), labelX, labelY);
      }

      // Draw center circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#8A2BE2';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    drawSpeedometer();
  }, []);

  const getSentimentStatus = () => {
    if (sentimentScore > 30) return { status: 'Excellent', color: 'text-green-400', icon: TrendingUp };
    if (sentimentScore > 0) return { status: 'Good', color: 'text-green-300', icon: TrendingUp };
    if (sentimentScore > -30) return { status: 'Neutral', color: 'text-yellow-400', icon: Activity };
    return { status: 'Critical', color: 'text-red-400', icon: TrendingDown };
  };

  const getVelocityStatus = () => {
    if (Math.abs(velocity) < 2) return { status: 'Stable', color: 'text-blue-400', icon: Activity };
    if (velocity > 0) return { status: 'Improving', color: 'text-green-400', icon: TrendingUp };
    return { status: 'Declining', color: 'text-red-400', icon: TrendingDown };
  };

  const sentimentStatus = getSentimentStatus();
  const velocityStatus = getVelocityStatus();
  const StatusIcon = sentimentStatus.icon;
  const VelocityIcon = velocityStatus.icon;

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Zap className="w-6 h-6 text-primary" />
            <span>Sentiment Speedometer</span>
          </h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live</span>
          </div>
        </div>

        {/* Speedometer Canvas */}
        <div className="relative flex justify-center mb-6">
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            className="max-w-full"
          />
          
          {/* Animated Needle */}
          <div
            ref={needleRef}
            className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-red-500 to-yellow-400 origin-bottom transform -translate-x-1/2 -translate-y-full"
            style={{
              transformOrigin: 'bottom center',
              transform: `translate(-50%, -100%) rotate(${(sentimentScore / 100) * 90}deg)`
            }}
          />
        </div>

        {/* Metrics Display */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <StatusIcon className={`w-5 h-5 ${sentimentStatus.color}`} />
              <span className="text-sm font-medium text-gray-400">Current Score</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {sentimentScore.toFixed(1)}
            </div>
            <div className={`text-sm ${sentimentStatus.color}`}>
              {sentimentStatus.status}
            </div>
          </motion.div>

          <motion.div
            className="bg-gray-900/50 p-4 rounded-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <VelocityIcon className={`w-5 h-5 ${velocityStatus.color}`} />
              <span className="text-sm font-medium text-gray-400">Velocity</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {velocity > 0 ? '+' : ''}{velocity.toFixed(1)}
            </div>
            <div className={`text-sm ${velocityStatus.color}`}>
              {velocityStatus.status}
            </div>
          </motion.div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-4 flex justify-between text-xs text-gray-500">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>Range: -100 to +100</span>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentSpeedometer;
