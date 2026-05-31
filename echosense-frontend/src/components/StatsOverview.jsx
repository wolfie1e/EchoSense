import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Hash } from 'lucide-react';
import { gsap } from 'gsap';
import { mockStats } from '../services/mockApi';

const StatCard = ({ item, index }) => {
  const valueRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      valueRef.current,
      { innerText: 0 },
      {
        innerText: item.value,
        duration: 1.5,
        ease: 'power2.out',
        snap: { innerText: 1 },
        delay: index * 0.1,
      }
    );
  }, [item.value, index]);

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-gray-400">{item.label}</span>
        <item.icon className={`w-5 h-5 ${item.color}`} />
      </div>
      <div className="mt-2">
        <span ref={valueRef} className="text-4xl font-bold text-white">
          {item.value}
        </span>
        <span className="text-2xl font-semibold text-gray-500">{item.unit}</span>
      </div>
    </motion.div>
  );
};

const StatsOverview = () => {
  const stats = [
    { label: 'Total Mentions', value: mockStats.totalMentions, unit: '', icon: Hash, color: 'text-gray-400' },
    { label: 'Positive Sentiment', value: mockStats.positive, unit: '%', icon: TrendingUp, color: 'text-green-500' },
    { label: 'Negative Sentiment', value: mockStats.negative, unit: '%', icon: TrendingDown, color: 'text-red-500' },
    { label: 'Neutral Sentiment', value: mockStats.neutral, unit: '%', icon: Minus, color: 'text-yellow-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((item, index) => (
        <StatCard key={index} item={item} index={index} />
      ))}
    </div>
  );
};

export default StatsOverview;
