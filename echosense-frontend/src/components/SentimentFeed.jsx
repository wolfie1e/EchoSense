import React from 'react';
import { motion } from 'framer-motion';
import { mockFeed } from '../services/mockApi';
import LanguageIndicator from './LanguageIndicator';

const SentimentFeed = () => {
  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl h-[500px] flex flex-col"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <h2 className="text-xl font-bold text-white mb-4">Real-Time Mentions</h2>
      <div className="flex-grow overflow-y-auto pr-2">
        <ul className="space-y-4">
          {mockFeed.map((item) => (
            <motion.li
              key={item.id}
              className="bg-gray-900/50 p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold uppercase ${
                    item.sentiment === 'positive' ? 'text-green-400' :
                    item.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {item.sentiment}
                  </span>
                  <LanguageIndicator language={item.language || 'en'} />
                </div>
                <span className="text-xs text-gray-500">{item.source}</span>
              </div>
              <p className="text-sm text-gray-300">{item.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default SentimentFeed;
