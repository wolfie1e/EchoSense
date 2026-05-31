import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { DollarSign, TrendingUp, Calculator, Target, Users } from 'lucide-react';
import { insightsAPI } from '../services/api';

const ROIImpactCalculator = () => {
  const [roiData, setRoiData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('sentiment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchROIData();
  }, []);

  const fetchROIData = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getROIData();
      setRoiData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ROI data:', error);
      setLoading(false);
    }
  };

  const chartData = roiData ? {
    labels: roiData.timeline_data.labels,
    datasets: [
      {
        label: 'ROI',
        data: roiData.timeline_data.roi_values,
        borderColor: '#8A2BE2',
        backgroundColor: 'rgba(138, 43, 226, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Revenue Impact ($M)',
        data: roiData.timeline_data.revenue_impact.map(v => v / 1000000),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: { color: '#9ca3af' },
        grid: { drawOnChartArea: false },
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
          <div className="h-48 bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-dark/30 backdrop-blur-lg border border-gray-800/50 p-6 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-primary" />
          <span>ROI Impact Calculator</span>
        </h2>
      </div>

      {/* ROI Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Current ROI</h3>
              <p className="text-sm text-gray-400">Sentiment initiatives</p>
            </div>
            <div className="text-3xl font-bold text-green-400">
              {roiData.current_roi}x
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Projected ROI</h3>
              <p className="text-sm text-gray-400">Next quarter</p>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {roiData.projected_roi}x
            </div>
          </div>
        </div>
      </div>

      {/* Financial Impact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Revenue Increase', 
            value: `$${(roiData.financial_metrics.revenue_increase / 1000000).toFixed(1)}M`, 
            icon: TrendingUp, 
            color: 'text-green-400' 
          },
          { 
            label: 'Cost Savings', 
            value: `$${(roiData.financial_metrics.cost_savings / 1000).toFixed(0)}K`, 
            icon: Target, 
            color: 'text-blue-400' 
          },
          { 
            label: 'CAC Reduction', 
            value: `$${roiData.financial_metrics.customer_acquisition_cost}`, 
            icon: Users, 
            color: 'text-purple-400' 
          },
          { 
            label: 'Retention Boost', 
            value: `+${(roiData.financial_metrics.retention_improvement * 100).toFixed(0)}%`, 
            icon: Calculator, 
            color: 'text-yellow-400' 
          },
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <motion.div
              key={metric.label}
              className="bg-gray-900/50 p-4 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <IconComponent className={`w-5 h-5 ${metric.color}`} />
                <span className="text-xs text-gray-400">{metric.label}</span>
              </div>
              <div className={`text-xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ROI Timeline Chart */}
      <div className="h-48">
        <Line data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
};

export default ROIImpactCalculator;
