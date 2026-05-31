import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MessageCircle, TrendingUp, TrendingDown, Clock, User } from 'lucide-react';

const LiveSentimentStream = () => {
  const [streamData, setStreamData] = useState([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate live data stream
    const interval = setInterval(() => {
      if (isLive) {
        const newMention = {
          id: Date.now(),
          text: generateRandomMention(),
          sentiment: (Math.random() - 0.5) * 2,
          platform: ['Twitter', 'Reddit', 'Instagram', 'Facebook'][Math.floor(Math.random() * 4)],
          timestamp: new Date(),
          author: `User${Math.floor(Math.random() * 1000)}`
        };
        
        setStreamData(prev => [newMention, ...prev.slice(0, 19)]); // Keep last 20
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  const generateRandomMention = () => {
    const mentions = [
      "Just tried the new product - absolutely love it!",
      "Customer service was incredibly helpful today",
      "The quality has really improved over the years",
      "Pricing seems a bit steep for what you get",
      "Great experience with the latest update",
      "Having some issues with the new features",
      "Best purchase I've made this year!",
      "The design is sleek and modern",
      "Delivery was faster than expected",
      "Would definitely recommend to others"
    ];
    return mentions[Math.floor(Math.random() * mentions.length)];
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return 'text-green-400';
    if (sentiment < -0.3) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.3) return TrendingUp;
    if (sentiment < -0.3) return TrendingDown;
    return MessageCircle;
  };

  const getPlatformColor = (platform) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'bg-blue-500';
      case 'instagram': return 'bg-pink-500';
      case 'facebook': return 'bg-blue-600';
      case 'reddit': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl h-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Activity className="w-6 h-6 text-primary" />
          <span>Live Sentiment Stream</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <motion.div
              className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500' : 'bg-gray-500'}`}
              animate={isLive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-gray-400">{isLive ? 'LIVE' : 'PAUSED'}</span>
          </div>
          
          <button
            onClick={() => setIsLive(!isLive)}
            className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <AnimatePresence>
          {streamData.map((mention, index) => {
            const SentimentIcon = getSentimentIcon(mention.sentiment);
            return (
              <motion.div
                key={mention.id}
                className="bg-gray-900/50 p-3 rounded-lg border border-gray-700"
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 ${getPlatformColor(mention.platform)} rounded-full`}></div>
                    <span className="text-sm text-gray-400">{mention.platform}</span>
                    <span className="text-xs text-gray-500">@{mention.author}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <SentimentIcon className={`w-4 h-4 ${getSentimentColor(mention.sentiment)}`} />
                    <span className={`text-xs font-semibold ${getSentimentColor(mention.sentiment)}`}>
                      {mention.sentiment > 0 ? '+' : ''}{(mention.sentiment * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-2">{mention.text}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{mention.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <span>#{index + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {streamData.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Waiting for live mentions...</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LiveSentimentStream;
