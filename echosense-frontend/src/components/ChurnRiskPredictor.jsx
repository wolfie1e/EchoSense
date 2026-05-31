import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Doughnut, Bar } from 'react-chartjs-2';
import { gsap } from 'gsap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  AlertTriangle, 
  Users, 
  TrendingDown, 
  Shield, 
  Target,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Star
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const ChurnRiskPredictor = () => {
  const [churnData, setChurnData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [interventionMode, setInterventionMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchChurnData();
    const interval = setInterval(fetchChurnData, 120000); // Update every 2 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, [loading]);

  const fetchChurnData = async () => {
    try {
      // Mock churn prediction data
      const mockData = {
        overall_risk: {
          high_risk: 156,
          medium_risk: 342,
          low_risk: 1247,
          total_customers: 1745
        },
        risk_distribution: {
          labels: ['Low Risk', 'Medium Risk', 'High Risk'],
          data: [1247, 342, 156],
          colors: ['#22c55e', '#f59e0b', '#ef4444']
        },
        risk_factors: [
          { factor: 'Declining Engagement', weight: 0.35, trend: 'increasing' },
          { factor: 'Negative Sentiment', weight: 0.28, trend: 'stable' },
          { factor: 'Support Tickets', weight: 0.22, trend: 'decreasing' },
          { factor: 'Price Sensitivity', weight: 0.15, trend: 'increasing' }
        ],
        high_risk_customers: [
          {
            id: 'CUST_001',
            name: 'TechCorp Industries',
            risk_score: 0.89,
            primary_risk: 'Declining engagement',
            last_interaction: '14 days ago',
            sentiment_trend: -0.45,
            predicted_churn_date: '2024-02-15',
            intervention_suggestions: [
              'Personal outreach call',
              'Exclusive product demo',
              'Loyalty program enrollment'
            ]
          },
          {
            id: 'CUST_002',
            name: 'Global Solutions Ltd',
            risk_score: 0.82,
            primary_risk: 'Negative sentiment',
            last_interaction: '8 days ago',
            sentiment_trend: -0.38,
            predicted_churn_date: '2024-02-22',
            intervention_suggestions: [
              'Customer success check-in',
              'Feature training session',
              'Feedback survey'
            ]
          },
          {
            id: 'CUST_003',
            name: 'Innovation Partners',
            risk_score: 0.76,
            primary_risk: 'Support issues',
            last_interaction: '3 days ago',
            sentiment_trend: -0.22,
            predicted_churn_date: '2024-03-01',
            intervention_suggestions: [
              'Priority support assignment',
              'Technical consultation',
              'Process optimization review'
            ]
          }
        ],
        intervention_effectiveness: {
          email_campaigns: { success_rate: 0.23, cost: 50 },
          phone_outreach: { success_rate: 0.67, cost: 200 },
          personal_meetings: { success_rate: 0.84, cost: 500 },
          loyalty_programs: { success_rate: 0.45, cost: 150 }
        }
      };

      setChurnData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching churn data:', error);
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score >= 0.7) return 'text-red-400';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskLevel = (score) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  const doughnutData = churnData ? {
    labels: churnData.risk_distribution.labels,
    datasets: [
      {
        data: churnData.risk_distribution.data,
        backgroundColor: churnData.risk_distribution.colors,
        borderColor: churnData.risk_distribution.colors.map(color => color + '80'),
        borderWidth: 2,
      },
    ],
  } : null;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#9ca3af' },
      },
    },
  };

  const factorsData = churnData ? {
    labels: churnData.risk_factors.map(f => f.factor),
    datasets: [
      {
        label: 'Risk Weight',
        data: churnData.risk_factors.map(f => f.weight * 100),
        backgroundColor: 'rgba(138, 43, 226, 0.8)',
        borderColor: '#8A2BE2',
        borderWidth: 1,
      },
    ],
  } : null;

  const factorsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        min: 0,
        max: 40,
      },
    },
  };

  if (loading) {
    return (
      <motion.div
        className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="h-48 bg-gray-700 rounded"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

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
          <AlertTriangle className="w-6 h-6 text-primary" />
          <span>Churn Risk Prediction</span>
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400">ML Active</span>
          </div>
          
          <motion.button
            onClick={() => setInterventionMode(!interventionMode)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              interventionMode 
                ? 'bg-primary text-white' 
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Intervention Mode
          </motion.button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'High Risk', 
            value: churnData.overall_risk.high_risk, 
            icon: AlertTriangle, 
            color: 'text-red-400',
            bg: 'from-red-500/20 to-red-600/20'
          },
          { 
            label: 'Medium Risk', 
            value: churnData.overall_risk.medium_risk, 
            icon: Clock, 
            color: 'text-yellow-400',
            bg: 'from-yellow-500/20 to-yellow-600/20'
          },
          { 
            label: 'Low Risk', 
            value: churnData.overall_risk.low_risk, 
            icon: Shield, 
            color: 'text-green-400',
            bg: 'from-green-500/20 to-green-600/20'
          },
          { 
            label: 'Total Customers', 
            value: churnData.overall_risk.total_customers, 
            icon: Users, 
            color: 'text-blue-400',
            bg: 'from-blue-500/20 to-blue-600/20'
          },
        ].map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.bg} border border-gray-700 p-4 rounded-lg`}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
          <div className="h-48">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
          <div className="h-48">
            <Bar data={factorsData} options={factorsOptions} />
          </div>
        </div>
      </div>

      {/* High Risk Customers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <Target className="w-5 h-5 text-red-400" />
          <span>High Risk Customers</span>
        </h3>
        
        <div className="space-y-4">
          {churnData.high_risk_customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              className="bg-gray-900/50 border border-red-500/20 p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white">{customer.name}</h4>
                  <p className="text-sm text-gray-400">ID: {customer.id}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getRiskColor(customer.risk_score)}`}>
                    {(customer.risk_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {getRiskLevel(customer.risk_score)} Risk
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-400">Primary Risk:</span>
                  <div className="text-white">{customer.primary_risk}</div>
                </div>
                <div>
                  <span className="text-gray-400">Last Interaction:</span>
                  <div className="text-white">{customer.last_interaction}</div>
                </div>
                <div>
                  <span className="text-gray-400">Predicted Churn:</span>
                  <div className="text-red-400">{customer.predicted_churn_date}</div>
                </div>
              </div>
              
              <AnimatePresence>
                {interventionMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-700 pt-4"
                  >
                    <h5 className="text-sm font-semibold text-white mb-2">Intervention Suggestions:</h5>
                    <div className="flex flex-wrap gap-2">
                      {customer.intervention_suggestions.map((suggestion, i) => (
                        <motion.button
                          key={i}
                          className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-md hover:bg-primary/30 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Intervention Effectiveness */}
      <AnimatePresence>
        {interventionMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 p-4 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-primary" />
              <span>Intervention Effectiveness</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Email Campaigns', icon: Mail, ...churnData.intervention_effectiveness.email_campaigns },
                { name: 'Phone Outreach', icon: Phone, ...churnData.intervention_effectiveness.phone_outreach },
                { name: 'Personal Meetings', icon: Users, ...churnData.intervention_effectiveness.personal_meetings },
                { name: 'Loyalty Programs', icon: Star, ...churnData.intervention_effectiveness.loyalty_programs },
              ].map((intervention, index) => {
                const IconComponent = intervention.icon;
                return (
                  <div key={intervention.name} className="bg-gray-900/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <IconComponent className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-white">{intervention.name}</span>
                    </div>
                    <div className="text-lg font-bold text-green-400 mb-1">
                      {(intervention.success_rate * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400">
                      ${intervention.cost} avg cost
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChurnRiskPredictor;
