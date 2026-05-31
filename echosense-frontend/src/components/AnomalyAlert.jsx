import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingDown, TrendingUp, Activity, Shield, Bell } from 'lucide-react';

const AnomalyAlert = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [dismissed]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();

      // Filter out dismissed alerts
      const activeAlerts = data.filter(alert => !dismissed.has(alert.id));
      setAlerts(activeAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Fallback to mock data
      const mockAnomalies = [
        {
          id: 'anomaly-1',
          type: 'sentiment_spike',
          severity: 'high',
          title: 'Negative Sentiment Spike Detected',
          description: 'Unusual increase in negative mentions detected in the last 2 hours',
          timestamp: new Date(),
          value: -15.2,
          threshold: -10.0,
          source: 'Reddit',
          icon: TrendingDown
        },
        {
          id: 'anomaly-2',
          type: 'volume_surge',
          severity: 'medium',
          title: 'Mention Volume Surge',
          description: 'Brand mentions increased by 340% compared to average',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          value: 340,
          threshold: 200,
          source: 'All Sources',
          icon: Activity
        }
      ];

      const activeAlerts = mockAnomalies.filter(alert => !dismissed.has(alert.id));
      setAlerts(activeAlerts);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      // Acknowledge alert on backend
      await fetch(`/api/alerts/${alertId}/acknowledge`, { method: 'POST' });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }

    // Remove from local state
    setDismissed(prev => new Set([...prev, alertId]));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getSeverityTextColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      <AnimatePresence>
        {alerts.map((alert) => {
          const IconComponent = alert.icon;
          
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                relative p-4 rounded-lg border backdrop-blur-lg
                ${getSeverityColor(alert.severity)}
                shadow-lg
              `}
            >
              {/* Pulsing indicator for high severity */}
              {alert.severity === 'high' && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}

              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                  <IconComponent className={`w-4 h-4 ${getSeverityTextColor(alert.severity)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-semibold ${getSeverityTextColor(alert.severity)}`}>
                      {alert.title}
                    </h4>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-300 mb-2 leading-relaxed">
                    {alert.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">Source:</span>
                      <span className="text-white font-medium">{alert.source}</span>
                    </div>
                    <span className="text-gray-500">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </div>
                  
                  {/* Value indicator */}
                  <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {alert.type === 'sentiment_spike' ? 'Sentiment Change:' : 'Volume Change:'}
                      </span>
                      <span className={`font-mono font-bold ${getSeverityTextColor(alert.severity)}`}>
                        {alert.type === 'sentiment_spike' ? 
                          `${alert.value > 0 ? '+' : ''}${alert.value}%` :
                          `+${alert.value}%`
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Threshold: {alert.type === 'sentiment_spike' ? 
                        `${alert.threshold}%` : 
                        `+${alert.threshold}%`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AnomalyAlert;
