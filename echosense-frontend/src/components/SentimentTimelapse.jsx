import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const SentimentTimelapse = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timelapseData, setTimelapseData] = useState([]);

  useEffect(() => {
    // Generate mock timelapse data (30 days)
    const data = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      sentiment: 50 + Math.sin(i * 0.2) * 20 + (Math.random() - 0.5) * 10,
      volume: 1000 + Math.random() * 500,
      events: i % 7 === 0 ? [`Event on day ${i + 1}`] : []
    }));
    setTimelapseData(data);
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && currentFrame < timelapseData.length - 1) {
      interval = setInterval(() => {
        setCurrentFrame(prev => prev + 1);
      }, 1000 / playbackSpeed);
    } else if (currentFrame >= timelapseData.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentFrame, playbackSpeed, timelapseData.length]);

  const currentData = timelapseData.slice(0, currentFrame + 1);
  
  const chartData = {
    labels: currentData.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: 'Sentiment Score',
        data: currentData.map(d => d.sentiment),
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        min: 0,
        max: 100,
      },
    },
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentFrame(0);
    setIsPlaying(false);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Play className="w-6 h-6 text-primary" />
          <span>Sentiment Timelapse</span>
        </h2>
        
        <div className="text-sm text-gray-400">
          Day {currentFrame + 1} of {timelapseData.length}
        </div>
      </div>

      <div className="h-48 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipBack className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handlePlayPause}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </motion.button>
          
          <motion.button
            onClick={() => setCurrentFrame(Math.min(timelapseData.length - 1, currentFrame + 1))}
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SkipForward className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={handleReset}
            className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Speed:</span>
          {[0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                playbackSpeed === speed
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${((currentFrame + 1) / timelapseData.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentTimelapse;
