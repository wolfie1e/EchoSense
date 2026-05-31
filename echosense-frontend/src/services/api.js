// EchoSense API Service Layer
// Centralized API communication with proper error handling and loading states

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class EchoSenseAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network or other errors - fallback to mock data for development
      console.warn(`API call failed for ${endpoint}, using mock data:`, error.message);
      return this.getMockData(endpoint);
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Mock data fallback for development
  getMockData(endpoint) {
    const mockResponses = {
      '/insights/recommendations': {
        recommendations: [
          {
            id: 'rec_001',
            type: 'urgent',
            title: 'Address Pricing Concerns',
            description: 'AI detected 34% increase in price-related negative sentiment. Immediate response recommended.',
            confidence: 0.92,
            impact_score: 0.85,
            estimated_roi: 2.4,
            time_to_implement: '2-4 hours',
            actions: [
              'Publish pricing transparency blog post',
              'Launch targeted social media campaign',
              'Engage with top negative mentions directly'
            ],
            reasoning: 'Sentiment analysis shows price concerns are the primary driver of recent negative feedback.',
            priority: 'high',
            category: 'Crisis Management'
          }
        ]
      },
      '/insights/executive-brief': {
        sentiment_summary: 'Brand sentiment remains positive at 72%, with notable improvement in customer service perception (+15%) following recent initiatives.',
        key_insights: [
          'Sustainability messaging driving 23% engagement increase',
          'Price sensitivity concerns emerging in Gen Z demographic',
          'Customer service satisfaction at all-time high (94%)'
        ],
        action_items: [
          'Address pricing concerns with value communication strategy',
          'Amplify sustainability messaging across all channels',
          'Maintain current customer service excellence standards'
        ],
        risk_factors: [
          'Competitor price cuts may impact market position',
          'Economic uncertainty affecting consumer spending'
        ]
      },
      '/insights/strategic': {
        market_position: {
          score: 78,
          trend: 'improving',
          vs_competitors: '+12%'
        },
        brand_strength: {
          awareness: 85,
          consideration: 72,
          preference: 68,
          loyalty: 74
        },
        opportunity_areas: [
          { area: 'Sustainability', potential: 0.89, effort: 0.34 },
          { area: 'Customer Service', potential: 0.67, effort: 0.23 },
          { area: 'Product Innovation', potential: 0.78, effort: 0.67 },
          { area: 'Pricing Strategy', potential: 0.45, effort: 0.12 }
        ]
      },
      '/insights/roi': {
        current_roi: 3.2,
        projected_roi: 4.1,
        sentiment_impact: {
          revenue_correlation: 0.78,
          customer_lifetime_value: 2400,
          churn_reduction: 0.23
        },
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
      },
      '/insights/outreach': {
        campaigns: [
          {
            id: 'camp_001',
            name: 'Sustainability Response',
            status: 'active',
            platform: 'Twitter',
            target_sentiment: 'positive',
            messages_sent: 23,
            response_rate: 0.67,
            sentiment_improvement: 0.15,
            created: new Date(Date.now() - 86400000),
            template: 'Thank you for your interest in our sustainability efforts! We\'re committed to carbon neutrality by 2025. 🌱'
          }
        ]
      },
      '/analytics/causality': {
        events: [
          {
            id: 1,
            timestamp: new Date(Date.now() - 7200000),
            event: 'CEO Tweet about Sustainability',
            sentiment_before: 65,
            sentiment_after: 78,
            impact_score: 0.85,
            confidence: 0.92
          }
        ]
      },
      '/analytics/churn': {
        overall_risk: {
          high_risk: 156,
          medium_risk: 342,
          low_risk: 1247,
          total_customers: 1745
        },
        high_risk_customers: [
          {
            id: 'CUST_001',
            name: 'TechCorp Industries',
            risk_score: 0.89,
            primary_risk: 'Declining engagement',
            predicted_churn_date: '2024-02-15'
          }
        ]
      },
      '/realtime/stream': {
        mentions: [
          {
            id: Date.now(),
            text: 'Just tried the new product - absolutely love it!',
            sentiment: 0.8,
            platform: 'Twitter',
            timestamp: new Date(),
            author: 'User123'
          }
        ]
      }
    };

    return mockResponses[endpoint] || { error: 'Mock data not found' };
  }
}

// Create singleton instance
const api = new EchoSenseAPI();

// Specific API methods for different features
export const insightsAPI = {
  getRecommendations: () => api.get('/insights/recommendations'),
  getExecutiveBrief: () => api.get('/insights/executive-brief'),
  getStrategicInsights: () => api.get('/insights/strategic'),
  getROIData: () => api.get('/insights/roi'),
  getOutreachCampaigns: () => api.get('/insights/outreach'),
  createCampaign: (data) => api.post('/insights/outreach', data),
  updateCampaign: (id, data) => api.put(`/insights/outreach/${id}`, data),
};

export const analyticsAPI = {
  getCausalityData: () => api.get('/analytics/causality'),
  getChurnData: () => api.get('/analytics/churn'),
  getMultimodalData: () => api.get('/analytics/multimodal'),
  getComplianceData: () => api.get('/analytics/compliance'),
  runScenarioSimulation: (params) => api.post('/analytics/scenario', params),
};

export const realtimeAPI = {
  getSentimentStream: () => api.get('/realtime/stream'),
  getAlerts: () => api.get('/realtime/alerts'),
  getEngagementMetrics: () => api.get('/realtime/engagement'),
  getHeartbeatData: () => api.get('/realtime/heartbeat'),
};

export const globalAPI = {
  getInfluencerData: () => api.get('/global/influencers'),
  getTrendData: () => api.get('/global/trends'),
  getCompetitiveData: () => api.get('/global/competitive'),
  getGeoSentiment: () => api.get('/global/geo-sentiment'),
};

export default api;
