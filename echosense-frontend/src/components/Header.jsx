import React from 'react';
import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const Header = () => {
  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 bg-dark/30 backdrop-blur-xl border-b border-gray-800/50 px-6 rounded-b-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Wifi className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">EchoSense</h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-300">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
