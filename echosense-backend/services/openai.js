const OpenAI = require('openai');

class OpenAIService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.initialize();
  }

  initialize() {
    try {
      if (!process.env.OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not found, using mock responses');
        this.isInitialized = false;
        return;
      }

      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      this.isInitialized = true;
      console.log('✅ OpenAI service initialized');
    } catch (error) {
      console.error('❌ OpenAI initialization failed:', error);
      this.isInitialized = false;
    }
  }

  async generateRecommendations(sentimentData) {
    if (!this.isInitialized) {
      return this.getMockRecommendations();
    }

    try {
      const prompt = this.buildRecommendationsPrompt(sentimentData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert brand intelligence analyst. Analyze sentiment data and provide actionable recommendations in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  async generateExecutiveBrief(sentimentData) {
    if (!this.isInitialized) {
      return this.getMockExecutiveBrief();
    }

    try {
      const prompt = this.buildExecutiveBriefPrompt(sentimentData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a C-suite executive assistant. Create concise, actionable executive briefs based on brand sentiment data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate executive brief:', error);
      return this.getMockExecutiveBrief();
    }
  }

  async generateStrategicInsights(sentimentData) {
    if (!this.isInitialized) {
      return this.getMockStrategicInsights();
    }

    try {
      const prompt = this.buildStrategicInsightsPrompt(sentimentData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a strategic business analyst. Analyze market sentiment to provide strategic insights and competitive positioning recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1200
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate strategic insights:', error);
      return this.getMockStrategicInsights();
    }
  }

  async generateROIAnalysis(sentimentData) {
    if (!this.isInitialized) {
      return this.getMockROIAnalysis();
    }

    try {
      const prompt = this.buildROIAnalysisPrompt(sentimentData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst specializing in marketing ROI. Calculate and project ROI based on sentiment and engagement data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate ROI analysis:', error);
      return this.getMockROIAnalysis();
    }
  }

  async generateOutreachRecommendations(sentimentData) {
    if (!this.isInitialized) {
      return this.getMockOutreachRecommendations();
    }

    try {
      const prompt = this.buildOutreachPrompt(sentimentData);
      
      const completion = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a social media and outreach specialist. Recommend targeted outreach strategies based on sentiment analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to generate outreach recommendations:', error);
      return this.getMockOutreachRecommendations();
    }
  }

  buildRecommendationsPrompt(sentimentData) {
    const avgSentiment = sentimentData.length > 0 ? 
      sentimentData.reduce((sum, item) => sum + item.sentiment_score, 0) / sentimentData.length : 0.5;
    
    const brands = [...new Set(sentimentData.map(item => item.brand).filter(Boolean))];
    const platforms = [...new Set(sentimentData.map(item => item.platform))];

    return `
    Analyze the following brand sentiment data and provide 3-5 actionable recommendations:
    
    Data Summary:
    - Average Sentiment: ${avgSentiment.toFixed(2)}
    - Total Posts: ${sentimentData.length}
    - Brands: ${brands.join(', ')}
    - Platforms: ${platforms.join(', ')}
    - Time Period: Last 24 hours
    
    Please respond with a JSON array of recommendations, each containing:
    {
      "id": "unique_id",
      "type": "urgent|important|opportunity",
      "title": "Brief title",
      "description": "Detailed description",
      "confidence": 0.0-1.0,
      "impact_score": 0.0-1.0,
      "estimated_roi": number,
      "time_to_implement": "time estimate",
      "actions": ["action1", "action2"],
      "reasoning": "Why this recommendation",
      "priority": "high|medium|low",
      "category": "Crisis Management|Growth|Optimization"
    }
    `;
  }

  buildExecutiveBriefPrompt(sentimentData) {
    const avgSentiment = sentimentData.length > 0 ? 
      sentimentData.reduce((sum, item) => sum + item.sentiment_score, 0) / sentimentData.length : 0.5;

    return `
    Create an executive brief based on this sentiment data:
    
    - Average Sentiment: ${avgSentiment.toFixed(2)}
    - Total Mentions: ${sentimentData.length}
    - Time Period: Last 24 hours
    
    Respond with JSON containing:
    {
      "sentiment_summary": "Brief overall sentiment summary",
      "key_insights": ["insight1", "insight2", "insight3"],
      "action_items": ["action1", "action2"],
      "risk_factors": ["risk1", "risk2"]
    }
    `;
  }

  buildStrategicInsightsPrompt(sentimentData) {
    return `
    Provide strategic market insights based on sentiment data from ${sentimentData.length} posts.
    
    Respond with JSON containing:
    {
      "market_position": {"score": 0-100, "trend": "improving|declining|stable", "vs_competitors": "percentage"},
      "brand_strength": {"awareness": 0-100, "consideration": 0-100, "preference": 0-100, "loyalty": 0-100},
      "opportunity_areas": [{"area": "name", "potential": 0.0-1.0, "effort": 0.0-1.0}],
      "strategic_recommendations": ["recommendation1", "recommendation2"]
    }
    `;
  }

  buildROIAnalysisPrompt(sentimentData) {
    return `
    Calculate ROI analysis based on sentiment data from ${sentimentData.length} posts over the last month.
    
    Respond with JSON containing:
    {
      "current_roi": number,
      "projected_roi": number,
      "financial_metrics": {
        "revenue_increase": number,
        "cost_savings": number,
        "customer_acquisition_cost": number,
        "retention_improvement": 0.0-1.0
      },
      "timeline_data": {
        "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        "roi_values": [numbers],
        "revenue_impact": [numbers]
      }
    }
    `;
  }

  buildOutreachPrompt(sentimentData) {
    return `
    Recommend outreach strategies based on sentiment data from ${sentimentData.length} recent posts.
    
    Respond with JSON containing:
    {
      "campaigns": [{
        "id": "unique_id",
        "name": "campaign name",
        "status": "active|planned|completed",
        "platform": "platform name",
        "messages_sent": number,
        "response_rate": 0.0-1.0,
        "sentiment_improvement": 0.0-1.0,
        "created": "ISO date",
        "template": "message template"
      }]
    }
    `;
  }

  // Mock responses for when OpenAI is not available
  getMockRecommendations() {
    return [
      {
        id: 'rec_001',
        type: 'urgent',
        title: 'Address Pricing Concerns',
        description: 'AI detected increased price-related negative sentiment across platforms.',
        confidence: 0.92,
        impact_score: 0.85,
        estimated_roi: 2.4,
        time_to_implement: '2-4 hours',
        actions: ['Publish pricing transparency blog post', 'Launch targeted campaign'],
        reasoning: 'Sentiment analysis shows price concerns are the primary driver of negative sentiment.',
        priority: 'high',
        category: 'Crisis Management'
      },
      {
        id: 'rec_002',
        type: 'opportunity',
        title: 'Leverage Sustainability Messaging',
        description: 'Positive sentiment spike around sustainability topics presents growth opportunity.',
        confidence: 0.87,
        impact_score: 0.78,
        estimated_roi: 3.1,
        time_to_implement: '1-2 weeks',
        actions: ['Create sustainability content series', 'Partner with eco-influencers'],
        reasoning: 'Sustainability mentions show 23% higher engagement and positive sentiment.',
        priority: 'medium',
        category: 'Growth'
      }
    ];
  }

  getMockExecutiveBrief() {
    return {
      sentiment_summary: 'Brand sentiment remains positive at 72% with strong performance in sustainability messaging.',
      key_insights: [
        'Sustainability messaging driving 23% engagement increase',
        'Price sensitivity emerging as key concern in Q4',
        'Social media engagement up 15% month-over-month'
      ],
      action_items: [
        'Address pricing concerns with value communication strategy',
        'Expand sustainability content production',
        'Monitor competitor pricing announcements'
      ],
      risk_factors: [
        'Competitor price cuts may impact market position',
        'Economic uncertainty affecting consumer spending',
        'Supply chain concerns mentioned in 12% of negative posts'
      ]
    };
  }

  getMockStrategicInsights() {
    return {
      market_position: { score: 78, trend: 'improving', vs_competitors: '+12%' },
      brand_strength: { awareness: 85, consideration: 72, preference: 68, loyalty: 74 },
      opportunity_areas: [
        { area: 'Sustainability', potential: 0.89, effort: 0.34 },
        { area: 'Customer Service', potential: 0.76, effort: 0.45 },
        { area: 'Innovation Messaging', potential: 0.82, effort: 0.67 }
      ],
      strategic_recommendations: [
        'Focus on sustainability messaging for maximum ROI',
        'Invest in customer service improvements',
        'Develop innovation-focused content strategy'
      ]
    };
  }

  getMockROIAnalysis() {
    return {
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
    };
  }

  getMockOutreachRecommendations() {
    return {
      campaigns: [
        {
          id: 'camp_001',
          name: 'Sustainability Response',
          status: 'active',
          platform: 'Twitter',
          messages_sent: 23,
          response_rate: 0.67,
          sentiment_improvement: 0.15,
          created: new Date(Date.now() - 86400000).toISOString(),
          template: 'Thank you for your interest in our sustainability efforts! 🌱'
        },
        {
          id: 'camp_002',
          name: 'Price Value Communication',
          status: 'planned',
          platform: 'Reddit',
          messages_sent: 0,
          response_rate: 0,
          sentiment_improvement: 0,
          created: new Date().toISOString(),
          template: 'We understand your concerns about pricing. Here\'s why our value proposition remains strong...'
        }
      ]
    };
  }
}

module.exports = OpenAIService;
