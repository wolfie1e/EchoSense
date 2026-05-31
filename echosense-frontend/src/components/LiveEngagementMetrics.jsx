import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Activity, Users, MessageCircle, Heart, Share, Eye } from 'lucide-react';

const LiveEngagementMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Update metrics every 2 seconds
    const interval = setInterval(() => {
      const newMetrics = {
        likes: Math.floor(1000 + Math.random() * 500),
        shares: Math.floor(200 + Math.random() * 100),
        comments: Math.floor(150 + Math.random() * 75),
        views: Math.floor(5000 + Math.random() * 2000),
        engagement_rate: 0.05 + Math.random() * 0.03,
        reach: Math.floor(10000 + Math.random() * 5000)
      };
      
      setMetrics(newMetrics);
      
      // Update chart data
      setChartData({
        labels: ['Likes', 'Shares', 'Comments', 'Views (100s)'],
        datasets: [
          {
            label: 'Engagement',
            data: [
              newMetrics.likes,
              newMetrics.shares,
              newMetrics.comments,
              Math.floor(newMetrics.views / 100)
            ],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(138, 43, 226, 0.8)'
            ],
            borderColor: [
              '#ef4444',
              '#22c55e',
              '#3b82f6',
              '#8A2BE2'
            ],
            borderWidth: 1,
          },
        ],
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
      },
    },
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
          <Activity className="w-6 h-6 text-primary" />
          <span>Live Engagement</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: 'Likes', value: metrics.likes, icon: Heart, color: 'text-red-400' },
          { label: 'Shares', value: metrics.shares, icon: Share, color: 'text-green-400' },
          { label: 'Comments', value: metrics.comments, icon: MessageCircle, color: 'text-blue-400' },
          { label: 'Views', value: metrics.views, icon: Eye, color: 'text-purple-400' },
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="bg-gray-900/50 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <IconComponent className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              <div className={`text-lg font-bold ${metric.color}`}>
                {metric.value?.toLocaleString() || '0'}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Engagement Rate */}
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">Engagement Rate</span>
          <span className="text-primary text-xl font-bold">
            {((metrics.engagement_rate || 0) * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      {chartData && (
        <div className="h-32">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </motion.div>
  );
};

export default LiveEngagementMetrics;
