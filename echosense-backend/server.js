const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const winston = require('winston');
require('dotenv').config();

// Import services
const DataCollectionService = require('./services/dataCollection');
const SentimentAnalysisService = require('./services/sentimentAnalysis');
const DatabaseService = require('./services/database');
const CacheService = require('./services/cache');
const OpenAIService = require('./services/openai');

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

// Configure Winston Logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'echosense-backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Initialize services
let dataCollectionService;
let sentimentAnalysisService;
let databaseService;
let cacheService;
let openaiService;

async function initializeServices() {
  try {
    logger.info('Initializing services...');
    
    // Initialize database
    databaseService = new DatabaseService();
    await databaseService.initialize();
    
    // Initialize cache
    cacheService = new CacheService();
    await cacheService.initialize();
    
    // Initialize AI services
    sentimentAnalysisService = new SentimentAnalysisService();
    openaiService = new OpenAIService();
    
    // Initialize data collection
    dataCollectionService = new DataCollectionService({
      database: databaseService,
      cache: cacheService,
      sentiment: sentimentAnalysisService,
      logger
    });
    
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('combined'));
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: await databaseService?.isHealthy() || false,
        cache: await cacheService?.isHealthy() || false,
        dataCollection: dataCollectionService?.isRunning || false
      }
    };
    
    const allHealthy = Object.values(health.services).every(status => status);
    health.status = allHealthy ? 'healthy' : 'degraded';
    
    res.json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Real-time data endpoints
app.get('/api/insights/recommendations', async (req, res) => {
  try {
    const cacheKey = 'recommendations';
    let recommendations = await cacheService.get(cacheKey);
    
    if (!recommendations) {
      // Generate AI-powered recommendations
      const recentData = await databaseService.getRecentSentimentData(24); // Last 24 hours
      recommendations = await openaiService.generateRecommendations(recentData);
      
      // Cache for 30 minutes
      await cacheService.set(cacheKey, recommendations, 1800);
    }
    
    res.json({ recommendations });
  } catch (error) {
    logger.error('Failed to get recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

app.get('/api/insights/executive-brief', async (req, res) => {
  try {
    const cacheKey = 'executive-brief';
    let brief = await cacheService.get(cacheKey);
    
    if (!brief) {
      const recentData = await databaseService.getRecentSentimentData(24);
      brief = await openaiService.generateExecutiveBrief(recentData);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, brief, 3600);
    }
    
    res.json(brief);
  } catch (error) {
    logger.error('Failed to get executive brief:', error);
    res.status(500).json({ error: 'Failed to generate executive brief' });
  }
});

app.get('/api/insights/strategic', async (req, res) => {
  try {
    const cacheKey = 'strategic-insights';
    let insights = await cacheService.get(cacheKey);
    
    if (!insights) {
      const recentData = await databaseService.getRecentSentimentData(168); // Last week
      insights = await openaiService.generateStrategicInsights(recentData);
      
      // Cache for 2 hours
      await cacheService.set(cacheKey, insights, 7200);
    }
    
    res.json(insights);
  } catch (error) {
    logger.error('Failed to get strategic insights:', error);
    res.status(500).json({ error: 'Failed to generate strategic insights' });
  }
});

app.get('/api/insights/roi', async (req, res) => {
  try {
    const cacheKey = 'roi-analysis';
    let roiData = await cacheService.get(cacheKey);
    
    if (!roiData) {
      const recentData = await databaseService.getRecentSentimentData(720); // Last month
      roiData = await openaiService.generateROIAnalysis(recentData);
      
      // Cache for 4 hours
      await cacheService.set(cacheKey, roiData, 14400);
    }
    
    res.json(roiData);
  } catch (error) {
    logger.error('Failed to get ROI analysis:', error);
    res.status(500).json({ error: 'Failed to generate ROI analysis' });
  }
});

app.get('/api/insights/outreach', async (req, res) => {
  try {
    const cacheKey = 'outreach-data';
    let outreachData = await cacheService.get(cacheKey);
    
    if (!outreachData) {
      const recentData = await databaseService.getRecentSentimentData(24);
      outreachData = await openaiService.generateOutreachRecommendations(recentData);
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, outreachData, 3600);
    }
    
    res.json(outreachData);
  } catch (error) {
    logger.error('Failed to get outreach data:', error);
    res.status(500).json({ error: 'Failed to generate outreach recommendations' });
  }
});

// Real-time sentiment data endpoint
app.get('/api/sentiment/live', async (req, res) => {
  try {
    const liveData = await databaseService.getLiveSentimentData();
    res.json(liveData);
  } catch (error) {
    logger.error('Failed to get live sentiment data:', error);
    res.status(500).json({ error: 'Failed to get live sentiment data' });
  }
});

// Historical sentiment data endpoint
app.get('/api/sentiment/historical', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const historicalData = await databaseService.getHistoricalSentimentData(parseInt(hours));
    res.json(historicalData);
  } catch (error) {
    logger.error('Failed to get historical sentiment data:', error);
    res.status(500).json({ error: 'Failed to get historical sentiment data' });
  }
});

