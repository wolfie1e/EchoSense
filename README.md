# 🎯 EchoSense - Advanced Brand Perception Analysis System

**EchoSense** is an intelligent, always-on brand perception radar that fuses real-time data acquisition, advanced NLP, and predictive analytics into a single adaptive platform. It continuously harvests high-velocity streams from Reddit, YouTube, and global news APIs, employs a fine-tuned DistilBERT model for nuanced sentiment detection, and transforms historical patterns into 48-hour predictive trajectories.

# Product page (Demo)
<img width="1600" height="887" alt="image" src="https://github.com/user-attachments/assets/c17b051e-457a-48fe-a195-9ee2f5e040de" />

<img width="1600" height="890" alt="image" src="https://github.com/user-attachments/assets/41468065-ce30-4363-81e1-3887cb6a89b2" />

<img width="1600" height="884" alt="image" src="https://github.com/user-attachments/assets/12f2eb52-f86c-43fa-ae93-35484637fc85" />

<img width="1600" height="877" alt="image" src="https://github.com/user-attachments/assets/23f86f12-e1f2-401e-b0d6-c60575880951" />



## 🌟 Key Features

### 🔍 **Advanced Data Collection Engine**
- **Multi-Platform Integration**: Reddit (PRAW), YouTube Data API v3, NewsAPI
- **Real-Time Processing**: Continuous data collection every 2 minutes
- **Intelligent Filtering**: Brand mention detection with keyword matching
- **Duplicate Prevention**: Timestamp-based deduplication across sources
- **Error Recovery**: Robust API failure handling and retry mechanisms
- **Rate Limit Management**: Automatic throttling and quota management

### 🧠 **State-of-the-Art Sentiment Analysis**
- **Advanced NLP Model**: Hugging Face DistilBERT-base-uncased-finetuned-sst-2-english
- **Multi-Class Classification**: Positive, Negative, Neutral sentiment detection
- **Confidence Scoring**: Probability distributions for prediction reliability
- **Batch Processing**: Efficient analysis of multiple posts simultaneously
- **Real-Time Analysis**: Immediate sentiment scoring for incoming data
- **Context Awareness**: Brand-specific sentiment interpretation

### 📈 **Predictive Analytics & Forecasting**
- **Time Series Modeling**: Facebook Prophet for 48-hour sentiment predictions
- **Trend Analysis**: Historical pattern recognition and future trend projection
- **Seasonal Decomposition**: Identification of cyclical sentiment patterns
- **Confidence Intervals**: Statistical uncertainty quantification
- **Weather-Style Interface**: Intuitive forecast visualization with icons
- **Anomaly Detection**: Identification of unusual sentiment spikes or drops

### 🤖 **Intelligent AI Response System**
- **Automated Detection**: Real-time identification of negative sentiment posts
- **Context-Aware Generation**: Brand-appropriate response creation using OpenAI GPT
- **Quality Analysis**: Response quality scoring with multiple metrics
- **Tone Consistency**: Brand voice guidelines and style enforcement
- **Response Templates**: Customizable response patterns for different scenarios
- **Fallback System**: Demo responses when API quotas are exceeded

### 📊 **Professional Dashboard Interface**
- **Real-Time Monitoring**: Live sentiment feed with auto-refresh capabilities
- **Interactive Analytics**: Dynamic charts and visualizations using Chart.js
- **3D Background**: Beautiful animated starfield using Three.js
- **Manual Controls**: Trigger data collection, AI responses, and forecasting
- **Health Monitoring**: System status, API connectivity, and performance metrics
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices

## 🏗️ Architecture

### Backend (Python + FastAPI)
```
backend/
├── main.py              # FastAPI application with async endpoints
├── config.py            # Pydantic-based configuration management
├── data_ingestion.py    # Multi-source data collection service
├── sentiment_analysis.py # DistilBERT-powered sentiment analysis
├── forecasting.py       # Facebook Prophet forecasting engine
└── ai_agent.py          # LangChain + OpenAI response generation
```

