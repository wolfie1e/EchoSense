import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import ThreeDBackground from '../components/ThreeDBackground';
import SentimentHeartbeat from '../components/SentimentHeartbeat';
import LiveSentimentStream from '../components/LiveSentimentStream';
import SentimentTimelapse from '../components/SentimentTimelapse';
import RealTimeAlerts from '../components/RealTimeAlerts';
import LiveEngagementMetrics from '../components/LiveEngagementMetrics';
import { Activity, Zap, Play, AlertTriangle, BarChart3 } from 'lucide-react';

const RealTime = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
    
    // GSAP entrance animations
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { y: 100, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1.2, 
          stagger: 0.15, 
          ease: "power3.out" 
        }
      );
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.215, 0.61, 0.355, 1],
      },
    },
  };

  return (
    <>
      {/* 3D Background */}
      <ThreeDBackground />
      
      <motion.div
        ref={pageRef}
        className="relative z-10 max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Page Header */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center space-x-3 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Real-Time Monitoring
              </h1>
              <p className="text-gray-400">Live sentiment tracking and streaming analytics</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Live Monitoring Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-primary" />
              <span>Live Sentiment Pulse</span>
            </h2>
            <p className="text-gray-400">Real-time heartbeat visualization of brand sentiment</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <SentimentHeartbeat />
          </motion.div>
        </motion.div>

        {/* Live Stream & Alerts */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-primary" />
              <span>Live Data Stream</span>
            </h2>
            <p className="text-gray-400">Real-time mention feed and alert notifications</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <motion.div
              className="lg:col-span-2"
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
            >
              <LiveSentimentStream />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <RealTimeAlerts />
            </motion.div>
          </div>
        </motion.div>

        {/* Timelapse & Engagement */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Play className="w-6 h-6 text-primary" />
              <span>Sentiment Evolution</span>
            </h2>
            <p className="text-gray-400">Interactive timelapse and engagement analytics</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <SentimentTimelapse />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <LiveEngagementMetrics />
            </motion.div>
          </div>
        </motion.div>

        {/* Real-Time Stats */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <span>Live Performance Metrics</span>
            </h2>
            <p className="text-gray-400">Current system performance and data flow statistics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Mentions/Min', 
                value: '47', 
                icon: Activity, 
                color: 'from-green-500 to-emerald-500',
                change: '+12% vs avg'
              },
              { 
                title: 'Processing Speed', 
                value: '1.2s', 
                icon: Zap, 
                color: 'from-blue-500 to-cyan-500',
                change: '0.3s faster'
              },
              { 
                title: 'Active Alerts', 
                value: '3', 
                icon: AlertTriangle, 
                color: 'from-yellow-500 to-orange-500',
                change: '2 new alerts'
              },
              { 
                title: 'Data Sources', 
                value: '23', 
                icon: BarChart3, 
                color: 'from-purple-500 to-pink-500',
                change: 'All connected'
              },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(138, 43, 226, 0.3)"
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{stat.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-6 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                  <motion.div
                    className="w-3 h-3 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span>System Status: Operational</span>
                </h3>
                <p className="text-gray-400">All monitoring systems active • Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {[
                { service: 'Data Ingestion', status: 'Active', color: 'text-green-400' },
                { service: 'Sentiment Analysis', status: 'Active', color: 'text-green-400' },
                { service: 'Alert System', status: 'Active', color: 'text-green-400' },
                { service: 'API Gateway', status: 'Active', color: 'text-green-400' },
              ].map((service, index) => (
                <div key={service.service} className="flex items-center justify-between">
                  <span className="text-gray-300">{service.service}</span>
                  <span className={service.color}>{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer Spacer */}
        <div className="h-8 md:h-16"></div>
      </motion.div>
    </>
  );
};

export default RealTime;
