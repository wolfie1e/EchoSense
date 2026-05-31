import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import StatsOverview from '../components/StatsOverview';
import SentimentFeed from '../components/SentimentFeed';
import TrendChart from '../components/TrendChart';
import ForecastWidget from '../components/ForecastWidget';
import AIControlCenter from '../components/AIControlCenter';
import BrandHealthScore from '../components/BrandHealthScore';
import AnomalyAlert from '../components/AnomalyAlert';
import EmotionDashboard from '../components/EmotionDashboard';
import TopicClusteringWidget from '../components/TopicClusteringWidget';
import SentimentGlobe from '../components/SentimentGlobe';
import SentimentHeartbeat from '../components/SentimentHeartbeat';
import SentimentSpeedometer from '../components/SentimentSpeedometer';
import ConversationTreeVisualizer from '../components/ConversationTreeVisualizer';
import AspectBasedSentiment from '../components/AspectBasedSentiment';
import CompetitiveIntelligence from '../components/CompetitiveIntelligence';
import GeoSentimentHeatmap from '../components/GeoSentimentHeatmap';
import ThreeDBackground from '../components/ThreeDBackground';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // GSAP entrance animations
    if (dashboardRef.current && isLoaded) {
      gsap.fromTo(
        dashboardRef.current.children,
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
  }, [isLoaded]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsLoaded(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <>
      {/* 3D Background */}
      <ThreeDBackground />

      {/* Floating Alerts */}
      <AnomalyAlert />

      <motion.div
        ref={dashboardRef}
        className="relative z-10 max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Stats Overview */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
        >
          <StatsOverview />
        </motion.div>

        {/* Primary Metrics Row - Brand Health & Speedometer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <BrandHealthScore stats={stats} />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <SentimentSpeedometer />
          </motion.div>
          <motion.div
            className="lg:col-span-2 xl:col-span-1"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <SentimentHeartbeat />
          </motion.div>
        </div>

        {/* Analytics Dashboard Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            className="lg:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <TrendChart />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <ForecastWidget />
          </motion.div>
        </div>

        {/* Advanced Intelligence Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <EmotionDashboard />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <AspectBasedSentiment />
          </motion.div>
        </div>

        {/* Topic & Conversation Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <TopicClusteringWidget />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <ConversationTreeVisualizer />
          </motion.div>
        </div>

        {/* Competitive Intelligence */}
        <motion.div
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
        >
          <CompetitiveIntelligence />
        </motion.div>

        {/* Global Visualizations */}
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

        {/* Data Feed & AI Control */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            className="lg:col-span-2"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <SentimentFeed />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <AIControlCenter />
          </motion.div>
        </div>

        {/* Footer Spacer for Mobile */}
        <div className="h-8 md:h-16"></div>
      </motion.div>
    </>
  );
};

export default Dashboard;
