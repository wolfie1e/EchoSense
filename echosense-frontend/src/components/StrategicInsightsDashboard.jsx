import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Doughnut, Line } from 'react-chartjs-2';
import { Target, TrendingUp, Users, Zap, Eye, MessageSquare } from 'lucide-react';
import { insightsAPI } from '../services/api';

const StrategicInsightsDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategicInsights();
  }, []);

  const fetchStrategicInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getStrategicInsights();
      setInsights(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching strategic insights:', error);
      setLoading(false);
    }
  };

  const brandStrengthData = insights ? {
    labels: ['Awareness', 'Consideration', 'Preference', 'Loyalty'],
    datasets: [
      {
        data: [
          insights.brand_strength.awareness,
          insights.brand_strength.consideration,
          insights.brand_strength.preference,
          insights.brand_strength.loyalty
        ],
        backgroundColor: [
          'rgba(138, 43, 226, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          '#8A2BE2',
          '#3b82f6',
          '#22c55e',
          '#f59e0b'
        ],
        borderWidth: 2,
      },
    ],
  } : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#9ca3af' },
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
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
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
          <span>Strategic Insights</span>
        </h2>
      </div>

      {/* Market Position */}
      <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Position</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-primary mb-1">
              {insights.market_position.score}%
            </div>
            <div className="text-sm text-gray-400">Overall Score</div>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-semibold">
              {insights.market_position.vs_competitors} vs competitors
            </div>
            <div className="text-sm text-gray-400 capitalize">
              {insights.market_position.trend}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Strength */}
      <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Brand Strength</h3>
        <div className="h-48">
          <Doughnut data={brandStrengthData} options={doughnutOptions} />
        </div>
      </div>

      {/* Opportunity Matrix */}
      <div className="bg-gray-900/50 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Opportunity Matrix</h3>
        <div className="space-y-3">
          {insights.opportunity_areas.map((opp, index) => (
            <div key={opp.area} className="flex items-center justify-between">
              <span className="text-gray-300">{opp.area}</span>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-400">
                  Potential: {(opp.potential * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-400">
                  Effort: {(opp.effort * 100).toFixed(0)}%
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  opp.potential > 0.7 && opp.effort < 0.5 ? 'bg-green-500' :
                  opp.potential > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Recommendations */}
      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">Strategic Recommendations</h3>
        <div className="space-y-2">
          {insights.strategic_recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <span className="text-sm text-gray-300">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default StrategicInsightsDashboard;
