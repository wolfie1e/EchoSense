import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import ThreeDBackground from '../components/ThreeDBackground';
import AIRecommendationEngine from '../components/AIRecommendationEngine';
import ExecutiveBriefGenerator from '../components/ExecutiveBriefGenerator';
import StrategicInsightsDashboard from '../components/StrategicInsightsDashboard';
import ROIImpactCalculator from '../components/ROIImpactCalculator';
import OutreachManagementTools from '../components/OutreachManagementTools';
import { Brain, FileText, Target, DollarSign, MessageSquare } from 'lucide-react';

const Insights = () => {
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
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                AI Insights
              </h1>
              <p className="text-gray-400">AI-generated recommendations and strategic insights</p>
            </div>
          </motion.div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-primary" />
              <span>AI-Powered Recommendations</span>
            </h2>
            <p className="text-gray-400">Intelligent insights and strategic recommendations</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
          >
            <AIRecommendationEngine />
          </motion.div>
        </motion.div>

        {/* Executive Tools */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <span>Executive Intelligence</span>
            </h2>
            <p className="text-gray-400">C-suite reports and strategic analysis</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <ExecutiveBriefGenerator />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <StrategicInsightsDashboard />
            </motion.div>
          </div>
        </motion.div>

        {/* ROI & Outreach */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <span>Business Impact & Outreach</span>
            </h2>
            <p className="text-gray-400">ROI analysis and engagement management</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <ROIImpactCalculator />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <OutreachManagementTools />
            </motion.div>
          </div>
        </motion.div>

        {/* AI Insights Summary */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Target className="w-6 h-6 text-primary" />
              <span>Key Performance Indicators</span>
            </h2>
            <p className="text-gray-400">Real-time business intelligence metrics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'AI Accuracy', 
                value: '94.7%', 
                icon: Brain, 
                color: 'from-purple-500 to-pink-500',
                change: '+2.3% this week'
              },
              { 
                title: 'Response Rate', 
                value: '87%', 
                icon: MessageSquare, 
                color: 'from-blue-500 to-cyan-500',
                change: '+15% improvement'
              },
              { 
                title: 'ROI Impact', 
                value: '+$2.4M', 
                icon: DollarSign, 
                color: 'from-green-500 to-emerald-500',
                change: 'Quarterly projection'
              },
              { 
                title: 'Insights Generated', 
                value: '1,247', 
                icon: Target, 
                color: 'from-orange-500 to-red-500',
                change: '156 this week'
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

        {/* Footer Spacer */}
        <div className="h-8 md:h-16"></div>
      </motion.div>
    </>
  );
};

export default Insights;
