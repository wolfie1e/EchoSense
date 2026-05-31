"""
EchoSense Backend Main Application
FastAPI-based REST API for brand perception analysis.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .config import settings
from .data_ingestion import DataIngestionService
from .sentiment_analysis import SentimentAnalysisService
from .advanced_sentiment import AdvancedSentimentService
from .crisis_detection import CrisisDetectionService
from .topic_modeling import TopicModelingService
from .forecasting import ForecastingService

# Temporarily disable AI agent due to httpx version conflict
try:
    from .ai_agent import AIAgentService
    AI_AGENT_AVAILABLE = True
except ImportError as e:
    logger.warning(f"AI Agent service not available: {e}")
    AIAgentService = None
    AI_AGENT_AVAILABLE = False

# Configure logging
logger = logging.getLogger(__name__)

# Global service instances
data_service: Optional[DataIngestionService] = None
sentiment_service: Optional[SentimentAnalysisService] = None
advanced_sentiment_service: Optional[AdvancedSentimentService] = None
crisis_service: Optional[CrisisDetectionService] = None
topic_service: Optional[TopicModelingService] = None
forecast_service: Optional[ForecastingService] = None
ai_service: Optional[AIAgentService] = None

# Background task for continuous data collection
background_task: Optional[asyncio.Task] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    global data_service, sentiment_service, advanced_sentiment_service, crisis_service, topic_service, forecast_service, ai_service, background_task

    logger.info("Starting EchoSense Backend Services...")

    try:
        # Initialize services
        data_service = DataIngestionService()
        sentiment_service = SentimentAnalysisService()
        advanced_sentiment_service = AdvancedSentimentService()
        crisis_service = CrisisDetectionService()
        topic_service = TopicModelingService()
        forecast_service = ForecastingService()

        if AI_AGENT_AVAILABLE:
            ai_service = AIAgentService()
        else:
            ai_service = None

        # Initialize services
        await data_service.initialize()
        await sentiment_service.initialize()
        await advanced_sentiment_service.initialize()
        await crisis_service.initialize()
        await topic_service.initialize()
        await forecast_service.initialize()

        if ai_service:
            await ai_service.initialize()

        # Start background data collection and monitoring
        background_task = asyncio.create_task(continuous_monitoring())

        logger.info("All services initialized successfully")

        yield

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise
    finally:
        # Cleanup
        logger.info("Shutting down EchoSense Backend Services...")

        if background_task:
            background_task.cancel()
            try:
                await background_task
            except asyncio.CancelledError:
                pass

        # Cleanup services
        if data_service:
            await data_service.cleanup()
        if sentiment_service:
            await sentiment_service.cleanup()
        if advanced_sentiment_service:
            await advanced_sentiment_service.cleanup()
        if crisis_service:
            await crisis_service.cleanup()
        if topic_service:
            await topic_service.cleanup()
        if forecast_service:
            await forecast_service.cleanup()
        if ai_service:
            await ai_service.cleanup()


# Create FastAPI application
app = FastAPI(
    title="EchoSense API",
    description="Advanced Brand Perception Analysis System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API responses
class StatsResponse(BaseModel):
    total_mentions: int
    positive: float
    negative: float
    neutral: float
    last_updated: datetime


class FeedItem(BaseModel):
    id: str
    source: str
    sentiment: str
    confidence: float
    text: str
    timestamp: datetime
    url: Optional[str] = None


class TrendData(BaseModel):
    labels: List[str]
    datasets: List[Dict]


class ForecastResponse(BaseModel):
    sentiment: str
    confidence: str
    summary: str
    trend_direction: str
    confidence_score: float


class AIResponse(BaseModel):
    id: str
    response: str
    target_post: Optional[str] = None
    quality_score: float
    timestamp: datetime


class EmotionData(BaseModel):
    emotions: Dict[str, float]
    dominant_emotion: str
    confidence: float
    timestamp: datetime


class TopicData(BaseModel):
    topic_id: int
    keywords: List[str]
    doc_count: int
    avg_sentiment: float
    sentiment_distribution: Dict[str, float]


class AlertData(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    description: str
    timestamp: datetime
    value: Optional[float] = None
    threshold: Optional[float] = None
    source: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]
    version: str


async def continuous_monitoring():
    """Background task for continuous data collection and monitoring."""
    logger.info("Starting continuous monitoring...")

    while True:
        try:
            # Data collection cycle
            if data_service and advanced_sentiment_service:
                # Collect new data
                new_data = await data_service.collect_all_sources()

                if new_data:
                    # Enhanced analysis with language and emotion detection
                    analyzed_data = []
                    for item in new_data:
                        analysis = await advanced_sentiment_service.analyze_with_language_and_emotion(item['content'])

                        # Merge analysis results with original item
                        enhanced_item = {**item, **analysis}
                        analyzed_data.append(enhanced_item)

                    # Store analyzed data
                    await data_service.store_analyzed_data(analyzed_data)

                    logger.info(f"Processed {len(analyzed_data)} new items with enhanced analysis")

            # Crisis detection cycle (every 5 minutes)
            if crisis_service:
                alerts = await crisis_service.detect_anomalies()
                if alerts:
                    logger.info(f"Detected {len(alerts)} new alerts")

            # Topic extraction cycle (every 30 minutes)
            current_minute = datetime.utcnow().minute
            if topic_service and current_minute % 30 == 0:
                await topic_service.extract_topics()
                logger.info("Topic extraction completed")

            # Wait for next monitoring cycle
            await asyncio.sleep(settings.collection_interval)

        except asyncio.CancelledError:
            logger.info("Monitoring task cancelled")
            break
        except Exception as e:
            logger.error(f"Error in monitoring: {e}")
            # Continue after error, wait a bit longer
            await asyncio.sleep(60)


# API Endpoints
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """System health check endpoint."""
    services_status = {
        "data_ingestion": "healthy" if data_service else "unavailable",
        "sentiment_analysis": "healthy" if sentiment_service else "unavailable",
        "advanced_sentiment": "healthy" if advanced_sentiment_service else "unavailable",
        "crisis_detection": "healthy" if crisis_service else "unavailable",
        "topic_modeling": "healthy" if topic_service else "unavailable",
        "forecasting": "healthy" if forecast_service else "unavailable",
        "ai_agent": "healthy" if ai_service else "disabled",
    }
    
    overall_status = "healthy" if all(
        status == "healthy" for status in services_status.values()
    ) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        services=services_status,
        version="1.0.0"
    )


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get current sentiment statistics."""
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service unavailable")
    
    try:
        stats = await data_service.get_current_stats()
        return StatsResponse(**stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")


@app.get("/api/feed", response_model=List[FeedItem])
async def get_feed(limit: int = 20):
    """Get real-time sentiment feed data."""
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service unavailable")
    
    try:
        feed_data = await data_service.get_recent_feed(limit=limit)
        return [FeedItem(**item) for item in feed_data]
    except Exception as e:
        logger.error(f"Error getting feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve feed")


@app.get("/api/trends", response_model=TrendData)
async def get_trends(hours: int = 24):
    """Get historical trend data for charts."""
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service unavailable")
    
    try:
        trend_data = await data_service.get_trend_data(hours=hours)
        return TrendData(**trend_data)
    except Exception as e:
        logger.error(f"Error getting trends: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve trends")


@app.get("/api/forecast", response_model=ForecastResponse)
async def get_forecast():
    """Get 48-hour sentiment predictions."""
    if not forecast_service:
        raise HTTPException(status_code=503, detail="Forecast service unavailable")
    
    try:
        forecast = await forecast_service.generate_forecast()
        return ForecastResponse(**forecast)
    except Exception as e:
        logger.error(f"Error getting forecast: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate forecast")


@app.get("/api/ai-responses", response_model=List[AIResponse])
async def get_ai_responses(limit: int = 10):
    """Get recent AI-generated responses."""
    if not ai_service:
        raise HTTPException(status_code=503, detail="AI service unavailable")
    
    try:
        responses = await ai_service.get_recent_responses(limit=limit)
        return [AIResponse(**response) for response in responses]
    except Exception as e:
        logger.error(f"Error getting AI responses: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve AI responses")


@app.post("/api/ai-responses/generate")
async def generate_ai_response(background_tasks: BackgroundTasks):
    """Trigger AI response generation."""
    if not ai_service or not data_service:
        raise HTTPException(status_code=503, detail="Required services unavailable")
    
    try:
        # Get recent negative sentiment posts
        negative_posts = await data_service.get_negative_posts(limit=5)
        
        if not negative_posts:
            return JSONResponse(
                content={"message": "No negative posts found to respond to"},
                status_code=200
            )
        
        # Generate responses in background
        background_tasks.add_task(ai_service.generate_responses_for_posts, negative_posts)
        
        return JSONResponse(
            content={"message": f"AI response generation started for {len(negative_posts)} posts"},
            status_code=202
        )
        
    except Exception as e:
        logger.error(f"Error triggering AI response generation: {e}")
        raise HTTPException(status_code=500, detail="Failed to trigger AI response generation")


# New Advanced API Endpoints

@app.get("/api/emotions", response_model=EmotionData)
async def get_emotions():
    """Get current emotion distribution from recent posts."""
    if not advanced_sentiment_service:
        raise HTTPException(status_code=503, detail="Advanced sentiment service unavailable")

    try:
        # Mock emotion data for now - would be calculated from recent posts
        emotions = {
            'joy': 0.35,
            'sadness': 0.15,
            'anger': 0.10,
            'fear': 0.08,
            'surprise': 0.20,
            'disgust': 0.12
        }

        dominant_emotion = max(emotions, key=emotions.get)

        return EmotionData(
            emotions=emotions,
            dominant_emotion=dominant_emotion,
            confidence=emotions[dominant_emotion],
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        logger.error(f"Error getting emotions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve emotion data")


@app.get("/api/topics", response_model=List[TopicData])
async def get_topics(limit: int = 10):
    """Get current trending topics."""
    if not topic_service:
        raise HTTPException(status_code=503, detail="Topic service unavailable")

    try:
        topics = await topic_service.get_trending_topics(limit=limit)
        return [TopicData(**topic) for topic in topics]
    except Exception as e:
        logger.error(f"Error getting topics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve topics")


@app.get("/api/alerts", response_model=List[AlertData])
async def get_alerts(limit: int = 10):
    """Get active alerts."""
    if not crisis_service:
        raise HTTPException(status_code=503, detail="Crisis service unavailable")

    try:
        alerts = await crisis_service.get_active_alerts(limit=limit)
        return [AlertData(**alert) for alert in alerts]
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve alerts")


@app.post("/api/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert."""
    if not crisis_service:
        raise HTTPException(status_code=503, detail="Crisis service unavailable")

    try:
        success = await crisis_service.acknowledge_alert(alert_id)
        if success:
            return {"message": "Alert acknowledged successfully"}
        else:
            raise HTTPException(status_code=404, detail="Alert not found")
    except Exception as e:
        logger.error(f"Error acknowledging alert: {e}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge alert")


@app.get("/api/brand-health")
async def get_brand_health():
    """Get real-time brand health score with detailed breakdown."""
    if not data_service:
        raise HTTPException(status_code=503, detail="Data service unavailable")

    try:
        stats = await data_service.get_current_stats()

        # Enhanced brand health calculation
        positive = stats.get('positive', 0)
        negative = stats.get('negative', 0)
        neutral = stats.get('neutral', 0)
        total_mentions = stats.get('total_mentions', 0)

        # Base score from sentiment distribution
        base_score = positive * 1.0 + neutral * 0.5 + negative * 0.0

        # Engagement boost (more mentions = more visibility)
        engagement_boost = min(total_mentions / 100, 20)

        # Volatility penalty (high negative sentiment is bad)
        volatility_penalty = max(0, negative - 30) * 0.5

        # Calculate final health score
        health_score = max(0, min(100, base_score + engagement_boost - volatility_penalty))

        # Determine health status
        if health_score >= 80:
            status = "excellent"
            trend = "improving"
        elif health_score >= 60:
            status = "good"
            trend = "stable"
        elif health_score >= 40:
            status = "fair"
            trend = "declining"
        else:
            status = "critical"
            trend = "declining"

        return {
            "health_score": round(health_score, 1),
            "status": status,
            "trend": trend,
            "contributing_factors": {
                "sentiment_distribution": {"positive": positive, "negative": negative, "neutral": neutral},
                "engagement_level": total_mentions,
                "volatility": negative
            },
            "timestamp": datetime.utcnow()
        }

    except Exception as e:
        logger.error(f"Error getting brand health: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve brand health")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "EchoSense API",
        "version": "1.0.0",
        "description": "Advanced Brand Perception Analysis System",
        "docs": "/docs",
        "health": "/api/health",
        "new_features": [
            "Multi-language sentiment analysis",
            "Emotion classification",
            "Topic modeling and trending",
            "Crisis detection and alerts",
            "Enhanced brand health scoring"
        ]
    }
