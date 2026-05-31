import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react';
import { gsap } from 'gsap';

const BrandHealthScore = ({ stats }) => {
  const scoreRef = useRef(null);
  const progressRef = useRef(null);
  const [currentScore, setCurrentScore] = useState(0);
  
  // Calculate brand health score (0-100)
  const calculateHealthScore = () => {
    if (!stats) return 50;
    
    const { positive, negative, neutral, total_mentions } = stats;
    
    // Base score from sentiment distribution
    let score = (positive * 1.0 + neutral * 0.5 + negative * 0.0);
    
    // Boost for high engagement (more mentions = more visibility)
    const engagementBoost = Math.min(total_mentions / 100, 20); // Max 20 points
    score += engagementBoost;
    
    // Penalty for high negative sentiment
    const negativePenalty = negative > 30 ? (negative - 30) * 0.5 : 0;
    score -= negativePenalty;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  
  const healthScore = calculateHealthScore();
  
  useEffect(() => {
    // Animate score counter
    gsap.fromTo(
      scoreRef.current,
      { innerText: currentScore },
      {
        innerText: healthScore,
        duration: 2,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate: function() {
          setCurrentScore(Math.round(this.targets()[0].innerText));
        }
      }
    );
    
    // Animate progress circle
    gsap.fromTo(
      progressRef.current,
      { strokeDasharray: '0 283' },
      {
        strokeDasharray: `${(healthScore / 100) * 283} 283`,
        duration: 2,
        ease: 'power2.out'
      }
    );
  }, [healthScore, currentScore]);
  
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  
  const getScoreIcon = (score) => {
    if (score >= 80) return Shield;
    if (score >= 60) return TrendingUp;
    if (score >= 40) return TrendingDown;
    return AlertTriangle;
  };
  
  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };
  
  const getScoreDescription = (score) => {
    if (score >= 80) return 'Your brand perception is outstanding! Keep up the great work.';
    if (score >= 60) return 'Solid brand health with room for improvement.';
    if (score >= 40) return 'Brand perception is mixed. Consider proactive engagement.';
    return 'Brand health requires immediate attention and strategy adjustment.';
  };
  
  const ScoreIcon = getScoreIcon(currentScore);
  
  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Brand Health Score</h2>
        <ScoreIcon className={`w-6 h-6 ${getScoreColor(currentScore)}`} />
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(75, 85, 99, 0.3)"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              ref={progressRef}
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getScoreColor(currentScore)}
              style={{
                strokeDasharray: '0 283',
                transition: 'stroke-dasharray 0.5s ease-in-out'
              }}
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div ref={scoreRef} className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                {currentScore}
              </div>
              <div className="text-xs text-gray-400">/ 100</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`text-lg font-semibold mb-2 ${getScoreColor(currentScore)}`}>
          {getScoreLabel(currentScore)}
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          {getScoreDescription(currentScore)}
        </p>
      </div>
      
      {/* Score breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-800/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Sentiment</div>
            <div className="text-sm font-medium text-white">
              {stats ? `${stats.positive}%` : '0%'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Engagement</div>
            <div className="text-sm font-medium text-white">
              {stats ? stats.total_mentions : 0}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Trend</div>
            <div className="text-sm font-medium text-green-400">
              {currentScore >= 60 ? '↗' : currentScore >= 40 ? '→' : '↘'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BrandHealthScore;
