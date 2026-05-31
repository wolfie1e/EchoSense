import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { mockAiResponses } from '../services/mockApi';

const AIControlCenter = () => {
  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <h2 className="text-xl font-bold text-white mb-4">AI Response Center</h2>
      <button className="w-full flex items-center justify-center space-x-2 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/80 transition-colors">
        <Bot className="w-5 h-5" />
        <span>Generate Proactive Response</span>
      </button>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Recent AI Actions</h3>
        <ul className="space-y-3">
          {mockAiResponses.map((res) => (
            <li key={res.id} className="text-xs text-gray-300 bg-gray-900/50 p-3 rounded-md">
              <span className="font-bold text-primary">AI:</span> {res.response}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default AIControlCenter;
