import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Target, TrendingUp, TrendingDown, Star, DollarSign, Wrench, Truck, Users } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AspectBasedSentiment = () => {
  const [aspectData, setAspectData] = useState([]);
  const [selectedAspect, setSelectedAspect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAspectData();
    const interval = setInterval(fetchAspectData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAspectData = async () => {
    try {
      // Mock aspect-based sentiment data
      const mockAspects = [
        {
          aspect: 'Quality',
          icon: Star,
          sentiment_scores: { positive: 72, negative: 18, neutral: 10 },
          avg_sentiment: 0.54,
          mention_count: 245,
          trend: 'up',
          key_phrases: ['excellent build', 'premium materials', 'durable construction'],
          sample_mentions: [
            'The build quality is exceptional, really impressed!',
            'Materials feel premium and well-crafted',
            'Quality has improved significantly over the years'
          ]
        },
        {
          aspect: 'Pricing',
          icon: DollarSign,
          sentiment_scores: { positive: 35, negative: 45, neutral: 20 },
          avg_sentiment: -0.10,
          mention_count: 189,
          trend: 'down',
          key_phrases: ['too expensive', 'overpriced', 'worth the cost'],
          sample_mentions: [
            'Price is quite steep for what you get',
            'Expensive but worth it for the quality',
            'Pricing needs to be more competitive'
          ]
        },
        {
          aspect: 'Customer Service',
          icon: Users,
          sentiment_scores: { positive: 58, negative: 25, neutral: 17 },
          avg_sentiment: 0.33,
          mention_count: 156,
          trend: 'up',
          key_phrases: ['helpful support', 'quick response', 'professional staff'],
          sample_mentions: [
            'Customer service was incredibly helpful',
            'Quick response time and professional handling',
            'Support team went above and beyond'
          ]
        },
        {
          aspect: 'Delivery',
          icon: Truck,
          sentiment_scores: { positive: 68, negative: 22, neutral: 10 },
          avg_sentiment: 0.46,
          mention_count: 134,
          trend: 'stable',
          key_phrases: ['fast delivery', 'on time', 'well packaged'],
          sample_mentions: [
            'Delivery was faster than expected',
            'Package arrived in perfect condition',
            'Shipping was quick and reliable'
          ]
        },
        {
          aspect: 'Features',
          icon: Wrench,
          sentiment_scores: { positive: 65, negative: 20, neutral: 15 },
          avg_sentiment: 0.45,
          mention_count: 198,
          trend: 'up',
          key_phrases: ['innovative features', 'user-friendly', 'advanced technology'],
          sample_mentions: [
            'Love the new features in the latest update',
            'Interface is intuitive and user-friendly',
            'Advanced features that actually work well'
          ]
        }
      ];

      setAspectData(mockAspects);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching aspect data:', error);
      setLoading(false);
    }
  };

  const getAspectColor = (sentiment) => {
    if (sentiment > 0.2) return '#22c55e';
    if (sentiment < -0.2) return '#ef4444';
    return '#f59e0b';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Target;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const chartData = {
    labels: aspectData.map(aspect => aspect.aspect),
    datasets: [
      {
        label: 'Positive',
        data: aspectData.map(aspect => aspect.sentiment_scores.positive),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Neutral',
        data: aspectData.map(aspect => aspect.sentiment_scores.neutral),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
      {
        label: 'Negative',
        data: aspectData.map(aspect => aspect.sentiment_scores.negative),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#9ca3af',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: '#9ca3af',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
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
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
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
          <Target className="w-6 h-6 text-primary" />
          <span>Aspect-Based Sentiment</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm border border-gray-700 focus:border-primary focus:outline-none"
          >
            <option value="1d">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="h-64 mb-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Aspect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {aspectData.map((aspect, index) => {
          const IconComponent = aspect.icon;
          const TrendIcon = getTrendIcon(aspect.trend);
          
          return (
            <motion.div
              key={aspect.aspect}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedAspect?.aspect === aspect.aspect
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedAspect(selectedAspect?.aspect === aspect.aspect ? null : aspect)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-white">{aspect.aspect}</span>
                </div>
                <TrendIcon className={`w-4 h-4 ${getTrendColor(aspect.trend)}`} />
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold" style={{ color: getAspectColor(aspect.avg_sentiment) }}>
                  {aspect.avg_sentiment > 0 ? '+' : ''}{(aspect.avg_sentiment * 100).toFixed(0)}
                </span>
                <span className="text-sm text-gray-400">{aspect.mention_count} mentions</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${aspect.sentiment_scores.positive}%`,
                    backgroundColor: getAspectColor(aspect.avg_sentiment)
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Aspect Details */}
      <AnimatePresence>
        {selectedAspect && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">
              {selectedAspect.aspect} - Detailed Analysis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Phrases</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedAspect.key_phrases.map((phrase, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Sample Mentions</h4>
                <div className="space-y-2">
                  {selectedAspect.sample_mentions.slice(0, 2).map((mention, index) => (
                    <div key={index} className="text-sm text-gray-300 italic">
                      "{mention}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AspectBasedSentiment;
