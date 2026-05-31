import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Radar as RadarIcon, TrendingUp, Hash, Zap, Clock, AlertTriangle } from 'lucide-react';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const EmergingTrendRadar = () => {
  const [trendData, setTrendData] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
    const interval = setInterval(fetchTrendData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchTrendData = async () => {
    try {
      // Mock emerging trend data
      const mockData = {
        trending_topics: [
          {
            id: 'trend_001',
            keyword: '#sustainability',
            growth_rate: 0.89,
            volume: 12400,
            sentiment: 0.72,
            viral_potential: 0.85,
            time_to_peak: '6 hours',
            platforms: ['Twitter', 'LinkedIn', 'Instagram'],
            related_keywords: ['green', 'eco-friendly', 'carbon-neutral'],
            peak_prediction: new Date(Date.now() + 21600000), // 6 hours from now
            confidence: 0.91
          },
          {
            id: 'trend_002',
            keyword: '#pricechange',
            growth_rate: -0.34,
            volume: 8900,
            sentiment: -0.45,
            viral_potential: 0.67,
            time_to_peak: '2 hours',
            platforms: ['Reddit', 'Twitter'],
            related_keywords: ['expensive', 'cost', 'pricing'],
            peak_prediction: new Date(Date.now() + 7200000), // 2 hours from now
            confidence: 0.78
          },
          {
            id: 'trend_003',
            keyword: '#innovation',
            growth_rate: 0.56,
            volume: 15600,
            sentiment: 0.68,
            viral_potential: 0.73,
            time_to_peak: '12 hours',
            platforms: ['YouTube', 'LinkedIn', 'Twitter'],
            related_keywords: ['technology', 'breakthrough', 'future'],
            peak_prediction: new Date(Date.now() + 43200000), // 12 hours from now
            confidence: 0.84
          },
          {
            id: 'trend_004',
            keyword: '#customerservice',
            growth_rate: 0.23,
            volume: 6700,
            sentiment: 0.34,
            viral_potential: 0.45,
            time_to_peak: '4 hours',
            platforms: ['Twitter', 'Facebook'],
            related_keywords: ['support', 'help', 'response'],
            peak_prediction: new Date(Date.now() + 14400000), // 4 hours from now
            confidence: 0.69
          }
        ],
        radar_metrics: {
          labels: ['Volume', 'Growth Rate', 'Sentiment', 'Viral Potential', 'Platform Reach', 'Engagement'],
          datasets: [
            {
              label: 'Current Trends',
              data: [75, 82, 68, 79, 85, 73],
              backgroundColor: 'rgba(138, 43, 226, 0.2)',
              borderColor: '#8A2BE2',
              borderWidth: 2,
            },
            {
              label: 'Last Week',
              data: [65, 70, 72, 68, 78, 69],
              backgroundColor: 'rgba(74, 144, 226, 0.1)',
              borderColor: '#4A90E2',
              borderWidth: 2,
            },
          ],
        },
        trend_categories: {
          'Product Features': 23,
          'Pricing': 18,
          'Customer Service': 15,
          'Sustainability': 12,
          'Competition': 10,
          'Innovation': 8,
          'Other': 14
        }
      };

      setTrendData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setLoading(false);
    }
  };

  const getTrendStatus = (growthRate) => {
    if (growthRate > 0.5) return { status: 'Hot', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (growthRate > 0.2) return { status: 'Rising', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (growthRate > 0) return { status: 'Growing', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { status: 'Declining', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af' },
      },
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(156, 163, 175, 0.2)' },
        grid: { color: 'rgba(156, 163, 175, 0.2)' },
        pointLabels: { color: '#9ca3af' },
        ticks: { color: '#9ca3af', backdropColor: 'transparent' },
        min: 0,
        max: 100,
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
          <div className="h-48 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <RadarIcon className="w-6 h-6 text-primary" />
          <span>Emerging Trend Radar</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">Live Detection</span>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm border border-gray-700 focus:border-primary focus:outline-none"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
          </select>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 mb-6">
        <Radar data={trendData.radar_metrics} options={radarOptions} />
      </div>

      {/* Trending Topics */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span>Trending Topics</span>
        </h3>
        
        <div className="space-y-3">
          {trendData.trending_topics.map((trend, index) => {
            const trendStatus = getTrendStatus(trend.growth_rate);
            const isSelected = selectedTrend?.id === trend.id;
            
            return (
              <motion.div
                key={trend.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedTrend(isSelected ? null : trend)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${trendStatus.bg} ${trendStatus.color}`}>
                      {trendStatus.status}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-primary" />
                        <span>{trend.keyword}</span>
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{trend.volume.toLocaleString()} mentions</span>
                        <span className={getSentimentColor(trend.sentiment)}>
                          {trend.sentiment > 0 ? '+' : ''}{(trend.sentiment * 100).toFixed(0)}% sentiment
                        </span>
                        <span>{(trend.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${trend.growth_rate > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trend.growth_rate > 0 ? '+' : ''}{(trend.growth_rate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Peak in {trend.time_to_peak}</span>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-700"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold text-gray-400 mb-2">Platforms</h5>
                          <div className="flex flex-wrap gap-2">
                            {trend.platforms.map((platform, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {platform}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold text-gray-400 mb-2">Related Keywords</h5>
                          <div className="flex flex-wrap gap-2">
                            {trend.related_keywords.map((keyword, i) => (
                              <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-gray-300">
                              Viral Potential: {(trend.viral_potential * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-400">
                          Predicted peak: {trend.peak_prediction.toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trend Categories */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Trend Categories</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(trendData.trend_categories).map(([category, count], index) => (
            <motion.div
              key={category}
              className="bg-gray-900/50 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center">
                <div className="text-xl font-bold text-primary mb-1">{count}</div>
                <div className="text-sm text-gray-400">{category}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alert for High-Impact Trends */}
      {trendData.trending_topics.some(t => t.viral_potential > 0.8) && (
        <motion.div
          className="mt-6 bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h4 className="font-semibold text-yellow-400">High-Impact Trend Alert</h4>
          </div>
          <p className="text-sm text-gray-300">
            One or more trends show high viral potential (&gt;80%). Consider immediate engagement or response strategy.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmergingTrendRadar;
