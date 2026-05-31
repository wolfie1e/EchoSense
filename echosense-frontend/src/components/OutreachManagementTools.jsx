import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Users, CheckCircle, Clock, Star, Edit, TrendingUp } from 'lucide-react';
import { insightsAPI } from '../services/api';

const OutreachManagementTools = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getOutreachCampaigns();
      setCampaigns(data.campaigns || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'draft': return 'text-yellow-400';
      case 'paused': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return Edit;
      case 'paused': return Clock;
      default: return Clock;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-500';
      case 'reddit': return 'bg-orange-500';
      case 'linkedin': return 'bg-blue-600';
      case 'facebook': return 'bg-blue-700';
      default: return 'bg-gray-500';
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
            {[1, 2].map(i => (
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
          <MessageSquare className="w-6 h-6 text-primary" />
          <span>Outreach Management</span>
        </h2>
        
        <motion.button
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="w-4 h-4" />
          <span>New Campaign</span>
        </motion.button>
      </div>

      {/* Campaign List */}
      <div className="space-y-4 mb-6">
        {campaigns.map((campaign, index) => {
          const StatusIcon = getStatusIcon(campaign.status);
          const isSelected = selectedCampaign?.id === campaign.id;
          
          return (
            <motion.div
              key={campaign.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedCampaign(isSelected ? null : campaign)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(campaign.status)}`} />
                    <div className={`w-3 h-3 ${getPlatformColor(campaign.platform)} rounded-full`}></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{campaign.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>{campaign.platform}</span>
                      <span className="capitalize">{campaign.status}</span>
                      <span>{campaign.messages_sent} sent</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    {(campaign.response_rate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Response Rate</div>
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
                    <div className="mb-4">
                      <h4 className="font-semibold text-white mb-2">Message Template</h4>
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-300 italic">"{campaign.template}"</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">{campaign.messages_sent}</div>
                        <div className="text-xs text-gray-400">Messages Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">
                          {(campaign.response_rate * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          +{(campaign.sentiment_improvement * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Sentiment Boost</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Created: {campaign.created.toLocaleDateString()}
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <motion.button
                          className="px-3 py-1 bg-gray-800 text-gray-400 hover:text-white rounded text-xs transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Edit
                        </motion.button>
                        
                        <motion.button
                          className="px-3 py-1 bg-primary text-white rounded text-xs hover:bg-primary/80 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {campaign.status === 'active' ? 'Pause' : 'Activate'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-blue-400">
            {campaigns.reduce((sum, c) => sum + c.messages_sent, 0)}
          </div>
          <div className="text-xs text-gray-400">Total Sent</div>
        </div>
        
        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
          <Star className="w-5 h-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-green-400">
            {(campaigns.reduce((sum, c) => sum + c.response_rate, 0) / campaigns.length * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Avg Response</div>
        </div>
        
        <div className="bg-gray-900/50 p-3 rounded-lg text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <div className="text-lg font-bold text-primary">
            +{(campaigns.reduce((sum, c) => sum + c.sentiment_improvement, 0) * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Sentiment Impact</div>
        </div>
      </div>
    </motion.div>
  );
};

export default OutreachManagementTools;
