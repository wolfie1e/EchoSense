import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, XCircle, Lock, Eye, FileText, Users } from 'lucide-react';

const ComplianceDashboard = () => {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
    const interval = setInterval(fetchComplianceData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchComplianceData = async () => {
    try {
      // Mock compliance data
      const mockData = {
        overall_score: 98.5,
        regulations: [
          { name: 'GDPR', status: 'compliant', score: 100, last_audit: '2024-01-15' },
          { name: 'CCPA', status: 'compliant', score: 97, last_audit: '2024-01-10' },
          { name: 'SOX', status: 'warning', score: 85, last_audit: '2024-01-05' },
          { name: 'HIPAA', status: 'compliant', score: 100, last_audit: '2024-01-12' }
        ],
        data_protection: {
          pii_detected: 23,
          pii_masked: 23,
          encryption_status: 'active',
          access_controls: 'enforced'
        },
        audit_trail: {
          total_events: 15420,
          critical_events: 3,
          last_backup: '2024-01-20T10:30:00Z'
        }
      };

      setComplianceData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'violation': return XCircle;
      default: return Shield;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'violation': return 'text-red-400';
      default: return 'text-gray-400';
    }
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
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
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
          <Shield className="w-6 h-6 text-primary" />
          <span>Compliance Dashboard</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">Monitoring Active</span>
        </div>
      </div>

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Overall Compliance Score</h3>
            <p className="text-sm text-gray-400">All regulations and policies</p>
          </div>
          <div className="text-3xl font-bold text-green-400">
            {complianceData.overall_score}%
          </div>
        </div>
      </div>

      {/* Regulations Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Regulatory Compliance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complianceData.regulations.map((regulation, index) => {
            const StatusIcon = getStatusIcon(regulation.status);
            const statusColor = getStatusColor(regulation.status);
            
            return (
              <motion.div
                key={regulation.name}
                className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{regulation.name}</h4>
                  <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Score: {regulation.score}%</span>
                  <span className="text-xs text-gray-500">
                    Last audit: {new Date(regulation.last_audit).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Data Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Lock className="w-5 h-5 text-primary" />
            <span>Data Protection</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">PII Detected</span>
              <span className="text-white">{complianceData.data_protection.pii_detected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">PII Masked</span>
              <span className="text-green-400">{complianceData.data_protection.pii_masked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Encryption</span>
              <span className="text-green-400 capitalize">{complianceData.data_protection.encryption_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Access Controls</span>
              <span className="text-green-400 capitalize">{complianceData.data_protection.access_controls}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Audit Trail</span>
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Events</span>
              <span className="text-white">{complianceData.audit_trail.total_events.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Critical Events</span>
              <span className="text-yellow-400">{complianceData.audit_trail.critical_events}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Backup</span>
              <span className="text-green-400">
                {new Date(complianceData.audit_trail.last_backup).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ComplianceDashboard;
