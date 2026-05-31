import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  Image, 
  Video, 
  MessageSquare, 
  Eye, 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Play,
  Pause,
  Volume2,
  FileText,
  Hash,
  Users
} from 'lucide-react';

const MultimodalAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);
  const [activeTab, setActiveTab] = useState('images');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchMultimodalData();
    const interval = setInterval(fetchMultimodalData, 90000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading]);

  const fetchMultimodalData = async () => {
    try {
      // Mock multimodal analysis data
      const mockData = {
        image_analysis: [
          {
            id: 'img_001',
            url: '/api/placeholder/300/200',
            platform: 'Instagram',
            timestamp: new Date(Date.now() - 3600000),
            visual_sentiment: 0.72,
            detected_objects: ['product', 'person', 'logo'],
            text_overlay: 'Love this new design!',
            engagement_score: 0.85,
            brand_visibility: 0.91,
            color_analysis: {
              dominant_colors: ['#8A2BE2', '#4A90E2', '#22c55e'],
              brand_alignment: 0.88
            }
          },
          {
            id: 'img_002',
            url: '/api/placeholder/300/200',
            platform: 'Twitter',
            timestamp: new Date(Date.now() - 7200000),
            visual_sentiment: -0.34,
            detected_objects: ['meme', 'text', 'logo'],
            text_overlay: 'When the product fails again...',
            engagement_score: 0.67,
            brand_visibility: 0.45,
            color_analysis: {
              dominant_colors: ['#ef4444', '#f59e0b', '#6b7280'],
              brand_alignment: 0.23
            }
          }
        ],
        video_analysis: [
          {
            id: 'vid_001',
            platform: 'YouTube',
            title: 'Product Review: Is it worth it?',
            duration: 180,
            timestamp: new Date(Date.now() - 14400000),
            audio_sentiment: 0.45,
            visual_sentiment: 0.62,
            transcript_highlights: [
              'The build quality is impressive',
              'Price point is a bit high',
              'Would recommend to others'
            ],
            engagement_metrics: {
              views: 12500,
              likes: 890,
              comments: 156
            },
            brand_mentions: 23,
            sentiment_timeline: [0.2, 0.4, 0.6, 0.5, 0.7, 0.4]
          }
        ],
        conversation_threads: [
          {
            id: 'thread_001',
            platform: 'Reddit',
            title: 'Discussion about latest update',
            replies: 47,
            timestamp: new Date(Date.now() - 21600000),
            sentiment_evolution: [0.1, -0.2, 0.3, 0.5, 0.2, -0.1, 0.4],
            key_topics: ['performance', 'bugs', 'features', 'support'],
            influence_score: 0.78,
            viral_potential: 0.34
          }
        ],
        content_summary: {
          total_analyzed: 156,
          image_content: 89,
          video_content: 23,
          conversation_threads: 44,
          average_sentiment: 0.42,
          brand_visibility_score: 0.67
        }
      };

      setAnalysisData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching multimodal data:', error);
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.2) return 'text-green-400';
    if (sentiment < -0.2) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.2) return TrendingUp;
    if (sentiment < -0.2) return TrendingDown;
    return MessageSquare;
  };

  const tabs = [
    { id: 'images', name: 'Image Analysis', icon: Image, count: analysisData?.image_analysis.length || 0 },
    { id: 'videos', name: 'Video Analysis', icon: Video, count: analysisData?.video_analysis.length || 0 },
    { id: 'conversations', name: 'Conversations', icon: MessageSquare, count: analysisData?.conversation_threads.length || 0 }
  ];

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="flex space-x-4 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-gray-700 rounded w-24"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
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
          <Eye className="w-6 h-6 text-primary" />
          <span>Multimodal Content Analysis</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs text-gray-400">CLIP + BLIP Models</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Analyzed', 
            value: analysisData.content_summary.total_analyzed, 
            icon: FileText, 
            color: 'text-blue-400' 
          },
          { 
            label: 'Avg Sentiment', 
            value: `${(analysisData.content_summary.average_sentiment * 100).toFixed(0)}%`, 
            icon: getSentimentIcon(analysisData.content_summary.average_sentiment), 
            color: getSentimentColor(analysisData.content_summary.average_sentiment) 
          },
          { 
            label: 'Brand Visibility', 
            value: `${(analysisData.content_summary.brand_visibility_score * 100).toFixed(0)}%`, 
            icon: Eye, 
            color: 'text-purple-400' 
          },
          { 
            label: 'Engagement', 
            value: '87%', 
            icon: Users, 
            color: 'text-green-400' 
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-gray-900/50 p-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-900/50 p-1 rounded-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.name}</span>
              <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Content Sections */}
      <AnimatePresence mode="wait">
        {activeTab === 'images' && (
          <motion.div
            key="images"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysisData.image_analysis.map((image, index) => {
                const SentimentIcon = getSentimentIcon(image.visual_sentiment);
                return (
                  <motion.div
                    key={image.id}
                    className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-white">{image.platform}</span>
                      <div className="flex items-center space-x-2">
                        <SentimentIcon className={`w-4 h-4 ${getSentimentColor(image.visual_sentiment)}`} />
                        <span className={`text-sm font-semibold ${getSentimentColor(image.visual_sentiment)}`}>
                          {(image.visual_sentiment * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-3 mb-3">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Text Overlay:</span>
                        <p className="text-white italic">"{image.text_overlay}"</p>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Brand Visibility:</span>
                        <span className="text-white">{(image.brand_visibility * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Engagement:</span>
                        <span className="text-white">{(image.engagement_score * 100).toFixed(0)}%</span>
                      </div>
                      
                      <div>
                        <span className="text-gray-400">Detected Objects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {image.detected_objects.map((obj, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">
                              {obj}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {analysisData.video_analysis.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="bg-gray-900/50 p-6 rounded-lg border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                      <p className="text-sm text-gray-400">{video.platform} • {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getSentimentColor(video.audio_sentiment)}`}>
                          {(video.audio_sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Audio</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getSentimentColor(video.visual_sentiment)}`}>
                          {(video.visual_sentiment * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Visual</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Transcript Highlights</h4>
                      <div className="space-y-2">
                        {video.transcript_highlights.map((highlight, i) => (
                          <div key={i} className="text-sm text-gray-300 italic">
                            "• {highlight}"
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Engagement Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-400">
                            {video.engagement_metrics.views.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-400">
                            {video.engagement_metrics.likes.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Likes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-400">
                            {video.engagement_metrics.comments.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">Comments</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'conversations' && (
          <motion.div
            key="conversations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {analysisData.conversation_threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  className="bg-gray-900/50 p-6 rounded-lg border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{thread.title}</h3>
                      <p className="text-sm text-gray-400">{thread.platform} • {thread.replies} replies</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {(thread.influence_score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Influence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">
                          {(thread.viral_potential * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-400">Viral Potential</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {thread.key_topics.map((topic, i) => (
                          <span key={i} className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                            <Hash className="w-3 h-3 inline mr-1" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Sentiment Evolution</h4>
                      <div className="flex items-center space-x-1">
                        {thread.sentiment_evolution.map((sentiment, i) => (
                          <div
                            key={i}
                            className={`w-4 h-8 rounded-sm ${
                              sentiment > 0.2 ? 'bg-green-400' :
                              sentiment < -0.2 ? 'bg-red-400' : 'bg-yellow-400'
                            }`}
                            style={{ opacity: 0.3 + Math.abs(sentiment) * 0.7 }}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Timeline progression</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MultimodalAnalysis;
