import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bell, X, TrendingUp, TrendingDown, Users, Zap } from 'lucide-react';

const RealTimeAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    // Generate random alerts
    const alertTypes = [
      {
        type: 'sentiment_spike',
        title: 'Sentiment Spike Detected',
        message: 'Positive sentiment increased by 23% in the last hour',
        severity: 'info',
        icon: TrendingUp,
        color: 'text-green-400',
        bg: 'from-green-500/20 to-emerald-500/20'
      },
      {
        type: 'sentiment_drop',
        title: 'Sentiment Drop Alert',
        message: 'Negative sentiment spike detected on Twitter',
        severity: 'warning',
        icon: TrendingDown,
        color: 'text-red-400',
        bg: 'from-red-500/20 to-orange-500/20'
      },
      {
        type: 'volume_surge',
        title: 'Mention Volume Surge',
        message: 'Mention volume 3x higher than normal',
        severity: 'info',
        icon: Users,
        color: 'text-blue-400',
        bg: 'from-blue-500/20 to-cyan-500/20'
      },
      {
        type: 'viral_content',
        title: 'Viral Content Detected',
        message: 'Post gaining rapid traction - 10k+ engagements',
        severity: 'critical',
        icon: Zap,
        color: 'text-yellow-400',
        bg: 'from-yellow-500/20 to-orange-500/20'
      }
    ];

    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new alert
        const alertTemplate = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          ...alertTemplate,
          id: Date.now(),
          timestamp: new Date(),
        };
        
        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Keep last 10
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500/50';
      case 'warning': return 'border-yellow-500/50';
      case 'info': return 'border-blue-500/50';
      default: return 'border-gray-500/50';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl h-96"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Bell className="w-6 h-6 text-primary" />
          <span>Real-Time Alerts</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">{visibleAlerts.length} active</span>
        </div>
      </div>

      <div className="h-80 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <AnimatePresence>
          {visibleAlerts.map((alert, index) => {
            const IconComponent = alert.icon;
            return (
              <motion.div
                key={alert.id}
                className={`bg-gradient-to-r ${alert.bg} border ${getSeverityColor(alert.severity)} p-4 rounded-lg`}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <IconComponent className={`w-5 h-5 ${alert.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {alert.title}
                      </h3>
                      <p className="text-sm text-gray-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>{alert.timestamp.toLocaleTimeString()}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                          alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {visibleAlerts.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No active alerts</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RealTimeAlerts;
