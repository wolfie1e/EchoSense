import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { Users, TrendingUp, TrendingDown, Star, ExternalLink, MessageCircle, Heart, Share } from 'lucide-react';

const InfluencerImpactTracker = () => {
  const [influencerData, setInfluencerData] = useState(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInfluencerData();
    const interval = setInterval(fetchInfluencerData, 120000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchInfluencerData = async () => {
    try {
      // Mock influencer impact data
      const mockData = {
        top_influencers: [
          {
            id: 'inf_001',
            name: '@TechReviewer',
            platform: 'Twitter',
            followers: 2400000,
            engagement_rate: 0.087,
            sentiment_impact: 0.34,
            mentions_generated: 1247,
            reach_amplification: 15.6,
            profile_image: '/api/placeholder/50/50',
            recent_mention: 'Just tried the new product - impressed with the build quality!',
            mention_timestamp: new Date(Date.now() - 7200000),
            impact_timeline: [0.1, 0.2, 0.4, 0.6, 0.5, 0.3, 0.2]
          },
          {
            id: 'inf_002',
            name: '@LifestyleBlogger',
            platform: 'Instagram',
            followers: 1800000,
            engagement_rate: 0.124,
            sentiment_impact: 0.28,
            mentions_generated: 892,
            reach_amplification: 12.3,
            profile_image: '/api/placeholder/50/50',
            recent_mention: 'Love how this fits into my daily routine ✨',
            mention_timestamp: new Date(Date.now() - 14400000),
            impact_timeline: [0.05, 0.1, 0.25, 0.4, 0.35, 0.25, 0.15]
          },
          {
            id: 'inf_003',
            name: 'TechTalks YouTube',
            platform: 'YouTube',
            followers: 3200000,
            engagement_rate: 0.056,
            sentiment_impact: -0.12,
            mentions_generated: 2156,
            reach_amplification: 8.9,
            profile_image: '/api/placeholder/50/50',
            recent_mention: 'Detailed review: Some concerns about the pricing strategy',
            mention_timestamp: new Date(Date.now() - 21600000),
            impact_timeline: [0.0, -0.05, -0.1, -0.15, -0.12, -0.08, -0.05]
          }
        ],
        impact_metrics: {
          total_reach: 12400000,
          sentiment_shift: 0.18,
          viral_coefficient: 2.4,
          brand_mentions_generated: 4295
        },
        platform_breakdown: {
          Twitter: { influencers: 45, avg_impact: 0.23 },
          Instagram: { influencers: 32, avg_impact: 0.31 },
          YouTube: { influencers: 18, avg_impact: 0.19 },
          TikTok: { influencers: 28, avg_impact: 0.27 }
        }
      };

      setInfluencerData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching influencer data:', error);
      setLoading(false);
    }
  };

  const getSentimentColor = (impact) => {
    if (impact > 0.2) return 'text-green-400';
    if (impact < -0.2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (impact) => {
    if (impact > 0.2) return TrendingUp;
    if (impact < -0.2) return TrendingDown;
    return MessageCircle;
  };

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-500';
      case 'instagram': return 'bg-pink-500';
      case 'youtube': return 'bg-red-500';
      case 'tiktok': return 'bg-gray-800';
      default: return 'bg-gray-600';
    }
  };

  const chartData = selectedInfluencer ? {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Sentiment Impact',
        data: selectedInfluencer.impact_timeline,
        borderColor: getSentimentColor(selectedInfluencer.sentiment_impact).includes('green') ? '#22c55e' :
                     getSentimentColor(selectedInfluencer.sentiment_impact).includes('red') ? '#ef4444' : '#f59e0b',
        backgroundColor: getSentimentColor(selectedInfluencer.sentiment_impact).includes('green') ? 'rgba(34, 197, 94, 0.1)' :
                        getSentimentColor(selectedInfluencer.sentiment_impact).includes('red') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-700 rounded"></div>
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
          <Users className="w-6 h-6 text-primary" />
          <span>Influencer Impact Tracker</span>
        </h2>
        
        <div className="flex items-center space-x-4">
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

      {/* Impact Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Reach', 
            value: `${(influencerData.impact_metrics.total_reach / 1000000).toFixed(1)}M`, 
            icon: Users, 
            color: 'text-blue-400' 
          },
          { 
            label: 'Sentiment Shift', 
            value: `${influencerData.impact_metrics.sentiment_shift > 0 ? '+' : ''}${(influencerData.impact_metrics.sentiment_shift * 100).toFixed(1)}%`, 
            icon: getSentimentIcon(influencerData.impact_metrics.sentiment_shift), 
            color: getSentimentColor(influencerData.impact_metrics.sentiment_shift) 
          },
          { 
            label: 'Viral Coefficient', 
            value: `${influencerData.impact_metrics.viral_coefficient}x`, 
            icon: Share, 
            color: 'text-purple-400' 
          },
          { 
            label: 'Mentions Generated', 
            value: influencerData.impact_metrics.brand_mentions_generated.toLocaleString(), 
            icon: MessageCircle, 
            color: 'text-green-400' 
          },
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="bg-gray-900/50 p-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${metric.color}`} />
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              <div className={`text-xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Influencers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Influencers</h3>
        <div className="space-y-4">
          {influencerData.top_influencers.map((influencer, index) => {
            const SentimentIcon = getSentimentIcon(influencer.sentiment_impact);
            const isSelected = selectedInfluencer?.id === influencer.id;
            
            return (
              <motion.div
                key={influencer.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedInfluencer(isSelected ? null : influencer)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getPlatformColor(influencer.platform)} rounded-full flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white">{influencer.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{influencer.platform}</span>
                        <span>{(influencer.followers / 1000000).toFixed(1)}M followers</span>
                        <span>{(influencer.engagement_rate * 100).toFixed(1)}% engagement</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <SentimentIcon className={`w-4 h-4 ${getSentimentColor(influencer.sentiment_impact)}`} />
                      <span className={`font-bold ${getSentimentColor(influencer.sentiment_impact)}`}>
                        {influencer.sentiment_impact > 0 ? '+' : ''}{(influencer.sentiment_impact * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {influencer.mentions_generated} mentions
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-300 italic">
                  "{influencer.recent_mention}"
                </div>
                
                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                  <span>{new Date(influencer.mention_timestamp).toLocaleString()}</span>
                  <span>{influencer.reach_amplification}x amplification</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Influencer Impact Chart */}
      <AnimatePresence>
        {selectedInfluencer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 rounded-lg p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedInfluencer.name} - Impact Timeline
            </h3>
            <div className="h-48">
              <Line data={chartData} options={chartOptions} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Breakdown */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Breakdown</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(influencerData.platform_breakdown).map(([platform, data], index) => (
            <motion.div
              key={platform}
              className="bg-gray-900/50 p-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 ${getPlatformColor(platform)} rounded-full`}></div>
                <span className="font-semibold text-white">{platform}</span>
              </div>
              <div className="text-sm text-gray-400 mb-1">
                {data.influencers} influencers
              </div>
              <div className="text-lg font-bold text-primary">
                {(data.avg_impact * 100).toFixed(1)}% avg impact
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default InfluencerImpactTracker;
