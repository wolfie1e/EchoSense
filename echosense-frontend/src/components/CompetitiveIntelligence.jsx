import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Scatter } from 'react-chartjs-2';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Target, TrendingUp, TrendingDown, Users, BarChart3, Zap } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CompetitiveIntelligence = () => {
  const [competitorData, setCompetitorData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('sentiment');
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCompetitorData();
    const interval = setInterval(fetchCompetitorData, 60000);
    return () => clearInterval(interval);
  }, [timeRange, selectedMetric]);

  useEffect(() => {
    // GSAP entrance animation
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading]);

  const fetchCompetitorData = async () => {
    try {
      // Mock competitive data
      const mockCompetitors = [
        {
          brand: 'Tesla',
          sentiment_score: 72,
          volume: 1250,
          share_of_voice: 35,
          trend: 'up',
          color: '#ef4444',
          weekly_data: [68, 70, 69, 71, 73, 72, 74],
          position: { x: 72, y: 1250 }
        },
        {
          brand: 'BMW',
          sentiment_score: 65,
          volume: 890,
          share_of_voice: 25,
          trend: 'stable',
          color: '#3b82f6',
          weekly_data: [63, 64, 66, 65, 67, 65, 66],
          position: { x: 65, y: 890 }
        },
        {
          brand: 'Mercedes',
          sentiment_score: 68,
          volume: 750,
          share_of_voice: 21,
          trend: 'up',
          color: '#22c55e',
          weekly_data: [65, 66, 67, 68, 69, 68, 70],
          position: { x: 68, y: 750 }
        },
        {
          brand: 'Audi',
          sentiment_score: 61,
          volume: 680,
          share_of_voice: 19,
          trend: 'down',
          color: '#f59e0b',
          weekly_data: [65, 64, 62, 61, 60, 61, 62],
          position: { x: 61, y: 680 }
        }
      ];

      setCompetitorData(mockCompetitors);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching competitor data:', error);
      setLoading(false);
    }
  };

  const lineChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: competitorData.map(competitor => ({
      label: competitor.brand,
      data: competitor.weekly_data,
      borderColor: competitor.color,
      backgroundColor: `${competitor.color}20`,
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: competitor.color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
    })),
  };

  const scatterData = {
    datasets: competitorData.map(competitor => ({
      label: competitor.brand,
      data: [competitor.position],
      backgroundColor: competitor.color,
      borderColor: competitor.color,
      pointRadius: 15,
      pointHoverRadius: 20,
    })),
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af' },
      },
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

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af' },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const brand = context.dataset.label;
            const x = context.parsed.x;
            const y = context.parsed.y;
            return `${brand}: Sentiment ${x}, Volume ${y}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Sentiment Score',
          color: '#9ca3af',
        },
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      y: {
        title: {
          display: true,
          text: 'Mention Volume',
          color: '#9ca3af',
        },
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
    },
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
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
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
          <BarChart3 className="w-6 h-6 text-primary" />
          <span>Competitive Intelligence</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSelectedMetric('sentiment')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedMetric === 'sentiment'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sentiment
            </button>
            <button
              onClick={() => setSelectedMetric('volume')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                selectedMetric === 'volume'
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Comparison */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">7-Day Trend Comparison</h3>
          <div className="h-48">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>

        {/* Positioning Matrix */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Market Positioning</h3>
          <div className="h-48">
            <Scatter data={scatterData} options={scatterOptions} />
          </div>
        </div>
      </div>

      {/* Competitor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {competitorData.map((competitor, index) => {
          const TrendIcon = competitor.trend === 'up' ? TrendingUp : 
                          competitor.trend === 'down' ? TrendingDown : Target;
          const trendColor = competitor.trend === 'up' ? 'text-green-400' :
                           competitor.trend === 'down' ? 'text-red-400' : 'text-gray-400';
          
          return (
            <motion.div
              key={competitor.brand}
              className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
              whileHover={{
                scale: 1.05,
                boxShadow: `0 10px 30px ${competitor.color}40`
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{competitor.brand}</h3>
                <TrendIcon className={`w-5 h-5 ${trendColor}`} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Sentiment</span>
                  <span className="text-sm font-semibold text-white">
                    {competitor.sentiment_score}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Volume</span>
                  <span className="text-sm font-semibold text-white">
                    {competitor.volume.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Share of Voice</span>
                  <span className="text-sm font-semibold text-white">
                    {competitor.share_of_voice}%
                  </span>
                </div>
              </div>
              
              {/* Brand color indicator */}
              <div className="mt-3 w-full h-1 rounded-full" style={{ backgroundColor: competitor.color }} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CompetitiveIntelligence;