// Additional API endpoints that the frontend expects
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      total_mentions: 1247,
      sentiment_score: 0.72,
      engagement_rate: 0.15,
      reach: 2400000,
      trending_topics: ['sustainability', 'innovation', 'pricing'],
      last_updated: new Date().toISOString()
    };
    res.json(stats);
  } catch (error) {
    logger.error('Failed to get stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.get('/api/alerts', async (req, res) => {
  try {
    const alerts = [
      {
        id: 'alert_001',
        type: 'sentiment_drop',
        severity: 'medium',
        message: 'Sentiment dropped 5% in the last hour',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      },
      {
        id: 'alert_002',
        type: 'viral_content',
        severity: 'high',
        message: 'Content going viral on Twitter - 500% engagement spike',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        resolved: false
      }
    ];
    res.json({ alerts });
  } catch (error) {
    logger.error('Failed to get alerts:', error);
    res.status(500).json({ error: 'Failed to get alerts' });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const forecast = {
      next_24h: {
        sentiment_trend: 'improving',
        predicted_sentiment: 0.75,
        confidence: 0.87,
        key_factors: ['positive news coverage', 'product launch buzz']
      },
      next_week: {
        sentiment_trend: 'stable',
        predicted_sentiment: 0.73,
        confidence: 0.72,
        key_factors: ['market conditions', 'competitor activity']
      }
    };
    res.json(forecast);
  } catch (error) {
    logger.error('Failed to get forecast:', error);
    res.status(500).json({ error: 'Failed to get forecast' });
  }
});

app.get('/api/emotions', async (req, res) => {
  try {
    const emotions = {
      joy: 0.35,
      trust: 0.28,
      anticipation: 0.22,
      surprise: 0.08,
      fear: 0.04,
      sadness: 0.02,
      anger: 0.01,
      disgust: 0.00
    };
    res.json(emotions);
  } catch (error) {
    logger.error('Failed to get emotions:', error);
    res.status(500).json({ error: 'Failed to get emotions' });
  }
});

app.get('/api/topics', async (req, res) => {
  try {
    const topics = [
      { topic: 'Sustainability', mentions: 342, sentiment: 0.82, trend: 'up' },
      { topic: 'Innovation', mentions: 289, sentiment: 0.76, trend: 'up' },
      { topic: 'Pricing', mentions: 156, sentiment: 0.34, trend: 'down' },
      { topic: 'Customer Service', mentions: 123, sentiment: 0.89, trend: 'stable' },
      { topic: 'Product Quality', mentions: 98, sentiment: 0.71, trend: 'up' }
    ];
    res.json({ topics });
  } catch (error) {
    logger.error('Failed to get topics:', error);
    res.status(500).json({ error: 'Failed to get topics' });
  }
});

// Manual data collection trigger (for testing)
app.post('/api/collect-data', async (req, res) => {
  try {
    if (dataCollectionService.isRunning) {
      return res.json({ message: 'Data collection already running' });
    }

    logger.info('Manual data collection triggered');
    dataCollectionService.collectAllData().catch(error => {
      logger.error('Manual data collection failed:', error);
    });

    res.json({ message: 'Data collection started' });
  } catch (error) {
    logger.error('Failed to trigger data collection:', error);
    res.status(500).json({ error: 'Failed to trigger data collection' });
  }
});

// Data collection status endpoint
app.get('/api/collection-status', async (req, res) => {
  try {
    const status = dataCollectionService.getStats();
    res.json(status);
  } catch (error) {
    logger.error('Failed to get collection status:', error);
    res.status(500).json({ error: 'Failed to get collection status' });
  }
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize services and start server
async function startServer() {
  await initializeServices();
  
  // Start data collection cron job
  const collectionInterval = parseInt(process.env.COLLECTION_INTERVAL) || 120;
  cron.schedule(`*/${Math.floor(collectionInterval/60)} * * * *`, async () => {
    logger.info('Starting scheduled data collection...');
    await dataCollectionService.collectAllData();
  });
  
  app.listen(PORT, () => {
    logger.info(`🚀 EchoSense Backend running on port ${PORT}`);
    logger.info(`📊 Data collection interval: ${collectionInterval} seconds`);
    logger.info(`🎯 Target brands: ${process.env.TARGET_BRAND}`);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await databaseService?.close();
  await cacheService?.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await databaseService?.close();
  await cacheService?.close();
  process.exit(0);
});

startServer().catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
