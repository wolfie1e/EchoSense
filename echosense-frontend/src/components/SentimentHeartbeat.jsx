import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart } from 'lucide-react';

const SentimentHeartbeat = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isActive, setIsActive] = useState(true);
  const [currentSentiment, setCurrentSentiment] = useState(0.5);
  const [bpm, setBpm] = useState(72); // Beats per minute

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let time = 0;
    const dataPoints = [];
    const maxDataPoints = width / 2;

    // Generate heartbeat pattern based on sentiment
    const generateHeartbeatPattern = (sentiment, t) => {
      const baseFreq = (bpm / 60) * 2 * Math.PI; // Convert BPM to radians per second
      const amplitude = 50 + (sentiment * 30); // Amplitude based on sentiment
      
      // Create heartbeat-like pattern with double peak
      const heartbeat = Math.sin(baseFreq * t) * amplitude * Math.exp(-((t % (60/bpm)) - 0.1) * 20);
      const secondPeak = Math.sin(baseFreq * t + Math.PI/4) * amplitude * 0.6 * Math.exp(-((t % (60/bpm)) - 0.15) * 30);
      
      return heartbeat + secondPeak;
    };

    const animate = () => {
      if (!isActive) return;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Update time
      time += 0.02;

      // Generate new data point
      const newPoint = generateHeartbeatPattern(currentSentiment, time);
      dataPoints.push(newPoint);

      // Keep only recent data points
      if (dataPoints.length > maxDataPoints) {
        dataPoints.shift();
      }

      // Draw background grid
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      
      // Horizontal lines
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      // Draw heartbeat line
      if (dataPoints.length > 1) {
        ctx.strokeStyle = getSentimentColor(currentSentiment);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Create gradient effect
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.1)');
        gradient.addColorStop(1, getSentimentColor(currentSentiment));
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        dataPoints.forEach((point, index) => {
          const x = (index / maxDataPoints) * width;
          const y = height / 2 - point;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Add glow effect for recent points
        if (dataPoints.length > 10) {
          const recentPoints = dataPoints.slice(-10);
          ctx.shadowColor = getSentimentColor(currentSentiment);
          ctx.shadowBlur = 10;
          
          ctx.beginPath();
          recentPoints.forEach((point, index) => {
            const x = ((dataPoints.length - 10 + index) / maxDataPoints) * width;
            const y = height / 2 - point;
            
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        }
      }

      // Draw current value indicator
      if (dataPoints.length > 0) {
        const currentY = height / 2 - dataPoints[dataPoints.length - 1];
        ctx.fillStyle = getSentimentColor(currentSentiment);
        ctx.beginPath();
        ctx.arc(width - 10, currentY, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, currentSentiment, bpm]);

  // Simulate real-time sentiment updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate sentiment fluctuation
      setCurrentSentiment(prev => {
        const change = (Math.random() - 0.5) * 0.1;
        return Math.max(0, Math.min(1, prev + change));
      });
      
      // Adjust BPM based on sentiment (more volatile = faster heartbeat)
      setBpm(prev => {
        const targetBpm = 60 + (Math.abs(currentSentiment - 0.5) * 40);
        return prev + (targetBpm - prev) * 0.1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSentiment]);

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.6) return '#22c55e'; // Green for positive
    if (sentiment < 0.4) return '#ef4444'; // Red for negative
    return '#f59e0b'; // Amber for neutral
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.6) return 'Positive';
    if (sentiment < 0.4) return 'Negative';
    return 'Neutral';
  };

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Heart 
            className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`}
            style={{ color: getSentimentColor(currentSentiment) }}
          />
          <h2 className="text-xl font-bold text-white">Sentiment Pulse</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {isActive ? 'Live' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Canvas for heartbeat visualization */}
      <div className="relative bg-gray-900/50 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-48"
          style={{ background: 'transparent' }}
        />
        
        {/* Overlay metrics */}
        <div className="absolute top-4 left-4 space-y-2">
          <div className="bg-black/60 px-3 py-1 rounded-lg">
            <div className="text-xs text-gray-400">Current Sentiment</div>
            <div 
              className="text-lg font-bold"
              style={{ color: getSentimentColor(currentSentiment) }}
            >
              {getSentimentLabel(currentSentiment)}
            </div>
          </div>
          <div className="bg-black/60 px-3 py-1 rounded-lg">
            <div className="text-xs text-gray-400">Pulse Rate</div>
            <div className="text-lg font-bold text-white">
              {Math.round(bpm)} BPM
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <div className="bg-black/60 px-3 py-1 rounded-lg">
            <div className="text-xs text-gray-400">Intensity</div>
            <div className="text-lg font-bold text-white">
              {Math.round(currentSentiment * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Positive</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-400">Neutral</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-400">Negative</span>
          </div>
        </div>
        <div className="text-gray-500">
          Real-time sentiment monitoring
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentHeartbeat;
