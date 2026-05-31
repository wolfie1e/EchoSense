import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Package,
  Megaphone,
  AlertTriangle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const MarketScenarioSimulator = () => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('price_change');
  const [scenarioParams, setScenarioParams] = useState({
    price_change: 0,
    product_launch: false,
    marketing_campaign: 0,
    recall_severity: 0
  });
  const [simulationResults, setSimulationResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const containerRef = useRef(null);

  const scenarios = [
    {
      id: 'price_change',
      name: 'Price Adjustment',
      icon: DollarSign,
      description: 'Simulate impact of price changes on brand sentiment',
      color: 'from-green-500 to-emerald-500',
      params: {
        min: -50,
        max: 50,
        step: 5,
        unit: '%',
        label: 'Price Change'
      }
    },
    {
      id: 'product_launch',
      name: 'Product Launch',
      icon: Package,
      description: 'Predict sentiment response to new product introduction',
      color: 'from-blue-500 to-cyan-500',
      params: {
        type: 'boolean',
        label: 'Launch New Product'
      }
    },
    {
      id: 'marketing_campaign',
      name: 'Marketing Campaign',
      icon: Megaphone,
      description: 'Forecast sentiment impact of marketing spend',
      color: 'from-purple-500 to-pink-500',
      params: {
        min: 0,
        max: 1000000,
        step: 50000,
        unit: '$',
        label: 'Campaign Budget'
      }
    },
    {
      id: 'recall_scenario',
      name: 'Crisis Simulation',
      icon: AlertTriangle,
      description: 'Model sentiment recovery from product recalls',
      color: 'from-red-500 to-orange-500',
      params: {
        min: 1,
        max: 10,
        step: 1,
        unit: '/10',
        label: 'Crisis Severity'
      }
    }
  ];

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    setCurrentStep(0);
    
    // Simulate step-by-step analysis
    const steps = [
      'Analyzing current market conditions...',
      'Processing historical sentiment data...',
      'Running Monte Carlo simulations...',
      'Calculating confidence intervals...',
      'Generating predictions...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Generate mock simulation results
    const baselineSentiment = 65;
    const results = generateSimulationResults(selectedScenario, scenarioParams, baselineSentiment);
    setSimulationResults(results);
    setIsSimulating(false);
  };

  const generateSimulationResults = (scenario, params, baseline) => {
    const timePoints = Array.from({ length: 30 }, (_, i) => i + 1);
    let sentimentChange = 0;
    
    switch (scenario) {
      case 'price_change':
        sentimentChange = -params.price_change * 0.3; // Negative correlation with price increases
        break;
      case 'product_launch':
        sentimentChange = params.product_launch ? 15 : 0;
        break;
      case 'marketing_campaign':
        sentimentChange = Math.log(params.marketing_campaign / 10000 + 1) * 5;
        break;
      case 'recall_scenario':
        sentimentChange = -params.recall_severity * 8;
        break;
      default:
        sentimentChange = 0;
    }
    
    const predictedSentiment = timePoints.map(day => {
      const recovery = scenario === 'recall_scenario' ? Math.log(day) * 3 : 0;
      const volatility = (Math.random() - 0.5) * 4;
      return Math.max(0, Math.min(100, baseline + sentimentChange + recovery + volatility));
    });
    
    const confidence = timePoints.map(day => {
      const baseConfidence = 95;
      const decay = day * 0.5;
      return Math.max(60, baseConfidence - decay);
    });
    
    return {
      timeline: timePoints,
      predicted_sentiment: predictedSentiment,
      confidence_intervals: confidence,
      impact_summary: {
        immediate_impact: sentimentChange,
        peak_impact: Math.min(...predictedSentiment) - baseline,
        recovery_time: scenario === 'recall_scenario' ? 14 : 7,
        long_term_effect: sentimentChange * 0.3
      },
      risk_factors: [
        'Market volatility may amplify effects',
        'Competitor responses could influence outcomes',
        'External events may override predictions',
        'Consumer behavior patterns may shift'
      ]
    };
  };

  const resetSimulation = () => {
    setSimulationResults(null);
    setCurrentStep(0);
    setIsSimulating(false);
  };

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  const chartData = simulationResults ? {
    labels: simulationResults.timeline.map(day => `Day ${day}`),
    datasets: [
      {
        label: 'Predicted Sentiment',
        data: simulationResults.predicted_sentiment,
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Confidence Interval',
        data: simulationResults.confidence_intervals,
        borderColor: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        min: 0,
        max: 100,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#9ca3af' },
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <motion.div
      ref={containerRef}
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Settings className="w-6 h-6 text-primary" />
          <span>Market Scenario Simulator</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
          </motion.button>
          
          <motion.button
            onClick={resetSimulation}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {scenarios.map((scenario) => {
          const IconComponent = scenario.icon;
          const isSelected = selectedScenario === scenario.id;
          
          return (
            <motion.button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'bg-primary/20 border-primary'
                  : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${scenario.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{scenario.name}</h3>
              <p className="text-xs text-gray-400">{scenario.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Parameter Controls */}
      {currentScenario && (
        <motion.div
          className="bg-gray-900/50 p-4 rounded-lg mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Scenario Parameters</h3>
          
          {currentScenario.params.type === 'boolean' ? (
            <div className="flex items-center space-x-3">
              <label className="text-gray-300">{currentScenario.params.label}</label>
              <motion.button
                onClick={() => setScenarioParams(prev => ({
                  ...prev,
                  [selectedScenario]: !prev[selectedScenario]
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  scenarioParams[selectedScenario] ? 'bg-primary' : 'bg-gray-600'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{
                    x: scenarioParams[selectedScenario] ? 24 : 2,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>
          ) : (
            <div>
              <label className="block text-gray-300 mb-2">
                {currentScenario.params.label}: {scenarioParams[selectedScenario]}{currentScenario.params.unit}
              </label>
              <input
                type="range"
                min={currentScenario.params.min}
                max={currentScenario.params.max}
                step={currentScenario.params.step}
                value={scenarioParams[selectedScenario]}
                onChange={(e) => setScenarioParams(prev => ({
                  ...prev,
                  [selectedScenario]: parseFloat(e.target.value)
                }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{currentScenario.params.min}{currentScenario.params.unit}</span>
                <span>{currentScenario.params.max}{currentScenario.params.unit}</span>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Simulation Progress */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            className="bg-primary/10 border border-primary/20 p-4 rounded-lg mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">Running Simulation</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-300">
              Step {currentStep + 1}/5: {
                ['Analyzing current market conditions...',
                 'Processing historical sentiment data...',
                 'Running Monte Carlo simulations...',
                 'Calculating confidence intervals...',
                 'Generating predictions...'][currentStep]
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {simulationResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {/* Chart */}
            <div className="h-64 mb-6">
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Impact Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { 
                  label: 'Immediate Impact', 
                  value: `${simulationResults.impact_summary.immediate_impact > 0 ? '+' : ''}${simulationResults.impact_summary.immediate_impact.toFixed(1)}%`,
                  icon: simulationResults.impact_summary.immediate_impact > 0 ? TrendingUp : TrendingDown,
                  color: simulationResults.impact_summary.immediate_impact > 0 ? 'text-green-400' : 'text-red-400'
                },
                { 
                  label: 'Peak Impact', 
                  value: `${simulationResults.impact_summary.peak_impact > 0 ? '+' : ''}${simulationResults.impact_summary.peak_impact.toFixed(1)}%`,
                  icon: simulationResults.impact_summary.peak_impact > 0 ? TrendingUp : TrendingDown,
                  color: simulationResults.impact_summary.peak_impact > 0 ? 'text-green-400' : 'text-red-400'
                },
                { 
                  label: 'Recovery Time', 
                  value: `${simulationResults.impact_summary.recovery_time} days`,
                  icon: RotateCcw,
                  color: 'text-blue-400'
                },
                { 
                  label: 'Long-term Effect', 
                  value: `${simulationResults.impact_summary.long_term_effect > 0 ? '+' : ''}${simulationResults.impact_summary.long_term_effect.toFixed(1)}%`,
                  icon: simulationResults.impact_summary.long_term_effect > 0 ? TrendingUp : TrendingDown,
                  color: simulationResults.impact_summary.long_term_effect > 0 ? 'text-green-400' : 'text-red-400'
                },
              ].map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div key={metric.label} className="bg-gray-900/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-sm text-gray-400">{metric.label}</span>
                    </div>
                    <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Risk Factors */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <h4 className="text-yellow-400 font-semibold mb-2 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Risk Factors</span>
              </h4>
              <ul className="space-y-1">
                {simulationResults.risk_factors.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-300">• {risk}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MarketScenarioSimulator;
