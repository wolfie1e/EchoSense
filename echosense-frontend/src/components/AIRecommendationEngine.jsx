import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Clock, Star } from 'lucide-react';
import { insightsAPI } from '../services/api';

const AIRecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRec, setSelectedRec] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getRecommendations();
      setRecommendations(data.recommendations || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
      // Error handling - could show error state to user
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Lightbulb;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return AlertTriangle;
      case 'opportunity': return TrendingUp;
      case 'optimization': return Star;
      default: return Lightbulb;
    }
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
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
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
          <Brain className="w-6 h-6 text-primary" />
          <span>AI Recommendation Engine</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">AI Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const PriorityIcon = getPriorityIcon(rec.priority);
          const TypeIcon = getTypeIcon(rec.type);
          const isSelected = selectedRec?.id === rec.id;
          
          return (
            <motion.div
              key={rec.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedRec(isSelected ? null : rec)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="w-5 h-5 text-primary" />
                    <PriorityIcon className={`w-4 h-4 ${getPriorityColor(rec.priority)}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-300 mb-2">{rec.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Star className="w-3 h-3" />
                        <span>{(rec.confidence * 100).toFixed(0)}% confidence</span>
                      </span>
                      <span>ROI: {rec.estimated_roi}x</span>
                      <span>{rec.time_to_implement}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {(rec.impact_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Impact Score</div>
                </div>
              </div>
              
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-700 pt-4"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">AI Reasoning</h4>
                      <p className="text-sm text-gray-300">{rec.reasoning}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">Recommended Actions</h4>
                      <div className="space-y-2">
                        {rec.actions.map((action, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-300">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {rec.priority} priority
                        </span>
                        <span className="text-gray-400">{rec.category}</span>
                      </div>
                      
                      <motion.button
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Implement
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AIRecommendationEngine;
