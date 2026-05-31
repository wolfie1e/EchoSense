import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import ThreeDBackground from '../components/ThreeDBackground';
import SentimentCausalityAnalysis from '../components/SentimentCausalityAnalysis';
import MarketScenarioSimulator from '../components/MarketScenarioSimulator';
import ChurnRiskPredictor from '../components/ChurnRiskPredictor';
import MultimodalAnalysis from '../components/MultimodalAnalysis';
import ComplianceDashboard from '../components/ComplianceDashboard';
import DataLineageTracker from '../components/DataLineageTracker';
import { TrendingUp, Brain, Target, Shield, Database, Zap } from 'lucide-react';

const Analytics = () => {
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
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Advanced Analytics
              </h1>
              <p className="text-gray-400">Deep-dive analytical tools and AI-powered insights</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Predictive Intelligence Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary" />
              <span>Predictive & Prescriptive Intelligence</span>
            </h2>
            <p className="text-gray-400">AI-powered causality analysis and market simulation</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <SentimentCausalityAnalysis />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <MarketScenarioSimulator />
            </motion.div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <ChurnRiskPredictor />
          </motion.div>
        </motion.div>

        {/* Multimodal Analysis Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Target className="w-6 h-6 text-primary" />
              <span>Multimodal & Contextual Analysis</span>
            </h2>
            <p className="text-gray-400">Advanced content analysis across images, videos, and conversations</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <MultimodalAnalysis />
          </motion.div>
        </motion.div>

        {/* Enterprise Compliance Section */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <span>Enterprise-Grade Data & Compliance</span>
            </h2>
            <p className="text-gray-400">Security, compliance, and data governance tools</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <ComplianceDashboard />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <DataLineageTracker />
            </motion.div>
          </div>
        </motion.div>

        {/* Advanced Analytics Tools */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Database className="w-6 h-6 text-primary" />
              <span>Advanced Analytics Tools</span>
            </h2>
            <p className="text-gray-400">Professional-grade analysis and reporting tools</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats Cards */}
            {[
              { title: 'Causality Models', value: '12 Active', icon: Brain, color: 'from-purple-500 to-pink-500' },
              { title: 'Simulation Scenarios', value: '47 Tested', icon: Zap, color: 'from-blue-500 to-cyan-500' },
              { title: 'Risk Predictions', value: '98.7% Accuracy', icon: Target, color: 'from-green-500 to-emerald-500' },
              { title: 'Compliance Score', value: '100%', icon: Shield, color: 'from-orange-500 to-red-500' },
              { title: 'Data Sources', value: '23 Connected', icon: Database, color: 'from-indigo-500 to-purple-500' },
              { title: 'Processing Speed', value: '2.3s Avg', icon: TrendingUp, color: 'from-teal-500 to-blue-500' },
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
                  <p className="text-xs text-gray-400">Last updated: {new Date().toLocaleTimeString()}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer Spacer */}
        <div className="h-8 md:h-16"></div>
      </motion.div>
    </>
  );
};

export default Analytics;
