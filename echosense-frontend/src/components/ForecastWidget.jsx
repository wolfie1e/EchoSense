import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudSun, CloudRain, Sun, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

const ForecastWidget = () => {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const response = await fetch('/api/forecast');
      const data = await response.json();
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Fallback data
      setForecast({
        sentiment: 'positive',
        confidence: 'High',
        summary: 'A strong positive trend is expected over the next 48 hours.',
        trend_direction: 'improving',
        confidence_score: 0.85
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
      >
        <h2 className="text-xl font-bold text-white mb-4">48-Hour Forecast</h2>
        <div className="animate-pulse">
          <div className="h-16 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        </div>
      </motion.div>
    );
  }

  const getIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return Sun;
      case 'negative': return CloudRain;
      default: return CloudSun;
    }
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const Icon = getIcon(forecast.sentiment);
  const TrendIcon = getTrendIcon(forecast.trend_direction);

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">48-Hour Forecast</h2>
        <TrendIcon className={`w-5 h-5 ${getSentimentColor(forecast.sentiment)}`} />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <Icon className={`w-16 h-16 ${getSentimentColor(forecast.sentiment)}`} />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <p className={`text-lg font-semibold ${getSentimentColor(forecast.sentiment)}`}>
              {forecast.sentiment.charAt(0).toUpperCase() + forecast.sentiment.slice(1)}
            </p>
            <span className="text-sm text-gray-400">Sentiment</span>
          </div>
          <p className={`text-sm font-medium ${getConfidenceColor(forecast.confidence_score)}`}>
            {forecast.confidence} Confidence ({Math.round(forecast.confidence_score * 100)}%)
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        {forecast.summary}
      </p>

      {/* Confidence Indicator */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Confidence Level</span>
          <span>{Math.round(forecast.confidence_score * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getConfidenceColor(forecast.confidence_score).replace('text-', 'bg-')}`}
            initial={{ width: 0 }}
            animate={{ width: `${forecast.confidence_score * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <span className="text-gray-500">Trend:</span>
          <span className={`font-medium ${getSentimentColor(forecast.sentiment)}`}>
            {forecast.trend_direction}
          </span>
        </div>
        {forecast.confidence_score < 0.6 && (
          <div className="flex items-center space-x-1 text-yellow-400">
            <AlertCircle className="w-3 h-3" />
            <span>Low Confidence</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ForecastWidget;
