const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('combined'));
app.use(express.json());

// Mock API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/insights/recommendations', (req, res) => {
  res.json({
    recommendations: [
      {
        id: 'rec_001',
        type: 'urgent',
        title: 'Address Pricing Concerns',
        description: 'AI detected 34% increase in price-related negative sentiment.',
        confidence: 0.92,
        impact_score: 0.85,
        estimated_roi: 2.4,
        time_to_implement: '2-4 hours',
        actions: ['Publish pricing transparency blog post', 'Launch targeted campaign'],
        reasoning: 'Sentiment analysis shows price concerns are the primary driver.',
        priority: 'high',
        category: 'Crisis Management'
      }
    ]
  });
});

app.get('/api/insights/executive-brief', (req, res) => {
  res.json({
    sentiment_summary: 'Brand sentiment remains positive at 72%.',
    key_insights: ['Sustainability messaging driving 23% engagement increase'],
    action_items: ['Address pricing concerns with value communication strategy'],
    risk_factors: ['Competitor price cuts may impact market position']
  });
});

app.get('/api/insights/strategic', (req, res) => {
  res.json({
    market_position: { score: 78, trend: 'improving', vs_competitors: '+12%' },
    brand_strength: { awareness: 85, consideration: 72, preference: 68, loyalty: 74 },
    opportunity_areas: [
      { area: 'Sustainability', potential: 0.89, effort: 0.34 }
    ],
    strategic_recommendations: ['Focus on sustainability messaging for maximum ROI']
  });
});

app.get('/api/insights/roi', (req, res) => {
  res.json({
    current_roi: 3.2,
    projected_roi: 4.1,
    financial_metrics: {
      revenue_increase: 2400000,
      cost_savings: 890000,
      customer_acquisition_cost: 120,
      retention_improvement: 0.15
    },
    timeline_data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      roi_values: [2.1, 2.4, 2.8, 3.0, 3.2, 3.5],
      revenue_impact: [1200000, 1450000, 1780000, 2100000, 2400000, 2650000]
    }
  });
});

app.get('/api/insights/outreach', (req, res) => {
  res.json({
    campaigns: [
      {
        id: 'camp_001',
        name: 'Sustainability Response',
        status: 'active',
        platform: 'Twitter',
        messages_sent: 23,
        response_rate: 0.67,
        sentiment_improvement: 0.15,
        created: new Date(Date.now() - 86400000),
        template: 'Thank you for your interest in our sustainability efforts! 🌱'
      }
    ]
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 EchoSense Backend running on port ' + PORT);
});
