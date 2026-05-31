import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SentimentCausalityAnalysis = () => {
  const [causalityData, setCausalityData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    fetchCausalityData();
    const interval = setInterval(fetchCausalityData, 60000);
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

  const fetchCausalityData = async () => {
    try {
      // Mock causality analysis data
      const mockData = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          event: 'CEO Tweet about Sustainability',
          sentiment_before: 65,
          sentiment_after: 78,
          impact_score: 0.85,
          confidence: 0.92,
          explanation: 'CEO\'s tweet about new sustainability initiatives caused a 13-point sentiment increase. The mention of carbon neutrality by 2025 resonated strongly with environmentally conscious consumers.',
          related_keywords: ['sustainability', 'carbon neutral', 'green energy', 'environment'],
          source_platforms: ['Twitter', 'LinkedIn', 'Reddit'],
          affected_demographics: ['Gen Z', 'Millennials', 'Urban professionals']
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 14400000), // 4 hours ago
          event: 'Product Recall Announcement',
          sentiment_before: 72,
          sentiment_after: 58,
          impact_score: -0.73,
          confidence: 0.88,
          explanation: 'Product recall announcement led to a 14-point sentiment drop. However, transparent communication and immediate action plan helped limit the damage. Recovery expected within 48-72 hours.',
          related_keywords: ['recall', 'safety', 'defect', 'replacement'],
          source_platforms: ['News', 'Twitter', 'Facebook'],
          affected_demographics: ['Existing customers', 'Safety-conscious consumers']
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 21600000), // 6 hours ago
          event: 'Competitor Price Cut',
          sentiment_before: 68,
          sentiment_after: 64,
          impact_score: -0.35,
          confidence: 0.76,
          explanation: 'Competitor\'s 15% price reduction caused minor sentiment decline as consumers questioned our pricing strategy. Opportunity for competitive response or value communication.',
          related_keywords: ['price', 'expensive', 'competitor', 'value'],
          source_platforms: ['Reddit', 'Twitter', 'Forums'],
          affected_demographics: ['Price-sensitive buyers', 'Comparison shoppers']
        }
      ];

      setCausalityData(mockData);
      setLoading(false);
      
      // Generate AI explanation for the most recent event
      if (mockData.length > 0) {
        generateAIExplanation(mockData[0]);
      }
    } catch (error) {
      console.error('Error fetching causality data:', error);
      setLoading(false);
    }
  };

  const generateAIExplanation = async (event) => {
    // Simulate AI explanation generation
    const explanations = [
      `Our AI detected a ${Math.abs(event.impact_score * 100).toFixed(1)}% sentiment shift following "${event.event}". The causality model identified ${event.related_keywords.length} key trigger words and analyzed ${event.source_platforms.length} platforms.`,
      `Advanced NLP analysis reveals this event had a ${event.confidence * 100}% confidence correlation with sentiment changes. The impact propagated across ${event.affected_demographics.length} demographic segments.`,
      `Temporal analysis shows the sentiment shift occurred within 15 minutes of the event, indicating high causal relationship. Recovery patterns suggest ${event.impact_score > 0 ? 'sustained positive impact' : 'temporary negative impact'}.`
    ];
    
    setAiExplanation(explanations[Math.floor(Math.random() * explanations.length)]);
  };

  const chartData = {
    labels: causalityData.map(item => 
      new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ),
    datasets: [
      {
        label: 'Sentiment Before',
        data: causalityData.map(item => item.sentiment_before),
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
      },
      {
        label: 'Sentiment After',
        data: causalityData.map(item => item.sentiment_after),
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af' },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const dataIndex = context.dataIndex;
            const event = causalityData[dataIndex];
            return event ? `Event: ${event.event}` : '';
          },
        },
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
          <div className="h-64 bg-gray-700 rounded mb-4"></div>
          <div className="h-20 bg-gray-700 rounded"></div>
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
          <Brain className="w-6 h-6 text-primary" />
          <span>Sentiment Causality Analysis</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">AI Active</span>
        </div>
      </div>

      {/* AI Explanation Card */}
      <motion.div
        className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 p-4 rounded-lg mb-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start space-x-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">AI Insight</h3>
            <p className="text-sm text-gray-300">{aiExplanation}</p>
          </div>
        </div>
      </motion.div>

      {/* Causality Chart */}
      <div className="h-64 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Event Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Causal Events</h3>
        
        {causalityData.map((event, index) => {
          const isPositive = event.impact_score > 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;
          const trendColor = isPositive ? 'text-green-400' : 'text-red-400';
          
          return (
            <motion.div
              key={event.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedEvent?.id === event.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <TrendIcon className={`w-5 h-5 ${trendColor}`} />
                  <div>
                    <h4 className="font-semibold text-white">{event.event}</h4>
                    <p className="text-sm text-gray-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${trendColor}`}>
                    {isPositive ? '+' : ''}{(event.impact_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {(event.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {selectedEvent?.id === event.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-700"
                  >
                    <p className="text-sm text-gray-300 mb-3">{event.explanation}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <h5 className="font-semibold text-gray-400 mb-1">Keywords</h5>
                        <div className="flex flex-wrap gap-1">
                          {event.related_keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-400 mb-1">Platforms</h5>
                        <div className="space-y-1">
                          {event.source_platforms.map((platform, i) => (
                            <div key={i} className="text-gray-300">{platform}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-400 mb-1">Demographics</h5>
                        <div className="space-y-1">
                          {event.affected_demographics.map((demo, i) => (
                            <div key={i} className="text-gray-300">{demo}</div>
                          ))}
                        </div>
                      </div>
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

export default SentimentCausalityAnalysis;
