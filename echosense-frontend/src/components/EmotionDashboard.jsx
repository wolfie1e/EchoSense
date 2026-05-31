import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Smile, Frown, Angry, Zap, AlertTriangle, X } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const EmotionDashboard = () => {
  const [emotionData, setEmotionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmotionData();
    const interval = setInterval(fetchEmotionData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchEmotionData = async () => {
    try {
      const response = await fetch('/api/emotions');
      const data = await response.json();
      setEmotionData(data);
    } catch (error) {
      console.error('Error fetching emotion data:', error);
      // Fallback data
      setEmotionData({
        emotions: {
          joy: 0.35,
          sadness: 0.15,
          anger: 0.10,
          fear: 0.08,
          surprise: 0.20,
          disgust: 0.12
        },
        dominant_emotion: 'joy',
        confidence: 0.35,
        timestamp: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      joy: Smile,
      sadness: Frown,
      anger: Angry,
      surprise: Zap,
      fear: AlertTriangle,
      disgust: X
    };
    return icons[emotion] || Smile;
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      joy: '#22c55e',      // Green
      sadness: '#3b82f6',  // Blue
      anger: '#ef4444',    // Red
      surprise: '#f59e0b', // Amber
      fear: '#8b5cf6',     // Purple
      disgust: '#84cc16'   // Lime
    };
    return colors[emotion] || '#6b7280';
  };

  const getEmotionLabel = (emotion) => {
    const labels = {
      joy: 'Joy',
      sadness: 'Sadness',
      anger: 'Anger',
      surprise: 'Surprise',
      fear: 'Fear',
      disgust: 'Disgust'
    };
    return labels[emotion] || emotion;
  };

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Emotion Analysis</h2>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const radarData = {
    labels: Object.keys(emotionData.emotions).map(emotion => getEmotionLabel(emotion)),
    datasets: [
      {
        label: 'Emotion Intensity',
        data: Object.values(emotionData.emotions).map(value => value * 100),
        backgroundColor: 'rgba(138, 43, 226, 0.2)',
        borderColor: '#8A2BE2',
        borderWidth: 2,
        pointBackgroundColor: '#8A2BE2',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#8A2BE2',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        },
        pointLabels: {
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
        ticks: {
          color: '#6b7280',
          backdropColor: 'transparent',
        },
        suggestedMin: 0,
        suggestedMax: 50,
      },
    },
  };

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Emotion Analysis</h2>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 mb-6">
        <Radar data={radarData} options={radarOptions} />
      </div>

      {/* Dominant Emotion */}
      <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
        <div className="flex items-center space-x-3">
          {React.createElement(getEmotionIcon(emotionData.dominant_emotion), {
            className: `w-8 h-8`,
            style: { color: getEmotionColor(emotionData.dominant_emotion) }
          })}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Dominant Emotion: {getEmotionLabel(emotionData.dominant_emotion)}
            </h3>
            <p className="text-sm text-gray-400">
              Confidence: {Math.round(emotionData.confidence * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Emotion Breakdown Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(emotionData.emotions).map(([emotion, value]) => {
          const IconComponent = getEmotionIcon(emotion);
          const color = getEmotionColor(emotion);
          const percentage = Math.round(value * 100);
          
          return (
            <motion.div
              key={emotion}
              className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <IconComponent className="w-4 h-4" style={{ color }} />
                <span className="text-sm font-medium text-white capitalize">
                  {getEmotionLabel(emotion)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">{percentage}%</span>
                <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(emotionData.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
};

export default EmotionDashboard;