### Frontend (React + Vite)
```
echosense-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Main dashboard layout
│   └── services/       # API integration and mock data
├── tailwind.config.js  # Tailwind CSS configuration
└── vite.config.js      # Vite build configuration
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- API Keys for Reddit, YouTube, NewsAPI, and OpenAI

### 1. Backend Setup
```bash
# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys

# Start the backend server
python run_backend.py
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd echosense-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Access the Application
- **Frontend Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📡 API Endpoints

### Core Endpoints
- `GET /api/health` - System health check
- `GET /api/stats` - Current sentiment statistics
- `GET /api/feed` - Real-time sentiment feed
- `GET /api/trends` - Historical trend data for charts
- `GET /api/forecast` - 48-hour sentiment predictions
- `GET /api/ai-responses` - Recent AI-generated responses
- `POST /api/ai-responses/generate` - Trigger AI response generation

## 🛠️ Technology Stack

### Backend Technologies
- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and settings management
- **SQLAlchemy**: Database ORM with async support
- **Hugging Face Transformers**: Advanced NLP models
- **Facebook Prophet**: Time series forecasting
- **LangChain**: LLM orchestration framework
- **OpenAI GPT**: AI response generation
- **PRAW**: Reddit API wrapper
- **Google APIs**: YouTube Data API integration

### Frontend Technologies
- **React 19**: Modern UI framework
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Three.js**: 3D graphics and animations
- **Chart.js**: Interactive data visualizations
- **GSAP**: Advanced animation library
- **Lucide React**: Beautiful icon library

## 🔧 Configuration

### Environment Variables
```bash
# API Keys
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_api_key

# Brand Configuration
TARGET_BRAND=Tesla,YourBrand
SUBREDDITS=technology,news,cars
NEWS_KEYWORDS=Tesla,electric vehicle

# System Configuration
BACKEND_PORT=8000
COLLECTION_INTERVAL=120
SENTIMENT_MODEL=distilbert-base-uncased-finetuned-sst-2-english
```

## 📊 Features in Action

### Real-Time Dashboard
- Live sentiment feed with color-coded indicators
- Interactive trend charts with historical data
- Weather-style 48-hour sentiment forecasts
- AI response management interface

### Data Collection
- Continuous monitoring of Reddit, YouTube, and News sources
- Intelligent brand mention detection
- Automatic deduplication and data validation
- Robust error handling and retry mechanisms

### Sentiment Analysis
- Advanced DistilBERT model for accurate sentiment classification
- Confidence scoring for prediction reliability
- Batch processing for efficient analysis
- Fallback to keyword-based analysis when needed

### Predictive Analytics
- Facebook Prophet for time series forecasting
- 48-hour sentiment predictions with confidence intervals
- Trend analysis and anomaly detection
- Weather-style forecast visualization

### AI Response Generation
- Automated detection of negative sentiment posts
- Context-aware response generation using OpenAI GPT
- Quality scoring and brand voice consistency
- Manual review and approval workflow

## 🔒 Security & Privacy

- **API Key Management**: Secure environment variable handling
- **Rate Limiting**: Automatic throttling to respect API limits
- **Data Validation**: Input sanitization and validation
- **Error Handling**: Comprehensive error recovery mechanisms
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 📈 Performance & Scalability

- **Async Architecture**: Non-blocking I/O for high performance
- **Background Processing**: Continuous data collection without blocking
- **Efficient Caching**: Smart caching strategies for API responses
- **Database Optimization**: Indexed queries and connection pooling
- **Horizontal Scaling**: Designed for multi-instance deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for the DistilBERT sentiment analysis model
- **Facebook** for the Prophet forecasting library
- **OpenAI** for GPT-based response generation
- **Reddit, YouTube, NewsAPI** for data source APIs
- **React, FastAPI, and the open-source community**

---

**EchoSense** - Transforming brand perception monitoring with AI-powered insights and real-time analytics.
