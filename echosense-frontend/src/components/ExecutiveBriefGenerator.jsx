import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Mail, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { insightsAPI } from '../services/api';

const ExecutiveBriefGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefData, setBriefData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBriefData();
  }, []);

  const fetchBriefData = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getExecutiveBrief();
      setBriefData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching brief data:', error);
      setLoading(false);
    }
  };

  const generateBrief = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation time
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchBriefData(); // Refresh data
    } catch (error) {
      console.error('Error generating brief:', error);
    }
    setIsGenerating(false);
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!briefData) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2" />
          <p>Unable to load executive brief data</p>
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
          <FileText className="w-6 h-6 text-primary" />
          <span>Executive Brief Generator</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={generateBrief}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Brief'}</span>
          </motion.button>
        </div>
      </div>

      {/* Brief Content */}
      <div className="space-y-6">
        {/* Executive Summary */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Executive Summary</span>
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{briefData.sentiment_summary}</p>
        </div>

        {/* Key Insights */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
          <div className="space-y-2">
            {briefData.key_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <span className="text-sm text-gray-300">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Recommended Actions</h3>
          <div className="space-y-2">
            {briefData.action_items.map((action, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                <span className="text-sm text-gray-300">{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Risk Factors</span>
          </h3>
          <div className="space-y-2">
            {briefData.risk_factors.map((risk, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <span className="text-sm text-gray-300">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          Generated: {new Date().toLocaleString()}
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-4 h-4" />
            <span>Email</span>
          </motion.button>
          
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExecutiveBriefGenerator;
