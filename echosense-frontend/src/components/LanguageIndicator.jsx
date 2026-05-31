import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const LanguageIndicator = ({ language, className = "" }) => {
  const getLanguageInfo = (lang) => {
    const languages = {
      'en': { name: 'English', flag: '🇺🇸', color: 'text-blue-400' },
      'es': { name: 'Spanish', flag: '🇪🇸', color: 'text-yellow-400' },
      'fr': { name: 'French', flag: '🇫🇷', color: 'text-blue-300' },
      'de': { name: 'German', flag: '🇩🇪', color: 'text-red-400' },
      'pt': { name: 'Portuguese', flag: '🇵🇹', color: 'text-green-400' },
      'it': { name: 'Italian', flag: '🇮🇹', color: 'text-green-300' },
      'zh': { name: 'Chinese', flag: '🇨🇳', color: 'text-red-300' },
      'ja': { name: 'Japanese', flag: '🇯🇵', color: 'text-pink-400' },
      'ko': { name: 'Korean', flag: '🇰🇷', color: 'text-purple-400' },
      'ar': { name: 'Arabic', flag: '🇸🇦', color: 'text-orange-400' },
    };
    
    return languages[lang] || { name: 'Unknown', flag: '🌐', color: 'text-gray-400' };
  };

  if (!language) return null;

  const langInfo = getLanguageInfo(language);

  return (
    <motion.div
      className={`inline-flex items-center space-x-1 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      title={`Detected language: ${langInfo.name}`}
    >
      <span className="text-xs">{langInfo.flag}</span>
      <span className={`text-xs font-medium ${langInfo.color}`}>
        {language.toUpperCase()}
      </span>
    </motion.div>
  );
};

export default LanguageIndicator;
