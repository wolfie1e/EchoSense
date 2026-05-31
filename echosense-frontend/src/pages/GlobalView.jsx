import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import ThreeDBackground from '../components/ThreeDBackground';
import SentimentGlobe from '../components/SentimentGlobe';
import GeoSentimentHeatmap from '../components/GeoSentimentHeatmap';
import CompetitiveIntelligence from '../components/CompetitiveIntelligence';
import InfluencerImpactTracker from '../components/InfluencerImpactTracker';
import EmergingTrendRadar from '../components/EmergingTrendRadar';
import { Globe, TrendingUp, Users, Radar, Map } from 'lucide-react';

const GlobalView = () => {
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
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Global View
              </h1>
              <p className="text-gray-400">Geographic insights and demographic analysis</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Global Visualizations */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Map className="w-6 h-6 text-primary" />
              <span>Global Sentiment Distribution</span>
            </h2>
            <p className="text-gray-400">Interactive 3D visualization of worldwide brand perception</p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
            >
              <SentimentGlobe />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
            >
              <GeoSentimentHeatmap />
            </motion.div>
          </div>
        </motion.div>

        {/* Competitive Intelligence */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <span>Market Intelligence</span>
            </h2>
            <p className="text-gray-400">Competitive analysis and market positioning insights</p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.3 }}
          >
            <CompetitiveIntelligence />
          </motion.div>
        </motion.div>

        {/* Trend Analysis */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Radar className="w-6 h-6 text-primary" />
              <span>Trend & Influence Analysis</span>
            </h2>
            <p className="text-gray-400">Emerging trends and influencer impact tracking</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <EmergingTrendRadar />
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <InfluencerImpactTracker />
            </motion.div>
          </div>
        </motion.div>

        {/* Global Stats Overview */}
        <motion.div variants={itemVariants}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary" />
              <span>Global Metrics</span>
            </h2>
            <p className="text-gray-400">Worldwide engagement and reach statistics</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: 'Global Reach', 
                value: '127 Countries', 
                icon: Globe, 
                color: 'from-blue-500 to-cyan-500',
                change: '+12 this month'
              },
              { 
                title: 'Total Mentions', 
                value: '2.4M', 
                icon: TrendingUp, 
                color: 'from-green-500 to-emerald-500',
                change: '+18% vs last month'
              },
              { 
                title: 'Active Languages', 
                value: '23 Languages', 
                icon: Users, 
                color: 'from-purple-500 to-pink-500',
                change: '+3 new languages'
              },
              { 
                title: 'Trending Topics', 
                value: '156 Active', 
                icon: Radar, 
                color: 'from-orange-500 to-red-500',
                change: '+24 emerging trends'
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

export default GlobalView;
