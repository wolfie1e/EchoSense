import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, ArrowRight, GitBranch, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DataLineageTracker = () => {
  const [lineageData, setLineageData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLineageData();
    const interval = setInterval(fetchLineageData, 180000); // Update every 3 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchLineageData = async () => {
    try {
      // Mock data lineage information
      const mockData = {
        data_flow: [
          {
            id: 'source_1',
            name: 'Reddit API',
            type: 'source',
            status: 'active',
            last_updated: new Date(Date.now() - 300000),
            records_processed: 1247,
            data_quality: 0.95
          },
          {
            id: 'source_2',
            name: 'Twitter API',
            type: 'source',
            status: 'active',
            last_updated: new Date(Date.now() - 180000),
            records_processed: 2156,
            data_quality: 0.92
          },
          {
            id: 'transform_1',
            name: 'Sentiment Analysis',
            type: 'transformation',
            status: 'active',
            last_updated: new Date(Date.now() - 120000),
            records_processed: 3403,
            data_quality: 0.98
          },
          {
            id: 'transform_2',
            name: 'Language Detection',
            type: 'transformation',
            status: 'active',
            last_updated: new Date(Date.now() - 90000),
            records_processed: 3403,
            data_quality: 0.89
          },
          {
            id: 'storage_1',
            name: 'Analytics DB',
            type: 'destination',
            status: 'active',
            last_updated: new Date(Date.now() - 60000),
            records_processed: 3403,
            data_quality: 0.97
          }
        ],
        transformations: [
          {
            name: 'Text Preprocessing',
            input_schema: ['raw_text', 'timestamp', 'source'],
            output_schema: ['cleaned_text', 'timestamp', 'source', 'language'],
            rules: ['Remove URLs', 'Normalize whitespace', 'Detect language']
          },
          {
            name: 'Sentiment Scoring',
            input_schema: ['cleaned_text', 'language'],
            output_schema: ['sentiment_score', 'confidence', 'emotions'],
            rules: ['Apply DistilBERT model', 'Calculate confidence', 'Extract emotions']
          }
        ],
        quality_metrics: {
          completeness: 0.96,
          accuracy: 0.94,
          consistency: 0.98,
          timeliness: 0.92
        }
      };

      setLineageData(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lineage data:', error);
      setLoading(false);
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'source': return 'from-blue-500 to-cyan-500';
      case 'transformation': return 'from-purple-500 to-pink-500';
      case 'destination': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getNodeIcon = (type) => {
    switch (type) {
      case 'source': return Database;
      case 'transformation': return GitBranch;
      case 'destination': return Database;
      default: return Database;
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
          <div className="h-32 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
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
          <GitBranch className="w-6 h-6 text-primary" />
          <span>Data Lineage Tracker</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400">Real-time tracking</span>
        </div>
      </div>

      {/* Data Flow Visualization */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Flow Pipeline</h3>
        <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4">
          {lineageData.data_flow.map((node, index) => {
            const NodeIcon = getNodeIcon(node.type);
            const isLast = index === lineageData.data_flow.length - 1;
            
            return (
              <div key={node.id} className="flex items-center space-x-4 min-w-max">
                <motion.div
                  className={`relative p-4 rounded-lg bg-gradient-to-br ${getNodeColor(node.type)} cursor-pointer ${
                    selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex flex-col items-center space-y-2 min-w-[120px]">
                    <NodeIcon className="w-6 h-6 text-white" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">{node.name}</div>
                      <div className="text-xs text-white/80 capitalize">{node.type}</div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {node.status === 'active' ? (
                        <CheckCircle className="w-3 h-3 text-green-300" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-300" />
                      )}
                      <span className="text-xs text-white/80">{node.records_processed}</span>
                    </div>
                  </div>
                  
                  {/* Quality indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                    <div 
                      className={`w-2 h-2 rounded-full ${
                        node.data_quality > 0.95 ? 'bg-green-400' :
                        node.data_quality > 0.9 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                    />
                  </div>
                </motion.div>
                
                {!isLast && (
                  <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <motion.div
          className="bg-gray-900/50 p-4 rounded-lg mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="text-lg font-semibold text-white mb-3">{selectedNode.name} Details</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Status:</span>
              <div className={`font-semibold capitalize ${
                selectedNode.status === 'active' ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedNode.status}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Records:</span>
              <div className="text-white font-semibold">
                {selectedNode.records_processed.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Quality:</span>
              <div className="text-white font-semibold">
                {(selectedNode.data_quality * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <div className="text-white font-semibold">
                {selectedNode.last_updated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quality Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(lineageData.quality_metrics).map(([metric, value], index) => (
          <motion.div
            key={metric}
            className="bg-gray-900/50 p-4 rounded-lg"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${
                value > 0.95 ? 'text-green-400' :
                value > 0.9 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(value * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400 capitalize">
                {metric.replace('_', ' ')}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transformations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Data Transformations</h3>
        <div className="space-y-4">
          {lineageData.transformations.map((transform, index) => (
            <motion.div
              key={transform.name}
              className="bg-gray-900/50 p-4 rounded-lg border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-2">{transform.name}</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Input Schema:</span>
                  <div className="space-y-1">
                    {transform.input_schema.map((field, i) => (
                      <div key={i} className="text-blue-400 font-mono text-xs">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Output Schema:</span>
                  <div className="space-y-1">
                    {transform.output_schema.map((field, i) => (
                      <div key={i} className="text-green-400 font-mono text-xs">
                        {field}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Rules:</span>
                  <div className="space-y-1">
                    {transform.rules.map((rule, i) => (
                      <div key={i} className="text-gray-300 text-xs">
                        • {rule}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DataLineageTracker;
