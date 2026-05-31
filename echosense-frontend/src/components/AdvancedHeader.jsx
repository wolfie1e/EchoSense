import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Menu,
  X,
  Bell,
  Settings,
  User,
  Search,
  Activity,
  Globe,
  Zap,
  BarChart3,
  TrendingUp,
  Eye,
  Brain
} from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

const AdvancedHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // GSAP header entrance animation
    if (headerRef.current && logoRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      )
      .fromTo(logoRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" },
        "-=0.5"
      );
    }
  }, []);

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/', description: 'Overview & Widgets' },
    { name: 'Analytics', icon: TrendingUp, path: '/analytics', description: 'Deep-dive Analysis' },
    { name: 'Global View', icon: Globe, path: '/global-view', description: 'Geographic Insights' },
    { name: 'Real-time', icon: Activity, path: '/real-time', description: 'Live Monitoring' },
    { name: 'Insights', icon: Brain, path: '/insights', description: 'AI Recommendations' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <motion.header
      ref={headerRef}
      className="sticky top-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-gray-800/50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo & Brand */}
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={logoRef}
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-blue-500 rounded-xl flex items-center justify-center"
              whileHover={{ 
                rotate: 360,
                boxShadow: "0 0 30px rgba(138, 43, 226, 0.5)"
              }}
              transition={{ duration: 0.6 }}
            >
              <Activity className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                EchoSense
              </h1>
              <p className="text-xs text-gray-400">Brand Intelligence Platform</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.name}</span>

                  {/* Tooltip */}
                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50"
                    initial={{ opacity: 0, y: -5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    {item.description}
                  </motion.div>
                </motion.button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <motion.div 
            className="hidden md:flex items-center"
            initial={{ width: 200 }}
            animate={{ width: isSearchFocused ? 300 : 200 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentions, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </form>
          </motion.div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Notifications */}
            <motion.button
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {notifications}
                </motion.span>
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              className="hidden md:flex p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            {/* User Profile */}
            <motion.button
              className="hidden md:flex items-center space-x-2 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">Admin</span>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-gray-800/50"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="py-4 space-y-2">
                {/* Mobile Search */}
                <div className="md:hidden mb-4">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search mentions, topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                  </form>
                </div>

                {/* Mobile Navigation */}
                {navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.name}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          className="w-2 h-2 bg-primary rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  );
                })}

                {/* Mobile User Actions */}
                <div className="pt-4 border-t border-gray-800/50 space-y-2">
                  <motion.button
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </motion.button>
                  
                  <motion.button
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Profile</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default AdvancedHeader;
