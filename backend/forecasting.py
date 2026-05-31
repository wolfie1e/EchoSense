"""
Forecasting Service for EchoSense
Uses Facebook Prophet for time series forecasting of sentiment trends.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from prophet import Prophet
import aiosqlite

from .config import settings

logger = logging.getLogger(__name__)


class ForecastingService:
    """Service for generating sentiment forecasts using Prophet."""
    
    def __init__(self):
        self.db_path = "echosense.db"
        self.model: Optional[Prophet] = None
        self.last_training_time: Optional[datetime] = None
        self.training_interval = timedelta(hours=6)  # Retrain every 6 hours
        
    async def initialize(self):
        """Initialize the forecasting service."""
        logger.info("Initializing Forecasting Service...")
        
        try:
            # Train initial model
            await self.train_model()
            logger.info("Forecasting Service initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Forecasting Service: {e}")
            # Don't raise - service can work with fallback predictions
            logger.warning("Using fallback forecasting mode")
    
    async def train_model(self):
        """Train the Prophet model with historical data."""
        logger.info("Training forecasting model...")
        
        try:
            # Get historical sentiment data
            historical_data = await self.get_historical_sentiment_data()
            
            if len(historical_data) < 10:  # Need minimum data points
                logger.warning("Insufficient historical data for training. Using fallback mode.")
                return
            
            # Prepare data for Prophet
            df = pd.DataFrame(historical_data)
            df['ds'] = pd.to_datetime(df['timestamp'])
            df['y'] = df['sentiment_score']
            
            # Create and train model
            self.model = Prophet(
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=False,
                interval_width=settings.confidence_interval,
                changepoint_prior_scale=0.05,  # More flexible to trend changes
                seasonality_prior_scale=10.0,  # More flexible to seasonality
            )
            
            # Run training in executor to avoid blocking
            await asyncio.get_event_loop().run_in_executor(
                None, self.model.fit, df
            )
            
            self.last_training_time = datetime.utcnow()
            logger.info("Model training completed successfully")
            
        except Exception as e:
            logger.error(f"Error training model: {e}")
            self.model = None
    
    async def get_historical_sentiment_data(self) -> List[Dict[str, Any]]:
        """Get historical sentiment data for training."""
        async with aiosqlite.connect(self.db_path) as db:
            # Get hourly sentiment averages for the last 30 days
            cursor = await db.execute("""
                SELECT 
                    strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
                    AVG(CASE 
                        WHEN sentiment = 'positive' THEN 1.0
                        WHEN sentiment = 'negative' THEN -1.0
                        ELSE 0.0
                    END) as sentiment_score,
                    COUNT(*) as count
                FROM posts 
                WHERE timestamp > datetime('now', '-30 days') 
                AND sentiment IS NOT NULL
                GROUP BY hour
                HAVING count >= 3  -- Only include hours with sufficient data
                ORDER BY hour
            """)
            
            rows = await cursor.fetchall()
            
            return [
                {
                    'timestamp': row[0],
                    'sentiment_score': row[1],
                    'count': row[2]
                }
                for row in rows
            ]
    
    async def generate_forecast(self) -> Dict[str, Any]:
        """Generate 48-hour sentiment forecast."""
        try:
            # Check if model needs retraining
            if (self.last_training_time is None or 
                datetime.utcnow() - self.last_training_time > self.training_interval):
                await self.train_model()
            
            if self.model is None:
                return await self.generate_fallback_forecast()
            
            # Create future dataframe
            future_periods = settings.forecast_hours
            future = self.model.make_future_dataframe(periods=future_periods, freq='H')
            
            # Generate forecast
            forecast = await asyncio.get_event_loop().run_in_executor(
                None, self.model.predict, future
            )
            
            # Get the forecast for the next 48 hours
            future_forecast = forecast.tail(future_periods)
            
            # Analyze forecast
            avg_forecast = future_forecast['yhat'].mean()
            trend_direction = self.analyze_trend(future_forecast['yhat'].values)
            confidence_score = self.calculate_confidence(future_forecast)
            
            # Determine overall sentiment
            if avg_forecast > 0.2:
                sentiment = 'positive'
                confidence_level = 'High' if confidence_score > 0.7 else 'Medium'
            elif avg_forecast < -0.2:
                sentiment = 'negative'
                confidence_level = 'High' if confidence_score > 0.7 else 'Medium'
            else:
                sentiment = 'neutral'
                confidence_level = 'Medium'
            
            # Generate summary
            summary = self.generate_forecast_summary(sentiment, trend_direction, avg_forecast)
            
            return {
                'sentiment': sentiment,
                'confidence': confidence_level,
                'summary': summary,
                'trend_direction': trend_direction,
                'confidence_score': float(confidence_score),
                'forecast_data': {
                    'timestamps': future_forecast.index.tolist(),
                    'values': future_forecast['yhat'].tolist(),
                    'lower_bound': future_forecast['yhat_lower'].tolist(),
                    'upper_bound': future_forecast['yhat_upper'].tolist()
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating forecast: {e}")
            return await self.generate_fallback_forecast()
    
    async def generate_fallback_forecast(self) -> Dict[str, Any]:
        """Generate a simple fallback forecast when Prophet model is unavailable."""
        logger.info("Generating fallback forecast...")
        
        try:
            # Get recent sentiment trend
            async with aiosqlite.connect(self.db_path) as db:
                cursor = await db.execute("""
                    SELECT 
                        AVG(CASE 
                            WHEN sentiment = 'positive' THEN 1.0
                            WHEN sentiment = 'negative' THEN -1.0
                            ELSE 0.0
                        END) as avg_sentiment,
                        COUNT(*) as total_count
                    FROM posts 
                    WHERE timestamp > datetime('now', '-24 hours') 
                    AND sentiment IS NOT NULL
                """)
                
                row = await cursor.fetchone()
                avg_sentiment = row[0] if row[0] is not None else 0.0
                total_count = row[1]
            
            # Determine forecast based on recent trend
            if total_count < 10:
                # Insufficient data
                return {
                    'sentiment': 'neutral',
                    'confidence': 'Low',
                    'summary': 'Insufficient data for reliable forecast. Neutral sentiment expected.',
                    'trend_direction': 'stable',
                    'confidence_score': 0.3
                }
            
            if avg_sentiment > 0.1:
                sentiment = 'positive'
                confidence = 'Medium'
                trend = 'improving'
            elif avg_sentiment < -0.1:
                sentiment = 'negative'
                confidence = 'Medium'
                trend = 'declining'
            else:
                sentiment = 'neutral'
                confidence = 'Medium'
                trend = 'stable'
            
            summary = f"Based on recent trends, {sentiment} sentiment is expected to continue over the next 48 hours."
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'summary': summary,
                'trend_direction': trend,
                'confidence_score': 0.6
            }
            
        except Exception as e:
            logger.error(f"Error generating fallback forecast: {e}")
            return {
                'sentiment': 'neutral',
                'confidence': 'Low',
                'summary': 'Unable to generate forecast due to data issues.',
                'trend_direction': 'stable',
                'confidence_score': 0.2
            }
    
    def analyze_trend(self, values: np.ndarray) -> str:
        """Analyze trend direction from forecast values."""
        if len(values) < 2:
            return 'stable'
        
        # Calculate trend using linear regression
        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]
        
        if slope > 0.05:
            return 'improving'
        elif slope < -0.05:
            return 'declining'
        else:
            return 'stable'
    
    def calculate_confidence(self, forecast_df: pd.DataFrame) -> float:
        """Calculate confidence score based on forecast uncertainty."""
        # Use the width of confidence intervals as uncertainty measure
        uncertainty = (forecast_df['yhat_upper'] - forecast_df['yhat_lower']).mean()
        
        # Convert to confidence score (lower uncertainty = higher confidence)
        confidence = max(0.0, min(1.0, 1.0 - (uncertainty / 2.0)))
        
        return confidence
    
    def generate_forecast_summary(self, sentiment: str, trend: str, avg_value: float) -> str:
        """Generate human-readable forecast summary."""
        trend_phrases = {
            'improving': 'an improving trend',
            'declining': 'a declining trend',
            'stable': 'stable conditions'
        }
        
        sentiment_phrases = {
            'positive': 'positive sentiment',
            'negative': 'negative sentiment',
            'neutral': 'neutral sentiment'
        }
        
        intensity = abs(avg_value)
        if intensity > 0.5:
            strength = 'strong'
        elif intensity > 0.2:
            strength = 'moderate'
        else:
            strength = 'mild'
        
        return (f"Forecast indicates {strength} {sentiment_phrases[sentiment]} with "
                f"{trend_phrases[trend]} expected over the next 48 hours.")
    
    async def get_anomaly_detection(self) -> List[Dict[str, Any]]:
        """Detect anomalies in recent sentiment data."""
        # This would implement anomaly detection logic
        # For now, return empty list
        return []
    
    async def cleanup(self):
        """Cleanup resources."""
        self.model = None
        logger.info("Forecasting Service cleaned up")
