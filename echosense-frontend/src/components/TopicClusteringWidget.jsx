import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, TrendingUp, TrendingDown, Users, MessageCircle } from 'lucide-react';

const TopicClusteringWidget = () => {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
    const interval = setInterval(fetchTopics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Fallback mock data
      setTopics([
        {
          topic_id: 0,
          keywords: ['product', 'quality', 'features', 'design', 'innovation'],
          doc_count: 45,
          avg_sentiment: 0.3,
          sentiment_distribution: { positive: 60, negative: 20, neutral: 20 }
        },
        {
          topic_id: 1,
          keywords: ['customer', 'service', 'support', 'help', 'experience'],
          doc_count: 32,
          avg_sentiment: -0.1,
          sentiment_distribution: { positive: 40, negative: 35, neutral: 25 }
        },
        {
          topic_id: 2,
          keywords: ['price', 'cost', 'value', 'expensive', 'affordable'],
          doc_count: 28,
          avg_sentiment: -0.2,
          sentiment_distribution: { positive: 30, negative: 45, neutral: 25 }
        },
        {
          topic_id: 3,
          keywords: ['delivery', 'shipping', 'fast', 'quick', 'time'],
          doc_count: 21,
          avg_sentiment: 0.4,
          sentiment_distribution: { positive: 70, negative: 15, neutral: 15 }
        },
        {
          topic_id: 4,
          keywords: ['update', 'new', 'version', 'release', 'feature'],
          doc_count: 18,
          avg_sentiment: 0.2,
          sentiment_distribution: { positive: 55, negative: 25, neutral: 20 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.1) return 'text-green-400';
    if (sentiment < -0.1) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.1) return TrendingUp;
    if (sentiment < -0.1) return TrendingDown;
    return TrendingUp;
  };

  const getTopicSize = (docCount, maxCount) => {
    const ratio = docCount / maxCount;
    if (ratio > 0.7) return 'text-2xl';
    if (ratio > 0.4) return 'text-xl';
    if (ratio > 0.2) return 'text-lg';
    return 'text-base';
  };

  const getTopicOpacity = (docCount, maxCount) => {
    const ratio = docCount / maxCount;
    return Math.max(0.4, ratio);
  };

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      >
        <h2 className="text-xl font-bold text-white mb-4">Topic Clustering</h2>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const maxCount = Math.max(...topics.map(t => t.doc_count));

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Topic Clustering</h2>
        <div className="flex items-center space-x-2">
          <Hash className="w-5 h-5 text-primary" />
          <span className="text-sm text-gray-400">{topics.length} topics</span>
        </div>
      </div>

      {/* Interactive Tag Cloud */}
      <div className="mb-6 p-4 bg-gray-900/30 rounded-lg min-h-[200px] flex flex-wrap items-center justify-center gap-3">
        {topics.map((topic) => {
          const SentimentIcon = getSentimentIcon(topic.avg_sentiment);
          const size = getTopicSize(topic.doc_count, maxCount);
          const opacity = getTopicOpacity(topic.doc_count, maxCount);
          
          return (
            <motion.button
              key={topic.topic_id}
              className={`
                ${size} font-semibold px-3 py-2 rounded-lg border transition-all duration-200
                ${selectedTopic?.topic_id === topic.topic_id 
                  ? 'bg-primary/20 border-primary text-primary' 
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                }
              `}
              style={{ opacity }}
              onClick={() => setSelectedTopic(selectedTopic?.topic_id === topic.topic_id ? null : topic)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-1">
                <span>{topic.keywords[0]}</span>
                <SentimentIcon className={`w-3 h-3 ${getSentimentColor(topic.avg_sentiment)}`} />
              </div>
              <div className="text-xs opacity-75">
                {topic.doc_count} mentions
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Topic Details */}
      <AnimatePresence>
        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/50 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">
                Topic: {selectedTopic.keywords[0]}
              </h3>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{selectedTopic.doc_count} mentions</span>
              </div>
            </div>
            
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Keywords:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedTopic.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-md"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Sentiment Distribution:</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-green-400 font-semibold">
                    {Math.round(selectedTopic.sentiment_distribution.positive)}%
                  </div>
                  <div className="text-xs text-gray-500">Positive</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-semibold">
                    {Math.round(selectedTopic.sentiment_distribution.neutral)}%
                  </div>
                  <div className="text-xs text-gray-500">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-semibold">
                    {Math.round(selectedTopic.sentiment_distribution.negative)}%
                  </div>
                  <div className="text-xs text-gray-500">Negative</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Topics List */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Trending Topics</h3>
        <div className="space-y-2">
          {topics.slice(0, 3).map((topic, index) => {
            const SentimentIcon = getSentimentIcon(topic.avg_sentiment);
            
            return (
              <motion.div
                key={topic.topic_id}
                className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{topic.keywords[0]}</div>
                    <div className="text-xs text-gray-400">
                      {topic.keywords.slice(1, 3).join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <SentimentIcon className={`w-4 h-4 ${getSentimentColor(topic.avg_sentiment)}`} />
                  <span className="text-sm text-gray-400">{topic.doc_count}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TopicClusteringWidget;
